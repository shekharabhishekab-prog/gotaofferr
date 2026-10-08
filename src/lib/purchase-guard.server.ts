/**
 * Purchase-only pause ladder. Free features are never affected. Never permanent.
 * A strike is a failed payment on a NEW checkout. A round is 3 failures inside
 * STRIKE_WINDOW_MS. Failures spaced further apart never add up. A successful payment clears
 * everything. 30 quiet days after the last failure reset the count.
 * Pause per round: 15m, 30m, 1h, 1d, 2d, 5d, 7d, 10d, 15d, then 30d, then +15 days each round.
 * State lives in the user's auth app_metadata (no schema change). No address blocks.
 */
export const STRIKES_PER_CYCLE = 3;
export const STRIKE_WINDOW_MS = 10 * 60 * 1000;
export const CYCLE_FORGET_MS = 30 * 24 * 3600 * 1000;
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const LADDER_MS = [15 * MIN, 30 * MIN, 60 * MIN, DAY, 2 * DAY, 5 * DAY, 7 * DAY, 10 * DAY, 15 * DAY];

/** Pause length for round number `cycles` (1-based). */
export function pauseMs(cycles: number): number {
  if (cycles <= LADDER_MS.length) return LADDER_MS[Math.max(1, cycles) - 1];
  return 30 * DAY + (cycles - LADDER_MS.length - 1) * 15 * DAY;
}

function label(ms: number): string {
  if (ms < 60 * MIN) return `${Math.round(ms / MIN)} minutes`;
  if (ms < DAY) { const h = Math.round(ms / (60 * MIN)); return h === 1 ? '1 hour' : `${h} hours`; }
  const d = Math.round(ms / DAY);
  return d === 1 ? '1 day' : `${d} days`;
}

type PBan = { strikes: number; cycles: number; until?: string; seen?: string[]; recent?: number[]; last?: number };

/** Pure: applies one failed payment at time `now`. Returns the new state (never permanent). */
export function applyFailure(prev: PBan, key: string, now: number): PBan {
  const st: PBan = { strikes: 0, cycles: 0, ...prev };
  delete (st as any).permanent;
  const seen = st.seen || [];
  if (seen.includes(key)) return st;
  st.seen = [...seen, key].slice(-30);
  // 30 quiet days after the last failure forget old rounds.
  if (st.last && now - st.last > CYCLE_FORGET_MS) { st.cycles = 0; st.recent = []; st.until = undefined; }
  st.recent = [...(st.recent || []).filter((t) => now - t <= STRIKE_WINDOW_MS), now];
  st.strikes = st.recent.length;
  st.last = now;
  if (st.strikes >= STRIKES_PER_CYCLE) {
    st.strikes = 0;
    st.recent = [];
    st.cycles += 1;
    st.until = new Date(now + pauseMs(st.cycles)).toISOString();
  }
  return st;
}

/** Pure: friendly text while paused, else null. Under 90 characters so the toast shows it as written. */
export function pauseMessage(st: PBan, now: number): string | null {
  if (!st.until) return null;
  const left = new Date(st.until).getTime() - now;
  if (left <= 0) return null;
  return `Payment failed 3 times. Purchases are paused for ${label(pauseMs(Math.max(1, st.cycles)))}. Free features still work.`;
}

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

/** Records one strike. `key` makes repeated webhook deliveries count once. `_ipHash` is ignored (no address blocks). */
export async function recordStrike(userId: string, key: string, _ipHash?: string): Promise<void> {
  const prev = await readState(userId);
  const st = applyFailure(prev, key, Date.now());
  if (st === prev || (prev.seen || []).includes(key)) return;
  await writeState(userId, st);
  if (st.strikes === 0 && st.cycles > 0 && st.cycles !== prev.cycles) {
    void import('./ops-alert.server').then((m) => m.opsAlert(`payment strike round ${st.cycles}`, `cycles=${st.cycles} until=${st.until}`)).catch(() => {});
  }
  console.warn(`[purchase-guard] user=${userId.slice(0, 8)} strikes=${st.strikes} cycles=${st.cycles}`);
}

/** A successful payment clears strikes and old rounds. */
export async function clearStrikes(userId: string): Promise<void> {
  try {
    const st = await readState(userId);
    if (!st.strikes && !st.cycles && !(st.recent && st.recent.length) && !st.until && !(st as any).permanent) return;
    await writeState(userId, { strikes: 0, cycles: 0, seen: st.seen });
    console.warn(`[purchase-guard] cleared after successful payment user=${userId.slice(0, 8)}`);
  } catch (e) {
    console.error('[purchase-guard] clear failed', e);
  }
}

/** Returns a friendly message when purchases must be refused, otherwise null. Fails open. `_ipHash` is ignored. */
export async function purchaseBlockMessage(userId: string, _ipHash?: string): Promise<string | null> {
  try {
    return pauseMessage(await readState(userId), Date.now());
  } catch (e) {
    console.error('[purchase-guard] check failed, allowing', e);
    return null;
  }
}
