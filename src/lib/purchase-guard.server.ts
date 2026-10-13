/**
 * Purchase-only suspension ladder. Free features are never affected.
 * A strike is a failed payment on a NEW checkout. Only RAPID repeats count: a round needs
 * STRIKES_PER_CYCLE failures inside STRIKE_WINDOW_MS. Failures spaced further apart never
 * add up and a successful payment clears everything. A genuine buyer (one attempt, or a calm
 * retry later) is never touched.
 * Each full round (3 rapid failures) pauses purchases for longer than the last:
 * 15 min, 30 min, 1 hour, 1 day, 2 days, 5 days, 7 days, 10 days, 15 days, 30 days,
 * then 15 more days for every further round. Never a permanent ban.
 * 30 quiet days after a pause ends reset the count.
 * State lives in the user's auth app_metadata (no schema change).
 */
export const STRIKES_PER_CYCLE = 3;
export const STRIKE_WINDOW_MS = 10 * 60 * 1000;
export const QUIET_RESET_MS = 30 * 24 * 3600 * 1000;

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const LADDER_MS = [15 * MIN, 30 * MIN, HOUR, DAY, 2 * DAY, 5 * DAY, 7 * DAY, 10 * DAY, 15 * DAY, 30 * DAY];

/** How long round number `cycle` (1, 2, 3 ...) pauses purchases. */
export function pauseMsForCycle(cycle: number): number {
  const c = Math.max(1, Math.floor(cycle));
  if (c <= LADDER_MS.length) return LADDER_MS[c - 1]!;
  return LADDER_MS[LADDER_MS.length - 1]! + (c - LADDER_MS.length) * 15 * DAY;
}

/** "15 minutes", "1 hour", "5 days" ... */
export function describePause(ms: number): string {
  if (ms < HOUR) return `${Math.round(ms / MIN)} minutes`;
  if (ms < DAY) {
    const h = Math.round(ms / HOUR);
    return h === 1 ? '1 hour' : `${h} hours`;
  }
  const d = Math.round(ms / DAY);
  return d === 1 ? '1 day' : `${d} days`;
}

type PBan = { strikes: number; cycles: number; until?: string; seen?: string[]; recent?: number[]; last?: number };

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env['ANON_HASH_SALT'] || 'gotaofferr';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function admin() {
  return (await import('@/integrations/supabase/client.server')).supabaseAdmin as any;
}

async function readState(userId: string): Promise<PBan> {
  const sb = await admin();
  const { data } = await sb.auth.admin.getUserById(userId);
  const p = (data?.user?.app_metadata as any)?.pban as PBan | undefined;
  return { strikes: 0, cycles: 0, ...(p || {}) };
}

async function writeState(userId: string, state: PBan) {
  const sb = await admin();
  const { data } = await sb.auth.admin.getUserById(userId);
  const meta = { ...((data?.user?.app_metadata as any) || {}), pban: state };
  await sb.auth.admin.updateUserById(userId, { app_metadata: meta });
}

/** Records one strike. `key` makes repeated webhook deliveries count once. `_ipHash` is kept for callers; no address block exists any more. */
export async function recordStrike(userId: string, key: string, _ipHash?: string): Promise<void> {
  const st = await readState(userId);
  const seen = st.seen || [];
  if (seen.includes(key)) return;
  const now = Date.now();
  st.seen = [...seen, key].slice(-30);
  // 30 quiet days after the last pause ended: start again from round 1.
  const quietSince = Math.max(st.last || 0, st.until ? new Date(st.until).getTime() : 0);
  if (st.cycles > 0 && quietSince && now - quietSince > QUIET_RESET_MS) {
    st.cycles = 0;
    delete st.until;
  }
  // Only strikes inside the short window count; spaced-out honest retries fall off.
  st.recent = [...(st.recent || []).filter((t) => now - t <= STRIKE_WINDOW_MS), now];
  st.strikes = st.recent.length;
  if (st.strikes >= STRIKES_PER_CYCLE) {
    st.strikes = 0;
    st.recent = [];
    st.last = now;
    st.cycles += 1;
    st.until = new Date(now + pauseMsForCycle(st.cycles)).toISOString();
  }
  await writeState(userId, st);
  if (st.cycles > 0 && st.strikes === 0) void import('./ops-alert.server').then((m) => m.opsAlert(`payment strike round ${st.cycles}`, `cycles=${st.cycles} pause=${describePause(pauseMsForCycle(st.cycles))}`)).catch(() => {});
  console.warn(`[purchase-guard] user=${userId.slice(0, 8)} strikes=${st.strikes} cycles=${st.cycles}`);
}

/** A successful payment clears strikes and old rounds. */
export async function clearStrikes(userId: string): Promise<void> {
  try {
    const st = await readState(userId);
    if (!st.strikes && !st.cycles && !(st.recent && st.recent.length) && !st.until) return;
    await writeState(userId, { strikes: 0, cycles: 0, seen: st.seen });
    console.warn(`[purchase-guard] cleared after successful payment user=${userId.slice(0, 8)}`);
  } catch (e) {
    console.error('[purchase-guard] clear failed', e);
  }
}

/** Returns a short message when purchases must be refused, otherwise null. Fails open. Kept under 90 characters so the checkout toast shows it as written. */
export async function purchaseBlockMessage(userId: string, _ipHash?: string): Promise<string | null> {
  try {
    const st = await readState(userId);
    if (st.until && new Date(st.until).getTime() > Date.now()) {
      return `Too many failed payments. Purchases are paused for ${describePause(pauseMsForCycle(st.cycles))}. Free features still work.`;
    }
    return null;
  } catch (e) {
    console.error('[purchase-guard] check failed, allowing', e);
    return null;
  }
}
