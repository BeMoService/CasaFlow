// src/components/AuthControls.jsx
import React from "react";
import { useAuth } from "../app/AuthProvider.jsx";

/**
 * AuthControls
 * - Polished buttons using global tokens (.btn / .btn-primary / .btn-logout)
 * - Supports `compact` layout (small, inline)
 * - No routing changes; uses AuthProvider actions if available
 */
export default function AuthControls({ compact = false }) {
  const auth = safeUseAuth();
  const { user, signInWithGoogle, signOut } = auth;

  const Wrap = "div";
  const gapStyle = compact
    ? { display: "flex", gap: 8, alignItems: "center" }
    : { display: "flex", gap: 10, alignItems: "center" };

  if (!user) {
    // Niet ingelogd: normale primary sign-in button
    return (
      <Wrap style={gapStyle}>
        <button
          className="btn btn-primary"
          onClick={() => signInWithGoogle?.()}
          aria-label="Sign in with Google"
          title="Sign in with Google"
        >
          Sign in
        </button>
      </Wrap>
    );
  }

  // Ingelogd: e-mail + rode glow logout button
  return (
    <Wrap style={gapStyle}>
      {!compact && (
        <span
          className="muted"
          style={{ fontSize: 13 }}
          title={user.email || ""}
        >
          {user.email || user.displayName || "Signed in"}
        </span>
      )}
      <button
        type="button"
        className="btn btn-logout"
        onClick={() => signOut?.()}
        aria-label="Logout"
        title="Logout"
      >
        Logout
      </button>
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
    // Fallback no-ops if AuthProvider isn’t mounted in some route
    return {
      user: null,
      signInWithGoogle: () => {},
      signOut: () => {},
    };
  }
}
