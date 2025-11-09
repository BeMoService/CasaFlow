import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAMZCaCpBhMY482-BeSRJhXLe0xC0BkHw8",
  authDomain: "velvetframedb.firebaseapp.com",
  projectId: "velvetframedb",
  storageBucket: "velvetframedb.appspot.com", // belangrijk
  messagingSenderId: "1038595537948",
  appId: "1:1038595537948:web:4e445227d6233bc019f3d9",
};

for (const [k,v] of Object.entries(FIREBASE_CONFIG)) {
  if (!v || String(v).trim()==="") throw new Error(`Missing Firebase config: ${k}`);
}

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
