import { AwsClient } from "aws4fetch";

/**
 * On Cloudflare Workers (production / `opennextjs-cloudflare preview`), uploads go straight
 * through the native R2 binding — no API keys involved. Under plain `next dev` (no Workers
 * runtime available), it falls back to the S3-compatible API via R2_ACCESS_KEY_ID/SECRET.
 */
async function getCloudflareEnv() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return getCloudflareContext().env as { MEDIA_BUCKET?: R2Bucket };
  } catch {
    return null;
  }
}

function r2Client() {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
}

function s3Endpoint() {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`;
}

function publicUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function uploadToR2(file: File, folder: string) {
  const ext = file.name.split(".").pop() || "bin";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  const env = await getCloudflareEnv();
  if (env?.MEDIA_BUCKET) {
    await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    return publicUrl(key);
  }

  if (!process.env.R2_ACCESS_KEY_ID) {
    throw new Error("R2 storage isn't configured yet — add R2 credentials to enable uploads.");
  }
  const res = await r2Client().fetch(`${s3Endpoint()}/${key}`, {
    method: "PUT",
    body: await file.arrayBuffer(),
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  return publicUrl(key);
}

/** Short-lived presigned PUT URL so the browser can upload straight to R2. Uploading through the
 *  Worker means it must read the whole file in JavaScript, which blows the Free plan's 10 ms CPU
 *  limit (Error 1102) for anything larger than a small image. */
export async function presignUpload(filename: string, folder: string) {
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    throw new Error("Direct upload isn't configured");
  }
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  const url = new URL(`${s3Endpoint()}/${key}`);
  url.searchParams.set("X-Amz-Expires", "600");
  const signed = await r2Client().sign(new Request(url, { method: "PUT" }), { aws: { signQuery: true } });
  return { uploadUrl: signed.url, publicUrl: publicUrl(key) };
}

export async function deleteFromR2(publicFileUrl: string) {
  const key = publicFileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");

  const env = await getCloudflareEnv();
  if (env?.MEDIA_BUCKET) {
    await env.MEDIA_BUCKET.delete(key);
    return;
  }

  if (!process.env.R2_ACCESS_KEY_ID) return;
  await r2Client().fetch(`${s3Endpoint()}/${key}`, { method: "DELETE" });
}
