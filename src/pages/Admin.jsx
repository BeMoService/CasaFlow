// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { getStorage, getDownloadURL, ref } from "firebase/storage";

/* Badge (klein chipje) */
function Badge({ children }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        opacity: 0.95,
      }}
    >
      {children}
    </span>
  );
}

/* Inline image loader (geen extra bestand nodig)
   - Accepteert https://, gs:// of storage-paden
   - Toont skeleton tot URL resolved is
*/
function InlineImage({ src, alt = "AI output" }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!src) { setUrl(null); return; }
      const str = String(src);

      // Al een http(s) URL? direct tonen
      if (/^https?:\/\//i.test(str)) { setUrl(str); return; }

      // gs://bucket/path of een relatief storage pad → getDownloadURL
      try {
        const clean = str.replace(/^gs:\/\/[^/]+\//, ""); // strip bucket
        const r = ref(getStorage(), clean);
        const dl = await getDownloadURL(r);
        if (active) setUrl(dl);
      } catch (e) {
        console.error("InlineImage: failed to resolve", str, e);
        if (active) setUrl(null);
      }
    }
    run();
    return () => { active = false; };
  }, [src]);

  if (!url) return <div className="media skeleton" aria-label="loading image" />;
  return (
    <div className="media">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={url} alt={alt} loading="lazy" />
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [gens, setGens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const colRef = collection(db, "ai_generations");
    const unsub = onSnapshot(
      colRef,
      async (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        const withProps = await Promise.all(
          rows.map(async (r) => {
            if (r.propertyId) {
              try {
                const pd = await getDoc(doc(db, "properties", r.propertyId));
                return { ...r, propertyTitle: pd.exists() ? pd.data().title : null };
              } catch {
                return r;
              }
            }
            return r;
          })
        );
        setGens(withProps);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorter = (a, b) => (b?.createdAt?.seconds || 0) - (a?.createdAt?.seconds || 0);
    if (!term) return [...gens].sort(sorter);
    return gens
      .filter((g) => {
        const t = `${g.id} ${g.status || ""} ${g.propertyId || ""} ${g.propertyTitle || ""}`.toLowerCase();
        return t.includes(term);
      })
      .sort(sorter);
  }, [gens, q]);

  const setStatus = useCallback(async (id, next) => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "ai_generations", id), {
        status: next,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error(e);
      alert("Could not update status.");
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <h1 className="headline" style={{ fontSize: 28, margin: 0 }}>Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search by id, status, property…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              width: 320,
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.35)",
              color: "var(--text)",
            }}
          />
          <button
            onClick={() => navigate("/dashboard")}
            className="btn"
            style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600 }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ opacity: 0.85 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card panel-outline" style={{ borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>No generations found</h3>
          <p className="muted" style={{ marginTop: 6 }}>
            Start a generation from a property to see results here.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 8 }}>
          {filtered.map((g) => {
            const thumb =
              (Array.isArray(g.outputs) && (g.outputs[0]?.url || g.outputs[0])) ||
              g.outputUrl ||
              g.output ||
              g.storagePath ||
              "";

            return (
              <div
                key={g.id}
                className="card panel-outline"
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* MEDIA */}
                <InlineImage src={thumb} alt="AI output" />

                {/* META */}
                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge>{g.status || "unknown"}</Badge>
                    {g.propertyId && (
                      <button
                        onClick={() => navigate(`/property/${g.propertyId}`)}
                        className="btn"
                        style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}
                      >
                        Open property
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    <div><span className="label">ID:</span> {g.id}</div>
                    <div><span className="label">Property:</span> {g.propertyTitle ? g.propertyTitle : g.propertyId || "-"}</div>
                  </div>

                  <div className="row" style={{ marginTop: 4 }}>
                    <button
                      disabled={busyId === g.id}
                      onClick={() => setStatus(g.id, "approved")}
                      className="btn btn-primary"
                      style={{ borderRadius: 10, fontWeight: 600, cursor: busyId === g.id ? "not-allowed" : "pointer" }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === g.id}
                      onClick={() => setStatus(g.id, "rejected")}
                      className="btn"
                      style={{ borderRadius: 10, fontWeight: 600, opacity: 0.95 }}
                    >
                      Reject
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
