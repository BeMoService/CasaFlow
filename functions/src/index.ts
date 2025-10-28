// functions/src/index.ts
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

initializeApp();

const db = getFirestore();
const bucket = getStorage().bucket();

type CreateGenerationPayload = {
  propertyId: string;
  inputPhotos?: string[];
};

type GenerationOutput = {
  storagePath: string;
  contentType: string;
  width?: number;
  height?: number;
};

type AiGenerationDoc = {
  id: string;
  propertyId: string;
  ownerId: string | null;
  inputPhotos: string[];
  outputs: GenerationOutput[];
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  completedAt?: Timestamp | FieldValue;
  error?: string;
};

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/Yo1k+IAAAAASUVORK5CYII=";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createGenerationMock = onCall({ region: "europe-west1" }, async (request) => {
  const data = request.data as CreateGenerationPayload | undefined;
  const uid = request.auth?.uid ?? null;

  if (!data || typeof data.propertyId !== "string" || !data.propertyId.trim()) {
    throw new HttpsError("invalid-argument", "propertyId (string) is vereist.");
  }

  const inputPhotos =
    Array.isArray(data.inputPhotos) && data.inputPhotos.every((p) => typeof p === "string")
      ? data.inputPhotos
      : [];

  // queued
  const genRef = db.collection("ai_generations").doc();
  const genId = genRef.id;

  const initialDoc: AiGenerationDoc = {
    id: genId,
    propertyId: data.propertyId,
    ownerId: uid,
    inputPhotos,
    outputs: [],
    status: "queued",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await genRef.set(initialDoc);

  // processing
  await genRef.update({
    status: "processing",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 10–20s wachten
  const delayMs = (10 + Math.floor(Math.random() * 11)) * 1000;
  await sleep(delayMs);

  // Mock PNG schrijven
  const outPath = `ai_generations/${genId}/outputs/mock-${Date.now()}.png`;
  const pngBuffer = Buffer.from(TINY_PNG_BASE64, "base64");

  await bucket.file(outPath).save(pngBuffer, {
    resumable: false,
    contentType: "image/png",
    metadata: { cacheControl: "public,max-age=3600" },
  });

  const outputs: GenerationOutput[] = [
    { storagePath: outPath, contentType: "image/png", width: 1, height: 1 },
  ];

  // completed
  await genRef.update({
    status: "completed",
    outputs,
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { generationId: genId, status: "completed" };
});

// eenvoudige healthcheck
export const health = onRequest({ region: "europe-west1" }, (_req, res) => {
  res.status(200).send("ok");
});
