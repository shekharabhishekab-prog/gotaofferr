/**
 * Cloudflare R2 storage (S3-compatible API, no extra dependency).
 *
 * Zero-spend guard: R2 is free up to 10 GB. We refuse every write that would
 * take the bucket past WRITE_STOP_BYTES (9 GB decimal, set by the build plan), so we
 * never reach the paid range. Reads and deletes always work.
 *
 * Needs these server secrets (set in the Worker, never in code):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

export const WRITE_STOP_BYTES = 9_000_000_000; // 9 GB decimal stop, safely under the 10 GB free tier
const USAGE_CACHE_MS = 60 * 1000;

type Cfg = { account: string; key: string; secret: string; bucket: string };

function cfg(): Cfg | null {
  const account = process.env["R2_ACCOUNT_ID"];
  const key = process.env["R2_ACCESS_KEY_ID"];
  const secret = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = process.env["R2_BUCKET"];
  if (!account || !key || !secret || !bucket) return null;
  return { account, key, secret, bucket };
}

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? enc.encode(data) : data;
  return hex(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

/** AWS Signature V4 for R2 (region "auto", service "s3"). */
async function signedFetch(
  c: Cfg,
  method: string,
  path: string,
  query: Record<string, string>,
  body?: Uint8Array,
  contentType?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const host = `${c.account}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body ?? "");
  const canonQuery = Object.keys(query)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k] as string)}`)
    .join("&");
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;
  const names = Object.keys(headers).sort();
  const canonHeaders = names.map((n) => `${n}:${headers[n]}\n`).join("");
  const signedHeaders = names.join(";");
  const canonical = [method, path, canonQuery, canonHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${date}/auto/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonical)].join("\n");
  let k: ArrayBuffer | Uint8Array = enc.encode("AWS4" + c.secret);
  for (const part of [date, "auto", "s3", "aws4_request"]) k = await hmac(k, part);
  const signature = hex(await hmac(k, toSign));
  const auth = `AWS4-HMAC-SHA256 Credential=${c.key}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const url = `https://${host}${path}${canonQuery ? "?" + canonQuery : ""}`;
  return fetchImpl(url, {
    method,
    headers: { ...headers, authorization: auth },
    body: body as BodyInit | undefined,
  });
}

let usageCache: { bytes: number; at: number } | null = null;

/** Total bytes in the bucket (sums ListObjectsV2). Cached for 1 minute. */
export async function bucketUsageBytes(fetchImpl: typeof fetch = fetch, force = false): Promise<number> {
  const c = cfg();
  if (!c) throw new Error("r2-not-configured");
  if (!force && usageCache && Date.now() - usageCache.at < USAGE_CACHE_MS) return usageCache.bytes;
  let total = 0;
  let token: string | undefined;
  for (let i = 0; i < 1000; i++) {
    const q: Record<string, string> = { "list-type": "2", "max-keys": "1000" };
    if (token) q["continuation-token"] = token;
    const res = await signedFetch(c, "GET", `/${c.bucket}`, q, undefined, undefined, fetchImpl);
    if (!res.ok) throw new Error(`r2-list-failed-${res.status}`);
    const xml = await res.text();
    for (const m of xml.matchAll(/<Size>(\d+)<\/Size>/g)) total += Number(m[1]);
    const next = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
    if (!next) break;
    token = next[1];
  }
  usageCache = { bytes: total, at: Date.now() };
  return total;
}

export class R2FullError extends Error {
  constructor() {
    super("r2-write-stop");
  }
}

/** Pure rule, easy to test: may we add `size` bytes to a bucket holding `used`? */
export function writeAllowed(used: number, size: number): boolean {
  return used + size <= WRITE_STOP_BYTES;
}

export async function r2Put(key: string, body: Uint8Array, contentType: string, fetchImpl: typeof fetch = fetch) {
  const c = cfg();
  if (!c) throw new Error("r2-not-configured");
  // Cached count is only trusted while far from the limit (under half). Other
  // server instances also write, so near the limit we always count fresh.
  let used = await bucketUsageBytes(fetchImpl);
  if (used + body.byteLength > WRITE_STOP_BYTES * 0.5) used = await bucketUsageBytes(fetchImpl, true);
  if (!writeAllowed(used, body.byteLength)) throw new R2FullError();
  const res = await signedFetch(c, "PUT", `/${c.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`, {}, body, contentType, fetchImpl);
  if (!res.ok) throw new Error(`r2-put-failed-${res.status}`);
  if (usageCache) usageCache.bytes += body.byteLength;
}

export async function r2Get(key: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const c = cfg();
  if (!c) throw new Error("r2-not-configured");
  return signedFetch(c, "GET", `/${c.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`, {}, undefined, undefined, fetchImpl);
}

export async function r2Delete(key: string, fetchImpl: typeof fetch = fetch) {
  const c = cfg();
  if (!c) throw new Error("r2-not-configured");
  const res = await signedFetch(c, "DELETE", `/${c.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`, {}, undefined, undefined, fetchImpl);
  if (!res.ok && res.status !== 404) throw new Error(`r2-delete-failed-${res.status}`);
  usageCache = null;
}

