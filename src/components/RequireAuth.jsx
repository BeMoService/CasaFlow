// src/components/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

/**
 * Gebruik:
 * <RequireAuth><Dashboard /></RequireAuth>
 * - Als user niet ingelogd is → redirect naar /login (met return-to).
 */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(undefined); // undefined = loading, null = no user

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div style={{ padding: 24, opacity: 0.85 }}>
        Bezig met verifiëren…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}
