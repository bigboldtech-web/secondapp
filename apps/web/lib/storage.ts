import { mkdir, writeFile } from "fs/promises";
import { createHash, createHmac } from "crypto";
import path from "path";

export interface UploadResult {
  url: string;
  key: string;
  provider: "local" | "s3";
}

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}

export function storageProvider(): "local" | "s3" {
  return process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? "s3"
    : "local";
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 80);
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${base}`;
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  const safe = sanitizeFilename(input.filename);
  const folder = input.folder || "listings";
  const key = `${folder}/${safe}`;

  if (storageProvider() === "s3") {
    return uploadToS3(input, key);
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), input.buffer);
  return { url: `/uploads/${key}`, key, provider: "local" };
}

// ----------------------------------------------------------------------------
// S3 PUT using SigV4 (no external SDK so build stays dependency-free).
// Works with AWS S3 and Cloudflare R2 (R2 exposes an S3-compatible API).
// ----------------------------------------------------------------------------

async function uploadToS3(input: UploadInput, key: string): Promise<UploadResult> {
  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT || `https://s3.${region}.amazonaws.com`;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY!;
  const publicBase = process.env.S3_PUBLIC_URL || `${endpoint}/${bucket}`;

  const host = new URL(endpoint).host;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const service = "s3";
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const payloadHash = createHash("sha256").update(input.buffer).digest("hex");

  const canonicalUri = `/${bucket}/${key}`.replace(/\/+/g, "/");
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `content-type:${input.contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    "",
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = createHmac("sha256", `AWS4${secretAccessKey}`).update(dateStamp).digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update(service).digest();
  const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpoint}${canonicalUri}`, {
    method: "PUT",
    body: new Uint8Array(input.buffer),
    headers: {
      "Content-Type": input.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${text}`);
  }

  return { url: `${publicBase}/${key}`, key, provider: "s3" };
}
