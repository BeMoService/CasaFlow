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

  // Start meteen met de huidige Firebase-user als die al bekend is
  const [user, setUser] = useState(() => auth.currentUser ?? undefined); 
  // undefined = loading, null = geen user

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  // Eén bron van waarheid: pak ofwel state, ofwel de actuele auth.currentUser
  const resolvedUser = user ?? auth.currentUser ?? undefined;

  // Nog aan het ophalen / initialiseren
  if (resolvedUser === undefined) {
    return (
      <div style={{ padding: 24, opacity: 0.85 }}>
        Bezig met verifiëren…
      </div>
    );
  }

  // Niet ingelogd → naar login met return-pad
  if (!resolvedUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Ingelogd → render de children gewoon
  return <>{children}</>;
}
