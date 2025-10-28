// src/pages/PropertyView.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  connectStorageEmulator,
} from "firebase/storage";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

// helper om 1x status te refreshen
async function fetchGenOnce(db, id, storage, setGen, setImageUrls) {
  if (!id) return;
  const snap = await getDoc(doc(db, "ai_generations", id));
  if (!snap.exists()) return;
  const data = snap.data();
  setGen({ id: snap.id, ...data });

  if (Array.isArray(data.outputs) && data.outputs.length > 0) {
    const urls = await Promise.all(
      data.outputs.map(async (o) => {
        try {
          return await getDownloadURL(ref(storage, o.storagePath));
        } catch {
          return null;
        }
      })
    );
    setImageUrls(urls.filter(Boolean));
  }
}

export default function PropertyView() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [gen, setGen] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // firebase setup (emulator connect)
  const app = getApp();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, "europe-west1");

  if (location.hostname === "localhost") {
    try {
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
      connectFunctionsEmulator(functions, "localhost", 5001);
    } catch (_) {}
  }

  // property ophalen
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "properties", id));
      if (snap.exists()) setProperty({ id: snap.id, ...snap.data() });
    })();
  }, [id]);

  // generatiedoc live volgen
  useEffect(() => {
    if (!gen?.id) return;
    const unsub = onSnapshot(doc(db, "ai_generations", gen.id), async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setGen({ id: snap.id, ...data });

      if (data.status === "completed" && Array.isArray(data.outputs)) {
        const urls = await Promise.all(
          data.outputs.map(async (o) => {
            try {
              return await getDownloadURL(ref(storage, o.storagePath));
            } catch {
              return null;
            }
          })
        );
        setImageUrls(urls.filter(Boolean));
      }
    });
    return () => unsub();
  }, [gen?.id]);

  // knop handler
  const startGeneration = async () => {
    setError("");
    setLoading(true);
    try {
      const fn = httpsCallable(functions, "createGenerationMock");
      const res = await fn({ propertyId: id });
      setGen({ id: res.data.generationId, status: "queued" });

      // lichte polling-fallback
      let ticks = 0;
      const iv = setInterval(async () => {
        ticks++;
        await fetchGenOnce(db, res.data.generationId, storage, setGen, setImageUrls);
        if (ticks >= 10) clearInterval(iv);
      }, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20, color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h1>Property: {property?.title || id}</h1>
      {property && <p>Locatie: {property.location}</p>}

      <button disabled={loading} onClick={startGeneration}>
        {loading ? "Bezig..." : "Generate Visual"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {gen && (
        <section style={{ marginTop: 20 }}>
          <p>Status: <b>{gen.status}</b></p>
          {gen.status === "processing" && <p>Mock draait... (10–20s)</p>}
          {gen.status === "completed" && <p>Klaar ✅</p>}
          <button
            onClick={() =>
              fetchGenOnce(db, gen.id, storage, setGen, setImageUrls)
            }
            style={{ marginTop: 10 }}
          >
            Refresh status
          </button>
        </section>
      )}

      {imageUrls.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2>Outputs</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Output ${i + 1}`}
                style={{ width: 200, borderRadius: 12, border: "1px solid #333" }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
