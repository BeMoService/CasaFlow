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
        setPercent(Math.round(((i) / list.length) * 100));
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
    <div className="container" style={{ maxWidth: 840, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Upload new property</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 16, borderRadius: 12 }}>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: 6 }}>
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
            style={{ width: "100%", padding: "10px 12px" }}
          />
        </div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="location" style={{ display: "block", marginBottom: 6 }}>
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
            style={{ width: "100%", padding: "10px 12px" }}
          />
        </div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="photos" style={{ display: "block", marginBottom: 6 }}>
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
          />
          <p style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Tip: select 3–10 sharp interior/exterior photos.
          </p>
        </div>

        {previews.length > 0 && (
          <div style={{ margin: "16px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Preview ({previews.length})
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
                  style={{
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                  />
                  <div style={{ padding: 8, fontSize: 12, opacity: 0.85 }}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {submitting && (
          <div style={{ margin: "12px 0", fontSize: 14, opacity: 0.95 }}>
            {progressText} {percent ? `(${percent}%)` : null}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={submitting}
            className="button"
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Uploading…" : "Save & continue"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="button-secondary"
            style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
