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
        if (!src) {
          if (active) setState({ url: null, error: true });
          return;
        }
        const s = String(src);

        if (/^https?:\/\//i.test(s)) {
          // directe URL
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
    return () => {
      active = false;
    };
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
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
        }}
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

  // filter op ownerId == currentUser.uid
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
          rows.sort(
            (a, b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0)
          );
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

  const total = sorted.length;

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "24px 16px 40px",
      }}
    >
      {/* Header / hero strip */}
      <header
        style={{
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: ".18em",
              opacity: 0.7,
            }}
          >
            CasaFlow
          </div>
          <h1
            style={{
              fontSize: 26,
              margin: "4px 0 2px",
              fontWeight: 900,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: 13,
              opacity: 0.78,
              margin: 0,
            }}
          >
            Overview of your properties and recent uploads.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/upload")}
            className="btn-primary"
            style={primaryBtnStyle}
          >
            + New property
          </button>
        </div>
      </header>

      {/* Status + counts panel */}
      <section style={statusPanelStyle}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
          }}
        >
          <span style={pillStyle}>Operational</span>
          <span style={{ ...pillStyle, borderColor: "rgba(248,113,113,0.45)" }}>
            EU-West
          </span>
          <span
            style={{
              ...pillStyle,
              borderColor: "rgba(248,113,113,0.45)",
              background: "rgba(15,23,42,0.9)",
            }}
          >
            Properties: <b style={{ marginLeft: 4 }}>{total}</b>
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            opacity: 0.75,
          }}
        >
          Tip: click any card to open the full property view.
        </div>
      </section>

      {/* Main content: empty state vs grid */}
      {loading ? (
        <div
          style={{
            marginTop: 20,
            fontSize: 14,
            opacity: 0.85,
          }}
        >
          Loading…
        </div>
      ) : total === 0 ? (
        <section style={emptyPanelStyle}>
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            No properties yet
          </h3>
          <p
            style={{
              margin: 0,
              marginBottom: 10,
              fontSize: 13,
              opacity: 0.8,
            }}
          >
            Upload your first listing to start generating CasaFlow visuals.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="btn-primary"
            style={primaryBtnStyle}
          >
            Upload property
          </button>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 16,
          }}
        >
          {sorted.map((p) => {
            // Dek meerdere vormen af: url | downloadURL | path | fullPath | gs://...
            const first =
              Array.isArray(p?.photos) && p.photos.length ? p.photos[0] : null;
            const cover =
              typeof first === "string"
                ? first
                : first?.downloadURL ||
                  first?.url ||
                  first?.href ||
                  first?.src ||
                  first?.storagePath ||
                  first?.fullPath ||
                  first?.path ||
                  "";

            const photoCount = Array.isArray(p?.photos) ? p.photos.length : 0;

            return (
              <article key={p.id} style={cardStyle}>
                <div
                  onClick={() => navigate(`/property/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <InlineImage
                    src={cover}
                    alt={p.title || "Property"}
                    height={190}
                  />
                </div>

                <div
                  style={{
                    padding: 12,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div
                    onClick={() => navigate(`/property/${p.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {p.title || "Untitled property"}
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 12, opacity: 0.8 }}
                    >
                      {p.location || "Unknown location"}
                    </div>
                  </div>

                  <div
                    className="row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 2,
                    }}
                  >
                    <span style={statusBadgeStyle}>
                      {p.status || "unknown"}
                    </span>
                    <span
                      className="muted"
                      style={{ fontSize: 12, opacity: 0.8 }}
                    >
                      {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  <div
                    className="row"
                    style={{
                      marginTop: 6,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="btn-primary"
                      style={{
                        ...primaryBtnStyle,
                        padding: "8px 12px",
                        fontSize: 13,
                      }}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="btn"
                      style={{
                        ...secondaryBtnStyle,
                        padding: "8px 12px",
                        fontSize: 13,
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

/* ====== Shared CasaFlow L2 styles (inline) ====== */

const primaryBtnStyle = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(248,113,113,0.9)", // rood
  background:
    "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.36), transparent 55%) rgba(30,7,7,1)",
  color: "#f9fafb",
  fontWeight: 700,
  fontSize: 14,
  boxShadow: "0 0 22px rgba(248,113,113,0.55)",
  transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.75)",
  background: "rgba(15,23,42,0.92)",
  color: "#e5e7eb",
  fontWeight: 600,
  fontSize: 14,
  transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
  cursor: "pointer",
};

const statusPanelStyle = {
  borderRadius: 16,
  border: "1px solid rgba(248,113,113,0.45)",
  background:
    "radial-gradient(circle at top left, rgba(248,113,113,0.22), transparent 55%) rgba(10,10,12,0.98)",
  padding: 16,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const emptyPanelStyle = {
  borderRadius: 16,
  border: "1px solid rgba(248,113,113,0.5)",
  background:
    "radial-gradient(circle at top left, rgba(248,113,113,0.20), transparent 55%) rgba(10,10,12,0.98)",
  padding: 20,
  marginTop: 20,
};

const cardStyle = {
  borderRadius: 16,
  border: "1px solid rgba(248,113,113,0.35)",
  background:
    "radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 55%) rgba(5,5,7,0.98)",
  boxShadow: "0 22px 60px rgba(0,0,0,0.85)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(248,113,113,0.7)",
  background: "rgba(127,29,29,0.7)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".12em",
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.75)",
  background: "rgba(15,23,42,0.9)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".10em",
};
