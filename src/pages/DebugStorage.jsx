// src/pages/DebugStorage.jsx
import React, { useEffect, useState } from "react";
import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DebugStorage() {
  const [log, setLog] = useState([]);
  const add = (m) => setLog((x) => [...x, m]);

  useEffect(() => {
    (async () => {
      try {
        add("Start tiny upload test…");
        add("Bucket: " + (storage?.app?.options?.storageBucket || "(unknown)"));

        const blob = new Blob([new Uint8Array(1024)], { type: "application/octet-stream" });
        const p = `debug/${Date.now()}_tiny.bin`;
        const r = ref(storage, p);
        add("Path: " + r.fullPath);

        await uploadBytes(r, blob);
        add("Upload OK");

        const url = await getDownloadURL(r);
        add("URL: " + url);
      } catch (e) {
        console.error(e);
        add("ERROR: " + (e?.message || String(e)));
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Debug: Storage tiny upload</h1>
      <p>Deze pagina probeert automatisch een 1KB bestand te uploaden naar je Firebase Storage.</p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#111",
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {log.join("\n")}
      </pre>
    </div>
  );
}
