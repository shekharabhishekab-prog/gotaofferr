/**
 * Server-only helpers for the one-free-rewrite anonymous (logged-out) flow.
 *
 * A logged-out visitor gets exactly ONE full tailoring run. We identify the
 * device with three weak signals combined: a browser fingerprint sent by the
 * client, an httpOnly cookie, and a hashed IP. None of them is stored raw.
 */

import { createHash } from "crypto";

const ANON_COOKIE = "gao_anon_id";

function salt(): string {
  // Dedicated pepper first, so the hash secret can be rotated on its own and
  // no payment/database credential is ever used as key material.
  return (
    process.env["ANON_HASH_SALT"] ||
    process.env["JOB_ALERTS_CRON_SECRET"] ||
    process.env["SUPABASE_URL"] ||
    "gotaofferr"
  );
}

export function hashValue(value: string): string {
  return createHash("sha256").update(`${salt()}:${value}`).digest("hex");
}

export { ANON_COOKIE };

export type AnonIdentity = { deviceHash: string; ipHash: string; cookieId: string };

/** True when this device/IP already consumed its single free rewrite. */
export async function hasUsedFreeRun(identity: AnonIdentity): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const hashes = [identity.deviceHash, hashValue(identity.cookieId)];

  const { data: byDevice } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .in("device_hash", hashes)
    .limit(1);
  if (byDevice && byDevice.length > 0) return true;

  const { data: byIp } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("ip_hash", identity.ipHash)
    .limit(1);
  return Boolean(byIp && byIp.length > 0);
}

/** Records the consumed free run for both the fingerprint and the cookie id. */
export async function recordFreeRun(identity: AnonIdentity): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = [identity.deviceHash, hashValue(identity.cookieId)].map((device_hash) => ({
    device_hash,
    ip_hash: identity.ipHash,
  }));
  await supabaseAdmin.from("anonymous_tailor_uses").upsert(rows, { onConflict: "device_hash" });
}

/**
 * First-run bonus: a person's very first tailor or builder run goes to the strong models, once.
 * Markers live in the same table with an "fr:" prefix on the hashes, so they never count as a
 * used free guest rewrite (hasUsedFreeRun compares the plain hashes only).
 */
const FIRST_RUN_PREFIX = "fr:";
// Protects the shared strong-model pool from scripted fresh visitors: at most this many bonus runs per rolling 24 h.
const FIRST_RUN_DAILY_CAP = 25;

export type FirstRunIdentity = { cookieId: string; ipHash: string; deviceHash?: string };

export async function hasUsedFirstRun(identity: FirstRunIdentity): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const hashes = [FIRST_RUN_PREFIX + hashValue(identity.cookieId)];
  if (identity.deviceHash) hashes.push(FIRST_RUN_PREFIX + identity.deviceHash);
  const { data: byDevice } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .in("device_hash", hashes)
    .limit(1);
  if (byDevice && byDevice.length > 0) return true;
  const { data: byIp } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("ip_hash", FIRST_RUN_PREFIX + identity.ipHash)
    .limit(1);
  return Boolean(byIp && byIp.length > 0);
}

/** True while today's bonus budget is not used up. Fails closed (lower model) if the check errors. */
export async function firstRunBudgetLeft(): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error } = await supabaseAdmin
      .from("anonymous_tailor_uses")
      .select("id", { count: "exact", head: true })
      .like("device_hash", FIRST_RUN_PREFIX + "%")
      .gte("created_at", since);
    if (error) throw error;
    // Each person writes up to two marker rows (cookie + device), so halve the count.
    return Math.ceil((count ?? 0) / 2) < FIRST_RUN_DAILY_CAP;
  } catch (e) {
    console.error("[first-run] budget check failed", e);
    return false;
  }
}

/** Decides the model tier for a run that may be the person's first: strong chain once, else the given tier. */
export async function firstRunChoice(identity: FirstRunIdentity, plain: boolean): Promise<boolean> {
  if (plain) return false;
  if (await hasUsedFirstRun(identity)) return false;
  return firstRunBudgetLeft();
}

export async function recordFirstRun(identity: FirstRunIdentity): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const devices = [hashValue(identity.cookieId), identity.deviceHash].filter(Boolean) as string[];
    const rows = devices.map((d) => ({ device_hash: FIRST_RUN_PREFIX + d, ip_hash: FIRST_RUN_PREFIX + identity.ipHash }));
    await supabaseAdmin.from("anonymous_tailor_uses").upsert(rows, { onConflict: "device_hash" });
  } catch (e) {
    console.error("[first-run] record failed", e);
  }
}

export async function saveCapturedEmail(
  email: string,
  source: string,
  deviceHash: string | null,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("captured_emails")
    .upsert({ email: email.toLowerCase(), source, device_hash: deviceHash }, { onConflict: "email,source" });
}
