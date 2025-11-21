// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleEmailLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErr("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (error) {
      setErr(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 18,
          border: "1px solid rgba(248,113,113,0.5)", // soft CasaFlow red
          background:
            "radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 55%) rgba(10,10,12,0.96)",
          boxShadow: "0 26px 70px rgba(0,0,0,0.9)",
          padding: 24,
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: ".12em",
              opacity: 0.75,
            }}
          >
            CasaFlow
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(248,113,113,0.6)",
              background: "rgba(15,23,42,0.85)",
              textTransform: "uppercase",
              letterSpacing: ".14em",
              opacity: 0.9,
            }}
          >
            Access
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            margin: "4px 0 6px",
          }}
        >
          Sign in to CasaFlow
        </h1>
        <p
          style={{
            fontSize: 14,
            opacity: 0.82,
            marginBottom: 18,
          }}
        >
          Use your account to access the CasaFlow dashboard and CRM.
        </p>

        {/* Form */}
        <form
          onSubmit={handleEmailLogin}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label style={{ fontSize: 13, fontWeight: 500 }}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </label>

          <label style={{ fontSize: 13, fontWeight: 500 }}>
            Password
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, flex: 1, marginTop: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={toggleStyle}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {err ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#fecaca",
                background: "rgba(127,29,29,0.6)",
                borderRadius: 10,
                padding: "8px 10px",
                border: "1px solid rgba(248,113,113,0.7)",
              }}
            >
              {err}
            </div>
          ) : null}

          {/* Primary email login button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              marginTop: 10,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              ...secondaryBtnStyle,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "default" : "pointer",
            }}
          >
            Continue with Google
          </button>
        </form>

        {/* Footer links */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 16,
            gap: 8,
            fontSize: 13,
          }}
        >
          <a href="#" style={linkStyle}>
            Create account
          </a>
          <a href="#" style={linkStyle}>
            Forgot password
          </a>
        </div>

        <p
          style={{
            fontSize: 11,
            opacity: 0.6,
            marginTop: 14,
            lineHeight: 1.4,
          }}
        >
          By signing in you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 4,
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.6)",
  background: "rgba(15,23,42,0.9)",
  color: "#fff",
  outline: "none",
  fontSize: 14,
};

const toggleStyle = {
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.7)",
  background: "rgba(15,23,42,0.95)",
  color: "#e5e7eb",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const primaryBtnStyle = {
  width: "100%",
  padding: "11px 16px",
  borderRadius: 999,
  border: "1px solid rgba(248,113,113,0.9)",
  background:
    "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.45), transparent 55%) rgba(24,7,7,1)",
  color: "#f9fafb",
  fontWeight: 800,
  fontSize: 14,
  boxShadow: "0 0 26px rgba(248,113,113,0.55)",
  transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
};

const secondaryBtnStyle = {
  width: "100%",
  marginTop: 8,
  padding: "11px 16px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.75)",
  background: "rgba(15,23,42,0.9)",
  color: "#e5e7eb",
  fontWeight: 600,
  fontSize: 14,
  transition: "transform .16s ease, box-shadow .16s ease, background .16s ease",
};

const linkStyle = {
  color: "rgba(248,113,113,0.9)",
  textDecoration: "none",
};
