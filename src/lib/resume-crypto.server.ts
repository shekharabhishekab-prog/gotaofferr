/**
 * App-level encryption for stored resume content (`tailor_runs.result`).
 *
 * Resume payloads are the most sensitive data we hold: full employment
 * history, phone numbers, locations, sometimes salary figures. The database
 * itself is encrypted at rest, but that does not help if a dump or a leaked
 * service-role key ever escapes. Encrypting the column at the application
 * layer means an attacker with raw table access gets ciphertext instead of
 * thousands of complete CVs.
 *
 * AES-256-GCM via WebCrypto (available in the Worker runtime). The key lives
 * only in Cloud secrets as RESUME_ENCRYPTION_KEY and is never sent to the
 * browser — decryption happens inside server functions that already verified
 * the caller owns the row.
 */

type Envelope = { __enc: "v1"; iv: string; ct: string };

function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __enc?: unknown }).__enc === "v1" &&
    typeof (value as Envelope).iv === "string" &&
    typeof (value as Envelope).ct === "string"
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let cachedKey: Promise<CryptoKey> | null = null;

/** Derives a stable 256-bit AES key from the secret. Read env inside the call. */
function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const secret = process.env["RESUME_ENCRYPTION_KEY"];
  if (!secret) throw new Error("RESUME_ENCRYPTION_KEY is not configured");

  cachedKey = (async () => {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  })();
  return cachedKey;
}

/** Fail closed before AI work or writes when encryption is unavailable. */
export async function requireResumeEncryption(): Promise<void> {
  await getKey();
}

/** No new resume is ever stored as plaintext on configuration or crypto failure. */
export async function encryptResult(value: unknown): Promise<unknown> {
  if (value === null || value === undefined) return value;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await getKey(), plaintext);
  return { __enc: "v1", iv: toBase64(iv), ct: toBase64(new Uint8Array(cipher)) } satisfies Envelope;
}

/**
 * Reverses `encryptResult`. Rows written before encryption was introduced are
 * plain JSON and pass through untouched, so old rewrites keep downloading.
 */
export async function decryptResult(value: unknown): Promise<unknown> {
  if (!isEnvelope(value)) return value;

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(value.iv) },
    await getKey(),
    fromBase64(value.ct),
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

/** True when a stored value holds real content (encrypted or legacy plain). */
export function hasStoredResult(value: unknown): boolean {
  return value !== null && value !== undefined;
}
