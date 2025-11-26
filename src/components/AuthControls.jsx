// src/components/AuthControls.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthProvider.jsx";

/**
 * AuthControls
 * - Logout = rode glow button (CasaFlow/Nexora style)
 * - Login = standaard teal primary
 *
 * LET OP:
 * - Deze controls renderen alleen zichtbaar op de /login route.
 *   Op alle andere routes (o.a. /crm) is de output null, zodat er
 *   nooit een losse groene "Sign in" knop in beeld hangt.
 */
export default function AuthControls({ compact = false }) {
  const location = useLocation();

  // 🔒 Alleen op de loginpagina iets tonen
  if (location.pathname !== "/login") {
    return null;
  }

  const auth = safeUseAuth();
  const { user, signInWithGoogle, signOut } = auth;

  const Wrap = "div";
  const gapStyle = compact
    ? { display: "flex", gap: 8, alignItems: "center" }
    : { display: "flex", gap: 10, alignItems: "center" };

  const logoutStyle = {
    borderRadius: 999,
    padding: "8px 16px",
    border: "1px solid rgba(248,113,113,0.75)",
    background:
      "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.55), transparent 55%), rgba(15,15,18,0.96)",
    boxShadow:
      "0 0 18px rgba(248,113,113,0.45), 0 10px 30px rgba(0,0,0,0.85)",
    color: "#fee2e2",
    fontWeight: 600,
    cursor: "pointer",
    transition:
      "background .18s ease, border-color .18s ease, transform .08s ease, box-shadow .12s ease",
  };

  const logoutHover = {
    borderColor: "rgba(248,113,113,0.95)",
    background:
      "radial-gradient(circle at 0% 0%, rgba(248,113,113,0.75), transparent 60%), rgba(24,7,7,1)",
    transform: "translateY(-1px)",
    boxShadow:
      "0 0 24px rgba(248,113,113,0.65), 0 14px 40px rgba(0,0,0,0.9)",
  };

  return (
    <Wrap style={gapStyle}>
      {user ? (
        <>
          {!compact && (
            <div className="label" title={user.email || ""}>
              {user.displayName || user.email || "Signed in"}
            </div>
          )}
          <button
            className="btn"
            onClick={() => signOut?.()}
            aria-label="Sign out"
            title="Sign out"
            style={logoutStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, logoutHover);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, logoutStyle);
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => signInWithGoogle?.()}
          aria-label="Sign in with Google"
          title="Sign in with Google"
        >
          Sign in
        </button>
      )}
    </Wrap>
  );
}

function safeUseAuth() {
  try {
    const ctx = useAuth();
    return {
      user: ctx?.user ?? null,
      signInWithGoogle: ctx?.signInWithGoogle ?? (() => {}),
      signOut: ctx?.signOut ?? (() => {}),
    };
  } catch {
    // Fallback no-ops if AuthProvider isn’t mounted
    return {
      user: null,
      signInWithGoogle: () => {},
      signOut: () => {},
    };
  }
}
