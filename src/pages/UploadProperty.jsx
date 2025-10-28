// src/pages/UploadProperty.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadProperty() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressText, setProgressText] = useState("");

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

  function safeName(name) {
    // Eenvoudige normalisatie van bestandsnaam
    const base = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const rid =
      (window?.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) ||
      `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const dot = base.lastIndexOf(".");
    if (dot === -1) return `${base}_${rid}`;
    const stem = base.slice(0, dot);
    const ext = base.slice(dot);
    return `${stem}_${rid}${ext}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      alert("Vul a.u.b. titel en locatie in.");
      return;
    }
    if (!files || files.length === 0) {
      alert("Selecteer minimaal één foto.");
      return;
    }

    setSubmitting(true);
    setProgressText("Aanmaken property…");

    try {
      const owner = auth?.currentUser || null;

      // 1) Maak eerst een lege property-doc (status: draft)
      const propertiesCol = collection(db, "properties");
      const docRef = await addDoc(propertiesCol, {
        title: title.trim(),
        location: location.trim(),
        status: "draft",
        ownerId: owner?.uid || null,
        createdAt: serverTimestamp(),
        photos: [],
      });

      // 2) Upload alle foto’s naar Storage en verzamel URL’s
      const uploadedPhotos = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setProgressText(`Uploaden foto ${i + 1} van ${total}…`);

        const filename = safeName(file.name);
        const storageRef = ref(
          storage,
          `properties/${docRef.id}/photos/${filename}`
        );

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        uploadedPhotos.push({
          name: file.name,
          path: storageRef.fullPath,
          url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }

      // 3) Update de property met photos[] en status
      setProgressText("Bijwerken property…");
      await updateDoc(docRef, {
        photos: uploadedPhotos,
        status: "uploaded",
        updatedAt: serverTimestamp(),
      });

      // 4) Redirect naar PropertyView
      // We gaan uit van route: /property/:id
      navigate(`/property/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Er ging iets mis bij het uploaden. Check de console voor details.");
      setSubmitting(false);
      setProgressText("");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 840, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Nieuwe property uploaden</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 16, borderRadius: 12 }}>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: 6 }}>
            Titel
          </label>
          <input
            id="title"
            type="text"
            placeholder="Bijv. Modern appartement aan het park"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            className="input"
            style={{ width: "100%", padding: "10px 12px" }}
          />
        </div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="location" style={{ display: "block", marginBottom: 6 }}>
            Locatie
          </label>
          <input
            id="location"
            type="text"
            placeholder="Bijv. Rotterdam, NL"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={submitting}
            className="input"
            style={{ width: "100%", padding: "10px 12px" }}
          />
        </div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <label htmlFor="photos" style={{ display: "block", marginBottom: 6 }}>
            Foto’s (meerdere toegestaan)
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
            Tip: selecteer 3–10 scherpe interieur/exterieur foto’s.
          </p>
        </div>

        {previews.length > 0 && (
          <div style={{ margin: "16px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Voorbeeld ({previews.length})
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
          <div
            style={{
              margin: "12px 0",
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            {progressText || "Bezig…"}
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
            {submitting ? "Uploaden…" : "Opslaan & doorgaan"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="button-secondary"
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
