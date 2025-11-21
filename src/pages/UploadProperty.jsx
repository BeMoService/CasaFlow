// src/pages/UploadProperty.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/config";
import { collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Cloud Function base (HTTP) to bypass CORS on direct Storage uploads
const FUNCTION_BASE = "https://europe-west1-velvetframedb.cloudfunctions.net";

// Upload a single file via Cloud Function (server-side write to Storage)
async function uploadViaFunction(propertyId, file) {
  // file -> base64 (strip data: prefix)
  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(",")[1] || "");
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const base64 = await toBase64(file);
  const resp = await fetch(`${FUNCTION_BASE}/uploadPropertyPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      base64,
    }),
  });

  if (!resp.ok) throw new Error(`uploadPropertyPhoto failed: HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data?.ok) throw new Error(data?.error || "uploadPropertyPhoto error");

  return {
    name: file.name,
    path: data.path,
    url: data.downloadURL,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
}

export default function UploadProperty() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [percent, setPercent] = useState(0);

  const previews = useMemo(() => {
    return Array.from(files || []).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
    }));
  }, [files]);

  function handleFileChange(e) {
    const list = e.target.files;
    if (!list) return;
    setFiles(list);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !location.trim()) {
      alert("Please fill in title and location.");
      return;
    }
    if (!files || files.length === 0) {
      alert("Select at least one photo.");
      return;
    }

    setSubmitting(true);
    setProgressText("Creating property…");
    setPercent(0);

    try {
      const owner = auth?.currentUser || null;

      // 1) Create draft property doc
      const propertiesCol = collection(db, "properties");
      const docRef = await addDoc(propertiesCol, {
        title: title.trim(),
        location: location.trim(),
        status: "draft",
        ownerId: owner?.uid || null,
        createdAt: serverTimestamp(),
        photos: [],
      });

      // 2) Upload photos via Cloud Function (server-side to Storage)
      const uploadedPhotos = [];
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        setProgressText(`Uploading photo ${i + 1} of ${list.length}…`);
        setPercent(Math.round((i / list.length) * 100));
        try {
          const meta = await uploadViaFunction(docRef.id, f);
          uploadedPhotos.push(meta);
        } catch (err) {
          console.error("Upload failed:", err);
          alert(`Upload failed for ${f.name}: ${err.message}`);
          setSubmitting(false);
          setProgressText("");
          return;
        }
      }
      setPercent(100);

      // 3) Finalize property
      setProgressText("Saving property…");
      await updateDoc(docRef, {
        photos: uploadedPhotos,
        status: "uploaded",
        updatedAt: serverTimestamp(),
      });

      // 4) Redirect to Property View
      navigate(`/property/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while uploading. Check the console for details.");
      setSubmitting(false);
      setProgressText("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        {/* Header strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 16,
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
              CasaFlow • Input
            </div>
            <h1
              className="headline"
              style={{ fontSize: 28, margin: 0, fontWeight: 800 }}
            >
              Upload new property
            </h1>
            <p
              className="muted"
              style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}
            >
              Add photos and listing details — CasaFlow will generate virtual restyles
              on top of your real property.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="btn"
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid rgba(248,113,113,0.65)",
              background: "rgba(15,23,42,0.85)",
              fontSize: 13,
              opacity: submitting ? 0.6 : 0.95,
              cursor: submitting ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ← Back
          </button>
        </div>

        {/* Status strip */}
        <div
          className="card"
          style={{
            marginBottom: 14,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(248,113,113,0.55)",
            background:
              "radial-gradient(circle at top left, rgba(248,113,113,0.20), transparent 55%) rgba(10,10,10,0.96)",
            boxShadow: "0 16px 45px rgba(0,0,0,0.8)",
          }}
        >
          <span
            className="badge"
            style={{
              textTransform: "uppercase",
              letterSpacing: ".08em",
              fontSize: 11,
              background: "rgba(21,128,61,0.25)",
              borderColor: "rgba(22,163,74,0.7)",
            }}
          >
            Step 1 • Upload
          </span>
          <span
            className="badge"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              background: "rgba(248,113,113,0.16)",
              borderColor: "rgba(248,113,113,0.7)",
            }}
          >
            Photos required
          </span>
          <span
            className="muted"
            style={{ marginLeft: "auto", fontSize: 12, opacity: 0.85 }}
          >
            Tip: 3–10 sharp interior/exterior images work best.
          </span>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card panel-outline"
          style={{
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(248,113,113,0.55)",
            background:
              "radial-gradient(circle at top left, rgba(248,113,113,0.16), transparent 55%) rgba(6,6,6,0.96)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.85)",
          }}
        >
          <div className="form-row" style={{ marginBottom: 14 }}>
            <label
              htmlFor="title"
              className="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Modern apartment next to the park"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              className="input"
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,0.55)",
                background: "rgba(15,23,42,0.9)",
                color: "#f9fafb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 14 }}>
            <label
              htmlFor="location"
              className="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., Rome, IT"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={submitting}
              className="input"
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,0.55)",
                background: "rgba(15,23,42,0.9)",
                color: "#f9fafb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <label
              htmlFor="photos"
              className="label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Photos (you can select multiple)
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={submitting}
              className="input"
              style={{
                width: "100%",
                padding: "9px 10px",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(15,23,42,0.85)",
                color: "#f9fafb",
                fontSize: 13,
              }}
            />
            <p
              className="muted"
              style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}
            >
              Tip: select 3–10 sharp interior/exterior photos.
            </p>
          </div>

          {previews.length > 0 && (
            <div style={{ margin: "18px 0 6px" }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Preview ({previews.length})</span>
                <span
                  className="badge"
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    background: "rgba(248,113,113,0.12)",
                    borderColor: "rgba(248,113,113,0.8)",
                  }}
                >
                  Local only
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                {previews.map((p) => (
                  <div
                    key={p.url}
                    className="card"
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid rgba(248,113,113,0.45)",
                      background: "rgba(15,23,42,0.98)",
                      boxShadow: "0 14px 40px rgba(0,0,0,0.9)",
                    }}
                  >
                    <div className="media" style={{ maxHeight: 160, overflow: "hidden" }}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img
                        src={p.url}
                        alt={p.name}
                        loading="lazy"
                        style={{ width: "100%", display: "block", objectFit: "cover" }}
                      />
                    </div>
                    <div
                      className="muted"
                      style={{ padding: 8, fontSize: 12, opacity: 0.9 }}
                    >
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submitting && (
            <div
              style={{
                margin: "14px 0 4px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                className="badge"
                style={{
                  background: "rgba(248,113,113,0.18)",
                  borderColor: "rgba(248,113,113,0.75)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                }}
              >
                Processing
              </span>
              <span style={{ fontSize: 14, opacity: 0.95 }}>
                {progressText} {percent ? `(${percent}%)` : null}
              </span>
            </div>
          )}

          <div
            className="row"
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                padding: "11px 18px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
                border: "1px solid rgba(248,113,113,0.85)",
                background: submitting
                  ? "rgba(127,29,29,0.85)"
                  : "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.35), transparent 55%) rgba(24,24,27,1)",
                boxShadow: submitting
                  ? "0 0 0 rgba(0,0,0,0)"
                  : "0 0 20px rgba(248,113,113,0.6)",
                color: "#f9fafb",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
              }}
              onMouseOver={(e) => {
                if (submitting) return;
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 0 26px rgba(248,113,113,0.75)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  submitting
                    ? "0 0 0 rgba(0,0,0,0)"
                    : "0 0 20px rgba(248,113,113,0.6)";
              }}
            >
              {submitting ? "Uploading…" : "Save & continue"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="btn"
              style={{
                padding: "11px 16px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                border: "1px solid rgba(148,163,184,0.7)",
                background: "rgba(15,23,42,0.85)",
                color: "#e5e7eb",
                opacity: submitting ? 0.6 : 0.95,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
