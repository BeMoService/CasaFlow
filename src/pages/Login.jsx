// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase/config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Als user al is ingelogd → direct door
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirectTo =
          (location.state && location.state.from) || "/dashboard";
        navigate(redirectTo, { replace: true });
      }
    });
    return () => unsub();
  }, [navigate, location.state]);

  async function loginWithGoogle() {
    setErr("");
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      setErr(mapAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), pw);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), pw);
      }
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      setErr(mapAuthError(e));
      setBusy(false);
    }
  }

  async function resetPw() {
    if (!email.trim()) {
      setErr("Vul je e-mail in om een resetlink te ontvangen.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("Als het e-mailadres bestaat, is er een resetlink verstuurd.");
    } catch (e) {
      console.error(e);
      setErr(mapAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  function mapAuthError(e) {
    const code = e?.code || "";
    if (code.includes("auth/invalid-email")) return "Ongeldig e-mailadres.";
    if (code.includes("auth/user-not-found")) return "Gebruiker niet gevonden.";
    if (code.includes("auth/wrong-password")) return "Onjuist wachtwoord.";
    if (code.includes("auth/email-already-in-use"))
      return "Dit e-mailadres is al in gebruik.";
    if (code.includes("auth/weak-password"))
      return "Wachtwoord is te zwak (min. 6 tekens).";
    if (code.includes("auth/popup-closed-by-user"))
      return "Popup gesloten voordat de actie voltooid was.";
    return "Er ging iets mis. Probeer het opnieuw.";
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>CasaFlow</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          {mode === "login" ? "Inloggen" : "Account aanmaken"}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="jij@bedrijf.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10 }}
              required
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label htmlFor="pw" style={{ display: "block", marginBottom: 6 }}>
              Wachtwoord
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="pw"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={busy}
                style={{ flex: 1, padding: "10px 12px", borderRadius: 10 }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                disabled={busy}
                className="button-secondary"
                style={{ padding: "10px 12px", borderRadius: 10, fontWeight: 600 }}
              >
                {showPw ? "Verberg" : "Toon"}
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                margin: "10px 0",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 13,
                border: "1px solid rgba(255,0,0,0.25)",
                background: "rgba(255,0,0,0.08)",
              }}
            >
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              disabled={busy}
              className="button"
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 600,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {mode === "login" ? "Inloggen" : "Account aanmaken"}
            </button>

            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={busy}
              className="button-secondary"
              style={{ padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}
            >
              Google
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 10,
              fontSize: 13,
            }}
          >
            <button
              type="button"
              onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
              disabled={busy}
              className="button-text"
              style={{ textDecoration: "underline", opacity: 0.9 }}
            >
              {mode === "login"
                ? "Heb je nog geen account? Registreer"
                : "Heb je al een account? Log in"}
            </button>

            <button
              type="button"
              onClick={resetPw}
              disabled={busy}
              className="button-text"
              style={{ textDecoration: "underline", opacity: 0.9 }}
            >
              Wachtwoord vergeten
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75, textAlign: "center" }}>
        Door in te loggen ga je akkoord met onze voorwaarden.
      </div>
    </div>
  );
}
