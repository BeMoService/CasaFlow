import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const [gens, setGens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "ai_generations"),
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
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
    const q = query.trim().toLowerCase();
    if (!q) return gens;
    return gens.filter((g) => {
      return (
        g.id.toLowerCase().includes(q) ||
        g.status?.toLowerCase().includes(q) ||
        g.propertyId?.toLowerCase().includes(q)
      );
    });
  }, [gens, query]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28 }}>Admin</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search by id, status, property…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 14,
          }}
        />
        <button
          onClick={() => navigate("/dashboard")}
          className="button-secondary"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div style={{ opacity: 0.85 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card panel-outline" style={{ borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>No generations found</h3>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Start a generation from a property to see results here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((g) => {
            const img =
              Array.isArray(g.outputs) && g.outputs.length > 0 ? g.outputs[0] : null;
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
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    background: "#111",
                    overflow: "hidden",
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt="output"
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
                      No image
                    </div>
                  )}
                </div>

                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>ID: {g.id}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Property: {g.propertyId || "-"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Status:{" "}
                      <b
                        style={{
                          color:
                            g.status === "done"
                              ? "#5eea9a"
                              : g.status === "queued"
                              ? "#ffd166"
                              : "#a0a0a0",
                        }}
                      >
                        {g.status}
                      </b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => window.open(img, "_blank")}
                      disabled={!img}
                      className="button"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: img ? "pointer" : "not-allowed",
                      }}
                    >
                      Open
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
