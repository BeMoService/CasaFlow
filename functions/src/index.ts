// functions/src/index.ts
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

// ─────────────────────────────────────────
// Health
// ─────────────────────────────────────────
export const health = onRequest((_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// ─────────────────────────────────────────
// MOCK AI generation (HTTP + CORS ENABLED)
// ─────────────────────────────────────────
export const createGenerationMockHttp = onRequest({ cors: true }, async (req, res) => {
  try {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    const { propertyId } = (req.query || {}) as { propertyId?: string };
    if (!propertyId) {
      res.status(400).json({ error: "missing propertyId" });
      return;
    }

    // 1) generation doc
    const genRef = db.collection("ai_generations").doc();
    await genRef.set({
      propertyId,
      status: "queued",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      outputs: [],
    });

    // 2) korte delay en fake PNG opslaan
    await new Promise((r) => setTimeout(r, 1000));

    const pngPath = `ai/${genRef.id}/mock_${Date.now()}.png`;
    const file = bucket.file(pngPath);

    // 1x1 zwart pixel PNG
    const tinyPng = Buffer.from(
      "89504E470D0A1A0A0000000D49484452000000010000000108020000009077053E0000000A49444154789C6360000002000100FFFF03000006000557BF0000000049454E44AE426082",
      "hex"
    );

    const token = crypto.randomUUID();

    await file.save(tinyPng, {
      resumable: false,
      metadata: {
        contentType: "image/png",
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const bucketName = bucket.name;
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      pngPath
    )}?alt=media&token=${token}`;

    await genRef.update({
      status: "done",
      outputs: [publicUrl],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ ok: true, id: genRef.id, output: publicUrl });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || String(e) });
  }
});

// ─────────────────────────────────────────
// Server-side photo upload (CORS ENABLED)
// ─────────────────────────────────────────
export const uploadPropertyPhoto = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }

    const { propertyId, fileName, contentType, base64 } = (req.body || {}) as {
      propertyId?: string;
      fileName?: string;
      contentType?: string;
      base64?: string;
    };

    if (!propertyId || !fileName || !contentType || !base64) {
      res
        .status(400)
        .json({ error: "Missing propertyId, fileName, contentType or base64" });
      return;
    }

    const bucket = admin.storage().bucket();

    // veilige, unieke bestandsnaam
    const safe = String(fileName).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const dot = safe.lastIndexOf(".");
    const stem = dot === -1 ? safe : safe.slice(0, dot);
    const ext = dot === -1 ? "" : safe.slice(dot);
    const unique = `${stem}_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`;

    const path = `properties/${propertyId}/photos/${unique}`;
    const buf = Buffer.from(base64, "base64");
    const token = crypto.randomUUID();

    await bucket.file(path).save(buf, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      path
    )}?alt=media&token=${token}`;

    res.json({ ok: true, path, downloadURL });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || String(e) });
  }
});
