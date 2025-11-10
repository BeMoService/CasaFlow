// src/pages/PublicProperty.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function PublicProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [prop, setProp] = useState(null);
  const [err, setErr] = useState("");

  // Lead form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // Honeypot (simple anti-bot): should stay empty
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "properties", id));
        if (!snap.exists()) throw new Error("Property not found");
        if (isMounted) {
          setProp({ id: snap.id, ...snap.data() });
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setErr("Property not found or unavailable.");
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const photos = useMemo(() => {
    const ps = Array.isArray(prop?.photos) ? prop.photos : [];
    return ps.filter(Boolean);
  }, [prop]);

  function shareUrl() {
    return `${window.location.origin}/#/p/${id}`;
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      alert("Link copied to clipboard.");
    } catch {
      alert("Could not copy link.");
    }
  }

  async function submitLead(e) {
    e.preventDefault();
    setErr("");
    if (website.trim()) {
      // honeypot triggered → silently ignore
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErr("Please fill in your name, email and message.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        propertyId: id,
        contact: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        },
        message: message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (e) {
      console.error(e);
      setErr("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Oops</h2>
        <p style={{ opacity: 0.85 }}>{err}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="button-secondary"
          style={{ padding: "8px 12px", borderRadius: 10, fontWeight: 600 }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{prop?.title || "Property"}</h1>
          <div style={{ opacity: 0.85 }}>
            {prop?.location || "Unknown location"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={copyShare}
            className="button-secondary"
            style={{ padding: "8px 12px", borderRadius: 10, fontWeight: 600 }}
          >
            Copy share link
          </button>
          <button
            onClick={() => window.open(shareUrl(), "_blank")}
            className="button"
            style={{ padding: "8px 12px", borderRadius: 10, fontWeight: 600 }}
          >
            Open share page
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ marginTop: 16 }}>
        {photos.length === 0 ? (
          <div
            style={{
              borderRadius: 12,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            No images available for this listing.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {photos.map((p, i) => (
              <div
                key={p.url || p.path || i}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#111",
                  height: 200,
                }}
              >
                <img
                  src={p.url}
                  alt={p.name || `photo-${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead form */}
      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div
          className="card"
          style={{
            borderRadius: 12,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Request more information</h3>
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            Leave your details and we’ll get back to you shortly.
          </p>

          <form onSubmit={submitLead} style={{ display: "grid", gap: 10 }}>
            {/* Honeypot - hidden */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
              tabIndex={-1}
              aria-hidden="true"
            />

            <label style={{ display: "grid", gap: 6 }}>
              Name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 10 }}
                required
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 10 }}
                required
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Phone (optional)
              <input
                type="tel"
                placeholder="+39 333 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 10 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Message
              <textarea
                placeholder="I'm interested in this property. Please contact me."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                style={{ padding: "10px 12px", borderRadius: 10, resize: "vertical" }}
                required
              />
            </label>

            {err && (
              <div
                style={{
                  border: "1px solid rgba(255,0,0,0.3)",
                  background: "rgba(255,0,0,0.08)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}

            {success && (
              <div
                style={{
                  border: "1px solid rgba(0,200,0,0.3)",
                  background: "rgba(0,200,0,0.08)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 13,
                }}
              >
                Thank you! Your request has been sent.
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
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
                {submitting ? "Sending…" : "Send request"}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = `mailto:info@your-agency.it?subject=Property%20${encodeURIComponent(prop?.title || "")}`)}
                className="button-secondary"
                style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}
              >
                Email us
              </button>
            </div>
          </form>
        </div>

        {/* Simple facts card */}
        <div
          className="card"
          style={{
            borderRadius: 12,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            height: "fit-content",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Listing details</h3>
          <div style={{ display: "grid", gap: 6, fontSize: 14, opacity: 0.9 }}>
            <div><b>Status:</b> {prop?.status || "unknown"}</div>
            <div><b>Photos:</b> {photos.length}</div>
            <div><b>Share link:</b> <code style={{ fontSize: 12 }}>{shareUrl()}</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
