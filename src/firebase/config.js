// src/firebase/config.js
// Firebase client-initialisatie (V9 modular)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Lees config uit Vite env (zet deze in je .env.local)
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
// VITE_FIREBASE_MEASUREMENT_ID=... (optioneel)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Singletons
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// SDK clients
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Let op: zet hier je regio indien nodig (frontend roept regionless endpoint aan,
// de regio wordt door de function zelf bepaald; dit is oké voor emulators/hosting)
const functions = getFunctions(app);

// Emulator-koppeling (alleen in dev)
if (import.meta.env.DEV) {
  try {
    // Pas poorten aan als jouw emulatoren andere poorten gebruiken
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    // console.log("✅ Firebase emulators verbonden");
  } catch {
    // Emulators niet beschikbaar — stilletjes doorgaan met prod
  }
}

// Named exports (nodig voor jouw imports in pages/*)
export { app, auth, db, storage, functions };
