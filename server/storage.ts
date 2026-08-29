import fs from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

type StorageConfig = { baseUrl: string; apiKey: string };

export function getUploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
}

export function isRemoteStorageConfigured(): boolean {
  return Boolean(ENV.forgeApiUrl && ENV.forgeApiKey);
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as BlobPart], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function assertPathInside(root: string, dest: string) {
  const rel = path.relative(root, dest);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Invalid upload path");
  }
}

async function localPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const root = getUploadDir();
  const dest = path.resolve(root, key);
  assertPathInside(root, dest);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await fs.writeFile(dest, buffer);
  return { key, url: `/uploads/${key}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (!isRemoteStorageConfigured()) {
    return localPut(relKey, data, contentType);
  }

  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  if (!isRemoteStorageConfigured()) {
    const key = normalizeKey(relKey);
    return { key, url: `/uploads/${key}` };
  }

  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
