// src/pages/PropertyView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  where,
  query,
} from "firebase/firestore";

const FUNCTION_BASE = "https://europe-west1-velvetframedb.cloudfunctions.net";

export default function PropertyView() {
  const { id } = useParams();
  const [prop, setProp] = useState(null);
  const [gens, setGens] = useState([]);            // alle generations voor deze property
  const [latest, setLatest] = useState(null);      // nieuwste generation (client-side bepaald)
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Property laden
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ref = doc(db, "properties", id);
        const snap = await getDoc(ref);
        if (active) setProp(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        console.error(e);
        if (active) setError("Failed to load property.");
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Alle generations voor deze property volgen (zonder orderBy: we sorteren zelf)
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "ai_generations"), where("propertyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sorteer nieuwste eerst op updatedAt/createdAt fallback
      arr.sort((a, b) => {
        const ta =
          (a.updatedAt?.toMillis?.() || a.updatedAt?._seconds * 1000 || 0) ||
          (a.createdAt?.toMillis?.() || a.createdAt?._seconds * 1000 || 0);
        const tb =
          (b.updatedAt?.toMillis?.() || b.updatedAt?._seconds * 1000 || 0) ||
          (b.createdAt?.toMillis?.() || b.createdAt?._seconds * 1000 || 0);
        return tb - ta;
      });
      setGens(arr);
      setLatest(arr[0] || null);
    }, (err) => {
      console.error(err);
      setError("Listening to generations failed.");
    });
    return () => unsub();
  }, [id]);

  const photos = useMemo(
    () => (Array.isArray(prop?.photos) ? prop.photos : []),
    [prop]
  );

  async function handleGenerate() {
    setError("");
    setMsg("");
    setTriggering(true);
    try {
      const url = `${FUNCTION_BASE}/createGenerationMockHttp?propertyId=${encodeURIComponent(id)}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json().catch(() => ({}));
      setMsg(data?.ok ? "Generation started." : "Requested generation.");
      // onSnapshot pakt updates op; niets extra nodig
    } catch (e) {
      console.error(e);
      setError("Generating failed.");
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        Property: {prop?.title || "(untitled)"}
      </h1>
      <div style={{ marginBottom: 16, opacity: 0.9 }}>
        Location: {prop?.location || "—"}
      </div>

      {photos.length > 0 && (
        <>
          <h3 style={{ marginTop: 8, marginBottom: 8 }}>Uploaded photos</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {photos.map((p, i) => (
              <div
                key={(p.url || p.name || "") + i}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <img
                  src={p.url}
                  alt={p.name || `photo-${i}`}
                  style={{ width: "100%", height: 140, objectFit: "cover" }}
                />
                <div style={{ padding: 8, fontSize: 12, opacity: 0.8 }}>
                  {p.name || "photo"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={handleGenerate}
        disabled={triggering}
        className="button"
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          fontWeight: 600,
          marginBottom: 12,
          cursor: triggering ? "not-allowed" : "pointer",
        }}
      >
        {triggering ? "Generating…" : "Generate Visual"}
      </button>

      {msg && <div style={{ marginBottom: 8, opacity: 0.9 }}>{msg}</div>}
      {error && <div style={{ marginBottom: 8, color: "#ff6b6b" }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>AI generations</h3>

        {!latest ? (
          <div style={{ opacity: 0.85 }}>No generations yet.</div>
        ) : (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              Status:{" "}
              <b
                style={{
                  color:
                    latest.status === "done"
                      ? "#5eea9a"
                      : latest.status === "queued"
                      ? "#ffd166"
                      : "#a0a0a0",
                }}
              >
                {latest.status}
              </b>
            </div>

            {Array.isArray(latest.outputs) && latest.outputs.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {latest.outputs.map((url, i) => (
                  <a
                    key={url + i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={url}
                      alt={`generation-${i}`}
                      style={{ width: "100%", height: 200, objectFit: "cover" }}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.85 }}>Waiting for outputs…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
