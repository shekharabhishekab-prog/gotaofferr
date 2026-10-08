/**
 * Encrypted rolling backup of app data to R2.
 * - Tables below only. Never auth.users, passwords, tokens, or card data.
 * - gzip, then AES-GCM with BACKUP_ENC_KEY (base64, 32 bytes).
 * - One object per weekday: backups/dow-0..6.enc. Each new backup replaces the
 *   one from 7 days ago, so size stays small and deleted data ages out in 7 days.
 * - Writes go through r2Put, which refuses anything past the 9 GB stop.
 */
import { r2Put, R2FullError } from "./r2.server";

export const BACKUP_TABLES = [
  "profiles",
  "subscriptions",
  "credit_topups",
  "tailor_runs",
  "default_resumes",
  "job_alerts",
  "job_alert_sent",
  "job_search_runs",
  "job_applications",
  "captured_emails",
] as const;

const PAGE = 1000;
const MAX_ROWS_PER_TABLE = 200_000;
const MAX_PAYLOAD_BYTES = 40 * 1024 * 1024; // keeps the Worker well inside its memory limit

function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encryptBackup(plain: Uint8Array, keyB64: string): Promise<Uint8Array> {
  const raw = b64ToBytes(keyB64);
  if (raw.length !== 32) throw new Error("backup-key-invalid");
  const key = await crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain as BufferSource));
  const magic = new TextEncoder().encode("GOBK1");
  const out = new Uint8Array(magic.length + iv.length + ct.length);
  out.set(magic, 0);
  out.set(iv, magic.length);
  out.set(ct, magic.length + iv.length);
  return out;
}

export type BackupResult = { ok: true; key: string; bytes: number; tables: Record<string, number> } | { ok: false; reason: string };

export async function runBackup(now = new Date()): Promise<BackupResult> {
  const missing = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"].filter((n) => !process.env[n]);
  if (missing.length) return { ok: false, reason: `r2-missing:${missing.join(",")}` };
  const keyB64 = process.env["BACKUP_ENC_KEY"];
  if (!keyB64) return { ok: false, reason: "backup-key-missing" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const data: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const t of BACKUP_TABLES) {
    const rows: unknown[] = [];
    for (let from = 0; from < MAX_ROWS_PER_TABLE; from += PAGE) {
      const { data: page, error } = await (supabaseAdmin as any).from(t).select("*").range(from, from + PAGE - 1);
      if (error) return { ok: false, reason: `read-failed:${t}` };
      if (!page || page.length === 0) break;
      rows.push(...page);
      if (page.length < PAGE) break;
    }
    data[t] = rows;
    counts[t] = rows.length;
  }
  const json = new TextEncoder().encode(JSON.stringify({ version: 1, taken_at: now.toISOString(), tables: data }));
  const packed = await gzip(json);
  if (packed.byteLength > MAX_PAYLOAD_BYTES) return { ok: false, reason: "payload-too-large" };
  let sealed: Uint8Array;
  try {
    sealed = await encryptBackup(packed, keyB64);
  } catch {
    return { ok: false, reason: "encrypt-failed" };
  }
  const key = `backups/dow-${now.getUTCDay()}.enc`;
  try {
    await r2Put(key, sealed, "application/octet-stream");
  } catch (e) {
    if (e instanceof R2FullError) return { ok: false, reason: "r2-write-stop" };
    const m = e instanceof Error ? e.message : "";
    return { ok: false, reason: /^r2-[a-z-]+(-\d{3})?$/.test(m) ? m : "r2-put-failed" };
  }
  return { ok: true, key, bytes: sealed.byteLength, tables: counts };
}
