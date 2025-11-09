// src/firebase/config.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ jouw echte Firebase web config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAMZCaCpBhMY482-BeSRJhXLe0xC0BkHw8",
  authDomain: "velvetframedb.firebaseapp.com",
  projectId: "velvetframedb",
  storageBucket: "velvetframedb.firebasestorage.app",
  messagingSenderId: "1038595537948",
  appId: "1:1038595537948:web:4e445227d6233bc019f3d9"
};

// Initialize (avoid re-init during hot reload)
const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

// Export common handles
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
