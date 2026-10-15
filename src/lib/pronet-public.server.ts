/**
 * ProNet public bridge (approved live by the owner 2026-10-15, "Option one").
 *
 * ProNet (pronet-75o.pages.dev) is a static app with no login, so it reaches the
 * SAME terbey engines through these public endpoints instead of the signed-in
 * server functions. Rules that never bend:
 * - CORS is locked to the ProNet origin only.
 * - Usage limits: ProNet has its OWN generous counters (owner-approved
 *   2026-10-15 8:56 PM "Karva do" - testing should not hit limits): 50
 *   searches, 25 tailors and 10 interviews per device (or IP) per rolling
 *   24h, 5 job alerts per email per month. Counters live in the same
 *   anonymous_tailor_uses table but with "pronet:"-prefixed keys, so
 *   terbey.com's own one-shot anon counters stay untouched.
 * - No Turnstile here: the terbey sitekey only issues tokens on terbey
 *   domains, so abuse control is the per-IP rate limit + per-device caps.
 */

const ALLOWED_ORIGINS = new Set([
  "https://pronet-75o.pages.dev",
]);

export function pronetCors(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

export function pronetOptions(request: Request): Response {
  return new Response(null, { status: 204, headers: pronetCors(request) });
}

export function pronetJson(request: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...pronetCors(request) },
  });
}

export interface PronetIdentity {
  ip: string;
  ipHash: string;
  deviceHash: string;
}

/** Stable per-device identity: ProNet sends a deviceId from its localStorage; IP is the fallback key. */
export async function pronetIdentity(request: Request, deviceId: string): Promise<PronetIdentity> {
  const { clientIp } = await import("@/lib/rate-limit.server");
  const { hashValue } = await import("./anon-tailor.server");
  const ip = clientIp(request);
  return { ip, ipHash: hashValue(ip), deviceHash: hashValue(deviceId) };
}

/** Once-ever usage check against terbey's shared anon counters (same table + prefix style as terbey.com). */
export async function pronetUsedEver(prefix: string, id: PronetIdentity): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: byDevice } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("device_hash", prefix + id.deviceHash)
    .limit(1);
  if (byDevice && byDevice.length > 0) return true;
  const { data: byIp } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("ip_hash", prefix + id.ipHash)
    .limit(1);
  return Boolean(byIp && byIp.length > 0);
}

/** Once-per-calendar-month usage check (matches terbey's free-tier monthly allowances). */
export async function pronetUsedThisMonth(prefix: string, id: PronetIdentity): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);
  const iso = since.toISOString();
  const { data: byDevice } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("device_hash", prefix + id.deviceHash)
    .gte("created_at", iso)
    .limit(1);
  if (byDevice && byDevice.length > 0) return true;
  const { data: byIp } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id")
    .eq("ip_hash", prefix + id.ipHash)
    .gte("created_at", iso)
    .limit(1);
  return Boolean(byIp && byIp.length > 0);
}

export async function pronetRecordUse(prefix: string, id: PronetIdentity): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // One row PER USE (unique suffix), so rolling-window counts work; the
  // "pronet:" prefix + suffix never collide with terbey.com's exact-key lookups.
  const suffix = ":" + crypto.randomUUID();
  await supabaseAdmin
    .from("anonymous_tailor_uses")
    .insert([{ device_hash: prefix + id.deviceHash + suffix, ip_hash: prefix + id.ipHash + suffix }]);
}

/** Rolling-window usage count: true when uses in the last `hours` >= max. */
export async function pronetUsedRolling(prefix: string, id: PronetIdentity, max: number, hours = 24): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const iso = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const { count: byDevice } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id", { count: "exact", head: true })
    .like("device_hash", prefix + id.deviceHash + ":%")
    .gte("created_at", iso);
  if ((byDevice ?? 0) >= max) return true;
  const { count: byIp } = await supabaseAdmin
    .from("anonymous_tailor_uses")
    .select("id", { count: "exact", head: true })
    .like("ip_hash", prefix + id.ipHash + ":%")
    .gte("created_at", iso);
  return (byIp ?? 0) >= max;
}
