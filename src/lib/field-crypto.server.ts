/**
 * App-level encryption for small personal text fields (names, job-search
 * text). Same AES-256-GCM key as resume content (RESUME_ENCRYPTION_KEY),
 * which only the server holds. Stored form: "enc1:<iv b64>:<ciphertext b64>".
 * Writes fail closed: if the key is missing we throw rather than store plaintext.
 * Reads pass plain legacy values through, so old rows keep working.
 */
const PREFIX = "enc1:";

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromB64(v: string): Uint8Array<ArrayBuffer> {
  const s = atob(v);
  const out = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i);
  return out;
}

let cachedKey: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = process.env["RESUME_ENCRYPTION_KEY"];
  if (!secret) throw new Error("RESUME_ENCRYPTION_KEY is not configured");
  cachedKey = (async () => {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  })();
  return cachedKey;
}

export function isEncryptedText(v: unknown): boolean {
  return typeof v === "string" && v.startsWith(PREFIX);
}

export async function encryptText(v: string | null | undefined): Promise<string | null> {
  if (v === null || v === undefined || v === "") return v ?? null;
  if (isEncryptedText(v)) return v;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await getKey(), new TextEncoder().encode(v));
  return `${PREFIX}${toB64(iv)}:${toB64(new Uint8Array(ct))}`;
}

export async function decryptText(v: string | null | undefined): Promise<string | null> {
  if (v === null || v === undefined) return null;
  if (!isEncryptedText(v)) return v;
  try {
    const [ivB64, ctB64] = v.slice(PREFIX.length).split(":");
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(ivB64) }, await getKey(), fromB64(ctB64));
    return new TextDecoder().decode(pt);
  } catch {
    // Sealed with a key this environment does not hold: never show ciphertext as data.
    return null;
  }
}

/** JSON values (jsonb columns): same envelope shape as resume content, fails closed. */
export async function encryptJson(value: unknown): Promise<unknown> {
  if (value === null || value === undefined) return value;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await getKey(), new TextEncoder().encode(JSON.stringify(value)));
  return { __enc: "v1", iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
}

export async function decryptJson(value: unknown): Promise<unknown> {
  const { decryptResult } = await import("@/lib/resume-crypto.server");
  try {
    return await decryptResult(value);
  } catch {
    return null;
  }
}

const ALERT_TEXT = ["role", "location", "experience", "salary_range", "extra_filters"] as const;

export async function encryptAlertFields<T extends Record<string, any>>(row: T): Promise<T> {
  const out: any = { ...row };
  for (const k of ALERT_TEXT) if (k in out) out[k] = await encryptText(out[k]);
  if ("last_jobs" in out) out.last_jobs = await encryptJson(out.last_jobs);
  return out;
}

export async function decryptAlertFields<T extends Record<string, any> | null | undefined>(row: T): Promise<T> {
  if (!row) return row;
  const out: any = { ...row };
  for (const k of ALERT_TEXT) if (k in out) out[k] = await decryptText(out[k]);
  if ("last_jobs" in out) out.last_jobs = await decryptJson(out.last_jobs);
  return out;
}

export async function encryptSearchFields<T extends Record<string, any>>(row: T): Promise<T> {
  const out: any = { ...row };
  for (const k of ["role", "location"]) if (k in out) out[k] = await encryptText(out[k]);
  return out;
}
export async function decryptSearchFields<T extends Record<string, any> | null | undefined>(row: T): Promise<T> {
  if (!row) return row;
  const out: any = { ...row };
  for (const k of ["role", "location"]) if (k in out) out[k] = await decryptText(out[k]);
  return out;
}
