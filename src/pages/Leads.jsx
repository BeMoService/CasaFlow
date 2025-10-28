// src/pages/Leads.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";

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

export default function Leads() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const colRef = collection(db, "leads");
    const unsub = onSnapshot(
      colRef,
      async (snap) => {
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        // Enrich met property title (best effort)
        const enriched = await Promise.all(
          items.map(async (it) => {
            if (it.propertyId) {
              try {
                const pd = await getDoc(doc(db, "properties", it.propertyId));
                const pt = pd.exists() ? pd.data().title : null;
                return { ...it, propertyTitle: pt };
              } catch {
                return it;
              }
            }
            return it;
          })
        );
        setRows(enriched);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = a?.createdAt?.seconds || 0;
      const tb = b?.createdAt?.seconds || 0;
      return tb - ta;
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((r) => {
      const s = `${r.id} ${r.propertyId || ""} ${r.propertyTitle || ""} ${r.contact?.name || ""} ${
        r.contact?.email || ""
      } ${r.contact?.phone || ""} ${r.message || ""}`.toLowerCase();
      return s.includes(term);
    });
  }, [sorted, q]);

  function fmt(ts) {
    if (!ts) return "-";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString();
    }

  async function setLeadStatus(id, next) {
    try {
      setBusyId(id);
      await updateDoc(doc(db, "leads", id), {
        status: next,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error(e);
      alert("Kon leadstatus niet bijwerken.");
    } finally {
      setBusyId(null);
    }
  }

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
        <h1 style={{ fontSize: 28 }}>Leads</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Zoek op contact, property, bericht…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 10, width: 320 }}
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
          <h3 style={{ marginTop: 0 }}>Geen leads gevonden</h3>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Inzendingen via de property-pagina verschijnen hier automatisch.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16,
            marginTop: 8,
          }}
        >
          {filtered.map((l) => {
            const c = l.contact || {};
            const status = l.status || "new";

            return (
              <div
                key={l.id}
                className="card"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge>{status}</Badge>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>{fmt(l.createdAt)}</span>
                  </div>

                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <div><b>Naam:</b> {c.name || "-"}</div>
                    <div><b>E-mail:</b> {c.email || "-"}</div>
                    <div><b>Telefoon:</b> {c.phone || "-"}</div>
                  </div>

                  <div style={{ fontSize: 13 }}>
                    <b>Bericht:</b>
                    <div
                      style={{
                        marginTop: 4,
                        padding: 10,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {l.message || "-"}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    <b>Property:</b>{" "}
                    {l.propertyTitle ? l.propertyTitle : l.propertyId || "-"}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {l.propertyId && (
                      <button
                        onClick={() => navigate(`/property/${l.propertyId}`)}
                        className="button"
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Open property
                      </button>
                    )}
                    <button
                      disabled={busyId === l.id}
                      onClick={() => setLeadStatus(l.id, "contacted")}
                      className="button-secondary"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        opacity: 0.95,
                      }}
                    >
                      Markeer als gecontacteerd
                    </button>
                    <button
                      disabled={busyId === l.id}
                      onClick={() => setLeadStatus(l.id, "closed")}
                      className="button-secondary"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        opacity: 0.95,
                      }}
                    >
                      Sluit lead
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
