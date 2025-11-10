// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

/* Inline image loader — met vaste hoogte */
function InlineImage({ src, alt = "Property", height = 200 }) {
  const [state, setState] = useState({ url: null, error: false });

  useEffect(() => {
    let active = true;

    async function resolve() {
      try {
        if (!src) { if (active) setState({ url: null, error: true }); return; }
        const s = String(src);

        if (/^https?:\/\//i.test(s)) { // directe URL
          if (active) setState({ url: s, error: false });
          return;
        }

        // gs://bucket/path of relatieve storage path
        const clean = s.replace(/^gs:\/\/[^/]+\//, "");
        const r = ref(storage, clean);
        const dl = await getDownloadURL(r);
        if (active) setState({ url: dl, error: false });
      } catch (e) {
        console.error("Dashboard InlineImage failed:", src, e);
        if (active) setState({ url: null, error: true });
      }
    }

    setState({ url: null, error: false });
    resolve();
    return () => { active = false; };
  }, [src]);

  // Skeleton tijdens load
  if (!state.url && !state.error) {
    return <div className="media skeleton" style={{ height }} aria-label="loading image" />;
  }

  // Netjes fallback bij fout
  if (state.error) {
    return (
      <div
        className="media"
        style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}
      >
        No image
      </div>
    );
  }

  // Consistente hoogte + object-fit cover
  return (
    <div className="media" style={{ height, overflow: "hidden" }}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        src={state.url}
        alt={alt}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ENIGE WIJZIGING: filter op ownerId == currentUser.uid
  useEffect(() => {
    let stopAuth = () => {};
    let unsub = () => {};
    setLoading(true);

    stopAuth = auth.onAuthStateChanged((u) => {
      // detach vorige listener
      if (typeof unsub === "function") unsub();

      if (!u) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const colRef = collection(db, "properties");
      const qRef = query(colRef, where("ownerId", "==", u.uid));

      unsub = onSnapshot(
        qRef,
        (snap) => {
          const rows = [];
          snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
          rows.sort((a, b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0));
          setProperties(rows);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
    });

    return () => {
      if (typeof unsub === "function") unsub();
      if (typeof stopAuth === "function") stopAuth();
    };
  }, []);

  const sorted = useMemo(() => {
    return [...properties].sort((a, b) => {
      const ta = a?.createdAt?.seconds || 0;
      const tb = b?.createdAt?.seconds || 0;
      return tb - ta;
    });
  }, [properties]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      <div className="between">
        <h1 className="headline" style={{ fontSize: 28, margin: 0 }}>Dashboard</h1>
        <button
          onClick={() => navigate("/upload")}
          className="btn btn-primary"
          style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600 }}
        >
          + New property
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 16, opacity: 0.85 }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <div className="card panel-outline" style={{ borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>No properties yet</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              Click <b>New property</b> to start uploading.
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="btn btn-primary"
              style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600, marginTop: 8 }}
            >
              Upload property
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {sorted.map((p) => {
            // Dek meerdere vormen af: url | downloadURL | path | fullPath | gs://...
            const first = Array.isArray(p?.photos) && p.photos.length ? p.photos[0] : null;
            const cover =
              (typeof first === "string" ? first : (
                first?.downloadURL || first?.url || first?.href || first?.src || first?.storagePath || first?.fullPath || first?.path || ""
              ));

            const photoCount = Array.isArray(p?.photos) ? p.photos.length : 0;

            return (
              <div
                key={p.id}
                className="card panel-outline"
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: "pointer" }}>
                  <InlineImage src={cover} alt={p.title || "Property"} height={200} />
                </div>

                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: "pointer" }}>
                    <div style={{ fontWeight: 700 }}>{p.title || "Untitled"}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.location || "Unknown location"}</div>
                  </div>

                  <div className="row">
                    <span className="badge">{p.status || "unknown"}</span>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  <div className="row" style={{ marginTop: 4 }}>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="btn btn-primary"
                      style={{ borderRadius: 10, fontWeight: 600 }}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="btn"
                      style={{ borderRadius: 10, fontWeight: 600, opacity: 0.95 }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
