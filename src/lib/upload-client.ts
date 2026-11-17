"use client";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

/** Downscales/recompresses large photos client-side before upload so property pages
 *  don't ship multi-megabyte originals — a major contributor to perceived site lag. */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 600_000) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const toUpload = await compressImage(file);

  const formData = new FormData();
  formData.append("file", toUpload);
  formData.append("folder", folder);

  // "Failed to fetch" (the request never reaching the server — a dropped connection,
  // not a real server error) was showing up on back-to-back uploads of multiple files.
  // Retry transient network failures a couple of times before giving up.
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (e) {
      lastError = e;
      // Only retry genuine network failures, not a real server-returned error.
      if (!(e instanceof TypeError)) throw e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Upload failed");
}
