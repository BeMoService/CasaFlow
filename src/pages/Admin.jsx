// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

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
        // Verrijk met property title (best effort)
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
    if (!term) return [...gens].sort(sorter);
    return gens
      .filter((g) => {
        const t =
          `${g.id} ${g.status || ""} ${g.propertyId || ""} ${g.propertyTitle || ""}`
            .toLowerCase();
        return t.includes(term);
      })
      .sort(sorter);
  }, [gens, q]);

  function sorter(a, b) {
    const ta = a?.createdAt?.seconds || 0;
    const tb = b?.createdAt?.seconds || 0;
    return tb - ta;
  }

  const setStatus = useCallback(async (id, next) => {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "ai_generations", id), {
        status: next,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error(e);
      alert("Kon status niet bijwerken.");
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 28 }}>Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Zoek op id, status, property…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              width: 280,
            }}
          />
          <button
            onClick={() => navigate("/dashboard")}
            className="button-secondary"
            style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}
          >
            Terug naar Dashboard
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ opacity: 0.85 }}>Laden…</div>
      ) : filtered.length === 0 ? (
        <div
          className="card"
          style={{ borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h3 style={{ marginTop: 0 }}>Geen generations gevonden</h3>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Start een generatie vanaf een property om hier resultaten te zien.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
            marginTop: 8,
          }}
        >
          {filtered.map((g) => {
            const thumb =
              (Array.isArray(g.outputs) && g.outputs[0]?.url) ||
              (Array.isArray(g.outputs) && g.outputs[0]) ||
              "";

            return (
              <div
                key={g.id}
                className="card"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    background: "#111",
                    overflow: "hidden",
                  }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt="AI output"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        opacity: 0.65,
                      }}
                    >
                      Geen preview
                    </div>
                  )}
                </div>

                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge>{g.status || "onbekend"}</Badge>
                    {g.propertyId && (
                      <button
                        onClick={() => navigate(`/property/${g.propertyId}`)}
                        className="button-secondary"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Naar property
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    <div><b>ID:</b> {g.id}</div>
                    <div>
                      <b>Property:</b>{" "}
                      {g.propertyTitle ? g.propertyTitle : g.propertyId || "-"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      disabled={busyId === g.id}
                      onClick={() => setStatus(g.id, "approved")}
                      className="button"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: busyId === g.id ? "not-allowed" : "pointer",
                      }}
                    >
                      Goedkeuren
                    </button>
                    <button
                      disabled={busyId === g.id}
                      onClick={() => setStatus(g.id, "rejected")}
                      className="button-secondary"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        opacity: 0.95,
                      }}
                    >
                      Afkeuren
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
