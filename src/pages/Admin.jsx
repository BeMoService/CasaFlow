// src/pages/Admin.jsx
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
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 1080, width: "100%" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                opacity: 0.75,
                marginBottom: 4,
              }}
            >
              CasaFlow • Admin
            </div>
            <h1 style={{ fontSize: 26, margin: 0, fontWeight: 800 }}>
              AI Generations overview
            </h1>
            <p
              className="muted"
              style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}
            >
              Inspect every generation coming back from the engine mock. Filter
              by status or property to debug flows.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="btn"
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid rgba(248,113,113,0.65)",
              background: "rgba(15,23,42,0.9)",
              fontSize: 13,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter strip */}
        <div
          className="card"
          style={{
            marginBottom: 18,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            border: "1px solid rgba(248,113,113,0.55)",
            background:
              "radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 55%) rgba(10,10,10,0.96)",
            boxShadow: "0 16px 45px rgba(0,0,0,0.8)",
          }}
        >
          <input
            type="text"
            placeholder="Search by generation id, status, or property id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{
              flex: 1,
              minWidth: 220,
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.92)",
              color: "#f9fafb",
              fontSize: 14,
              outline: "none",
            }}
          />
          <span
            className="badge"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              background: "rgba(248,113,113,0.18)",
              borderColor: "rgba(248,113,113,0.75)",
            }}
          >
            {filtered.length} rows
          </span>
        </div>

        {/* Content states */}
        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div
            className="card panel-outline"
            style={{
              borderRadius: 14,
              padding: 20,
              border: "1px solid rgba(248,113,113,0.55)",
              background:
                "radial-gradient(circle at top left, rgba(248,113,113,0.14), transparent 55%) rgba(9,9,11,0.96)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.8)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 6 }}>No generations found</h3>
            <p style={{ marginTop: 0, marginBottom: 6, opacity: 0.85 }}>
              Start a generation from a property to see results here.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn"
              style={{
                marginTop: 6,
                padding: "9px 14px",
                borderRadius: 999,
                fontWeight: 600,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "rgba(15,23,42,0.9)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Go to Dashboard
            </button>
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
                Array.isArray(g.outputs) && g.outputs.length > 0
                  ? g.outputs[0]
                  : null;

              const statusColor =
                g.status === "done"
                  ? "#4ade80"
                  : g.status === "queued"
                  ? "#facc15"
                  : "#e5e7eb";

              return (
                <div
                  key={g.id}
                  className="card panel-outline"
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid rgba(248,113,113,0.55)",
                    background: "rgba(15,23,42,0.98)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      background:
                        "radial-gradient(circle at center, rgba(15,23,42,1), #020617)",
                      overflow: "hidden",
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt="output"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
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
                          opacity: 0.7,
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: 12, display: "grid", gap: 8 }}>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: ".12em",
                          opacity: 0.7,
                          marginBottom: 2,
                        }}
                      >
                        Generation
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          wordBreak: "break-all",
                        }}
                      >
                        {g.id}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                        Property:{" "}
                        <span style={{ fontWeight: 500 }}>
                          {g.propertyId || "-"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                        Status:{" "}
                        <b style={{ color: statusColor }}>{g.status || "-"}</b>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <button
                        onClick={() => img && window.open(img, "_blank")}
                        disabled={!img}
                        className="btn btn-primary"
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: 13,
                          border: "1px solid rgba(248,113,113,0.85)",
                          background: img
                            ? "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.35), transparent 55%) rgba(24,24,27,1)"
                            : "rgba(31,41,55,0.9)",
                          boxShadow: img
                            ? "0 0 18px rgba(248,113,113,0.55)"
                            : "none",
                          color: "#f9fafb",
                          cursor: img ? "pointer" : "not-allowed",
                        }}
                      >
                        Open image
                      </button>

                      <span
                        className="badge"
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                          background: "rgba(15,23,42,0.95)",
                          borderColor: "rgba(148,163,184,0.7)",
                          opacity: 0.9,
                        }}
                      >
                        Mode: mock
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
