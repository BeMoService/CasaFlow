// src/pages/PublicProperty.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

/* Inline image loader — geen extra bestand nodig */
function InlineImage({ src, alt = "photo" }) {
  const [state, setState] = useState({ url: null, error: false });

  useEffect(() => {
    let active = true;

    async function resolve() {
      try {
        if (!src) { if (active) setState({ url: null, error: true }); return; }
        const s = String(src);

        if (/^https?:\/\//i.test(s)) { // directe URL
          if (active) setState({ url: s, error: false });
          return;
        }
        // gs://bucket/path of relatieve storage path
        const clean = s.replace(/^gs:\/\/[^/]+\//, "");
        const r = ref(storage, clean);
        const dl = await getDownloadURL(r);
        if (active) setState({ url: dl, error: false });
      } catch (e) {
        console.error("PublicProperty InlineImage failed:", src, e);
        if (active) setState({ url: null, error: true });
      }
    }

    setState({ url: null, error: false });
    resolve();
    return () => { active = false; };
  }, [src]);

  if (!state.url && !state.error) return <div className="media skeleton" aria-label="loading image" />;

  if (state.error) {
    return (
      <div className="media" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        No image
      </div>
    );
  }

  return (
    <div className="media">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={state.url} alt={alt} loading="lazy" />
    </div>
  );
}

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
    return () => { isMounted = false; };
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
    if (website.trim()) return; // honeypot
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
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch (e) {
      console.error(e);
      setErr("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h2 className="headline" style={{ marginTop: 0 }}>Oops</h2>
        <p className="muted">{err}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn"
          style={{ padding: "8px 12px", borderRadius: 12, fontWeight: 600 }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div className="between">
        <div>
          <h1 className="headline" style={{ margin: 0 }}>{prop?.title || "Property"}</h1>
          <div className="muted">{prop?.location || "Unknown location"}</div>
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button onClick={copyShare} className="btn" style={{ padding: "8px 12px", borderRadius: 12, fontWeight: 600 }}>
            Copy share link
          </button>
          <button onClick={() => window.open(shareUrl(), "_blank")} className="btn btn-primary" style={{ padding: "8px 12px", borderRadius: 12, fontWeight: 600 }}>
            Open share page
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div style={{ marginTop: 16 }}>
        {photos.length === 0 ? (
          <div className="card panel-outline" style={{ borderRadius: 12, padding: 20 }}>
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
            {photos.map((p, i) => {
              const src =
                (typeof p === "string" ? p :
                  p.downloadURL || p.url || p.href || p.src || p.storagePath || p.fullPath || p.path || "");
              return (
                <div key={p.url || p.path || i} className="card" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                  <InlineImage src={src} alt={p.name || `photo-${i + 1}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead form + facts */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card panel-outline" style={{ borderRadius: 12, padding: 16 }}>
          <h3 className="headline" style={{ marginTop: 0, marginBottom: 8, fontSize: 20 }}>Request more information</h3>
          <p className="muted" style={{ marginTop: 0 }}>
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

            <label className="label" style={{ display: "grid", gap: 6 }}>
              Name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.35)", color: "var(--text)" }}
                required
              />
            </label>

            <label className="label" style={{ display: "grid", gap: 6 }}>
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.35)", color: "var(--text)" }}
                required
              />
            </label>

            <label className="label" style={{ display: "grid", gap: 6 }}>
              Phone (optional)
              <input
                type="tel"
                placeholder="+39 333 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.35)", color: "var(--text)" }}
              />
            </label>

            <label className="label" style={{ display: "grid", gap: 6 }}>
              Message
              <textarea
                placeholder="I'm interested in this property. Please contact me."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                style={{ padding: "10px 12px", borderRadius: 12, resize: "vertical", border: "1px solid var(--border)", background: "rgba(0,0,0,0.35)", color: "var(--text)" }}
                required
              />
            </label>

            {err && (
              <div style={{ border: "1px solid rgba(255,0,0,0.3)", background: "rgba(255,0,0,0.08)", borderRadius: 12, padding: "8px 10px", fontSize: 13 }}>
                {err}
              </div>
            )}

            {success && (
              <div style={{ border: "1px solid rgba(0,200,0,0.3)", background: "rgba(0,200,0,0.08)", borderRadius: 12, padding: "8px 10px", fontSize: 13 }}>
                Thank you! Your request has been sent.
              </div>
            )}

            <div className="row">
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Sending…" : "Send request"}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = `mailto:info@your-agency.it?subject=Property%20${encodeURIComponent(prop?.title || "")}`)}
                className="btn"
                style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600 }}
              >
                Email us
              </button>
            </div>
          </form>
        </div>

        {/* Simple facts card */}
        <div className="card panel-outline" style={{ borderRadius: 12, padding: 16, height: "fit-content" }}>
          <h3 className="headline" style={{ marginTop: 0, marginBottom: 8, fontSize: 20 }}>Listing details</h3>
          <div style={{ display: "grid", gap: 6, fontSize: 14, opacity: 0.9 }}>
            <div><span className="label">Status:</span> {prop?.status || "unknown"}</div>
            <div><span className="label">Photos:</span> {photos.length}</div>
            <div><span className="label">Share link:</span> <code style={{ fontSize: 12 }}>{shareUrl()}</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
