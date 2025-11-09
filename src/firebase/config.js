import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAMZCaCpBhMY482-BeSRJhXLe0xC0BkHw8",
  authDomain: "velvetframedb.firebaseapp.com",
  projectId: "velvetframedb",
  storageBucket: "velvetframedb.appspot.com",
  messagingSenderId: "1038595537948",
  appId: "1:1038595537948:web:4e445227d6233bc019f3d9",
};

// Debug-log om te verifiëren welke config live draait
(function debugFirebaseConfigOnce() {
  const mask = (s) => (typeof s === "string" && s.length > 8 ? s.slice(0, 6) + "…" : s);
  if (!window.__CF_DEBUG_CFG__) {
    window.__CF_DEBUG_CFG__ = true;
    console.log("[CasaFlow] Firebase config", {
      apiKey: mask(FIREBASE_CONFIG.apiKey),
      authDomain: FIREBASE_CONFIG.authDomain,
      projectId: FIREBASE_CONFIG.projectId,
      storageBucket: FIREBASE_CONFIG.storageBucket,
      appId: mask(FIREBASE_CONFIG.appId),
    });
  }
})();

for (const [k, v] of Object.entries(FIREBASE_CONFIG)) {
  if (!v || String(v).trim() === "") throw new Error(`Missing Firebase config: ${k}`);
}

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
