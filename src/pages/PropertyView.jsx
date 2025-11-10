// src/pages/PropertyView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../firebase/config";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  where,
  query,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

const FUNCTION_BASE = "https://europe-west1-velvetframedb.cloudfunctions.net";

/* Inline image loader — geen extra bestand nodig */
function InlineImage({ src, alt = "image" }) {
  const [state, setState] = useState({ url: null, error: false });

  useEffect(() => {
    let active = true;
    async function resolve() {
      try {
        if (!src) { if (active) setState({ url: null, error: true }); return; }
        const s = String(src);

        // directe URL
        if (/^https?:\/\//i.test(s)) {
          if (active) setState({ url: s, error: false });
          return;
        }
        // gs://bucket/path of relatieve storage path
        const clean = s.replace(/^gs:\/\/[^/]+\//, "");
        const r = ref(storage, clean);
        const dl = await getDownloadURL(r);
        if (active) setState({ url: dl, error: false });
      } catch (e) {
        console.error("PropertyView InlineImage failed:", src, e);
        if (active) setState({ url: null, error: true });
      }
    }
    setState({ url: null, error: false });
    resolve();
    return () => { active = false; };
  }, [src]);

  if (!state.url && !state.error) return <div className="media skeleton" aria-label="loading image" />;

  if (state.error) {
    return (
      <div className="media" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        No image
      </div>
    );
  }

  return (
    <div className="media">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={state.url} alt={alt} loading="lazy" />
    </div>
  );
}

// pak bruikbare URL/Pad uit output entry (string of object)
function pickOutputSrc(entry) {
  if (!entry) return "";
  if (typeof entry === "string") return entry;
  return (
    entry.downloadURL ||
    entry.url ||
    entry.href ||
    entry.src ||
    entry.storagePath ||
    entry.fullPath ||
    entry.path ||
    ""
  );
}

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
        const refDoc = doc(db, "properties", id);
        const snap = await getDoc(refDoc);
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
    const qRef = query(collection(db, "ai_generations"), where("propertyId", "==", id));
    const unsub = onSnapshot(qRef, (snap) => {
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
      // onSnapshot pakt updates op
    } catch (e) {
      console.error(e);
      setError("Generating failed.");
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div className="between" style={{ marginBottom: 12 }}>
        <h1 className="headline" style={{ fontSize: 28, margin: 0 }}>
          Property: {prop?.title || "(untitled)"}
        </h1>
        <div className="muted">Location: {prop?.location || "—"}</div>
      </div>

      {photos.length > 0 && (
        <>
          <h3 className="headline" style={{ marginTop: 8, marginBottom: 8, fontSize: 20 }}>Uploaded photos</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {photos.map((p, i) => {
              const src =
                (typeof p === "string" ? p :
                  p.downloadURL || p.url || p.href || p.src || p.storagePath || p.fullPath || p.path || "");
              return (
                <div
                  key={(p.url || p.name || "") + i}
                  className="card"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <InlineImage src={src} alt={p.name || `photo-${i}`} />
                  <div className="muted" style={{ padding: 8, fontSize: 12 }}>
                    {p.name || "photo"}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="row" style={{ marginBottom: 12 }}>
        <button
          onClick={handleGenerate}
          disabled={triggering}
          className="btn btn-primary"
          style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600 }}
        >
          {triggering ? "Generating…" : "Generate Visual"}
        </button>
        {msg && <span className="badge">{msg}</span>}
        {error && <span className="badge" style={{ borderColor: "rgba(255,0,0,0.35)" }}>Error</span>}
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 className="headline" style={{ marginBottom: 8, fontSize: 20 }}>AI generations</h3>

        {!latest ? (
          <div className="muted">No generations yet.</div>
        ) : (
          <div className="card panel-outline" style={{ borderRadius: 12, padding: 12 }}>
            <div className="row" style={{ marginBottom: 8 }}>
              <span className="label">Status:</span>
              <span className="badge">{latest.status || "unknown"}</span>
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
                {latest.outputs.map((entry, i) => {
                  const src = pickOutputSrc(entry);
                  return (
                    <a
                      key={(typeof entry === "string" ? entry : src) + i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "block",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <InlineImage src={src} alt={`generation-${i}`} />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="muted">Waiting for outputs…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
