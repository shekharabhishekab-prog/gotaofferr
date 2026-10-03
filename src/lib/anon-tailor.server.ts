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
