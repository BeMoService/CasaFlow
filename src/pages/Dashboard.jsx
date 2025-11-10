// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "properties");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const rows = [];
        snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
        setProperties(rows);
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
    return [...properties].sort((a, b) => {
      const ta = a?.createdAt?.seconds || 0;
      const tb = b?.createdAt?.seconds || 0;
      return tb - ta;
    });
  }, [properties]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 28 }}>Dashboard</h1>
        <button
          onClick={() => navigate("/upload")}
          className="button"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New property
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 16, opacity: 0.85 }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <div
            className="card"
            style={{
              borderRadius: 12,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 8 }}>No properties yet</h3>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              Click <b>New property</b> to start uploading.
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="button"
              style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}
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
            const cover = (p?.photos && p.photos[0]?.url) || "";
            const photoCount = Array.isArray(p?.photos) ? p.photos.length : 0;

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  onClick={() => navigate(`/property/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 160,
                      background: "#111",
                      overflow: "hidden",
                    }}
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={p.title || "Property"}
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
                </div>

                <div style={{ padding: 12, display: "grid", gap: 8 }}>
                  <div
                    onClick={() => navigate(`/property/${p.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {p.title || "Untitled"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {p.location || "Unknown location"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        opacity: 0.9,
                      }}
                    >
                      {p.status || "unknown"}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      {photoCount} {photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="button"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="button-secondary"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 600,
                        opacity: 0.9,
                      }}
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
