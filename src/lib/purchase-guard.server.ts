/**
 * Purchase-only suspension ladder. Free features are never affected.
 * Strikes: a failed payment on a NEW checkout. Only RAPID repeats count: a round needs
 * STRIKES_PER_CYCLE failures inside STRIKE_WINDOW_MS. Failures spaced further apart never
 * add up, a successful payment clears everything, and old rounds are forgotten after
 * CYCLE_FORGET_MS. A genuine buyer (one attempt, or a calm retry later) is never touched.
 * 3 rapid strikes = one cycle. Round 1 = 2 hours, round 2 = 2 days, rounds 3 and 4 = 3 days, round 5 = permanent.
 * After WARN_AT_CYCLES cycles the buyer sees a final warning. After
 * BLOCK_AT_CYCLES cycles purchases are blocked for good for the account and the network address.
 * State lives in the user's auth app_metadata (no schema change); the address block
 * reuses the rate_limits table (hashed address only).
 */
export const STRIKES_PER_CYCLE = 3;
export const STRIKE_WINDOW_MS = 10 * 60 * 1000;
export const CYCLE_FORGET_MS = 30 * 24 * 3600 * 1000;
export const SUSPEND_FIRST_MS = 2 * 3600 * 1000;
export const SUSPEND_SECOND_MS = 2 * 24 * 3600 * 1000;
export const SUSPEND_NEXT_MS = 3 * 24 * 3600 * 1000;
export const WARN_AT_CYCLES = 4;
export const BLOCK_AT_CYCLES = 5;

type PBan = { strikes: number; cycles: number; until?: string; permanent?: boolean; seen?: string[]; recent?: number[]; last?: number };

const BAN_WINDOW = '2000-01-01T00:00:00.000Z';

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

/** Records one strike. `key` makes repeated webhook deliveries count once. */
export async function recordStrike(userId: string, key: string, ipHash?: string): Promise<void> {
  const st = await readState(userId);
  const seen = st.seen || [];
  if (seen.includes(key)) return;
  const now = Date.now();
  st.seen = [...seen, key].slice(-30);
  // Forget old rounds after a long quiet spell (never a permanent block).
  if (!st.permanent && st.cycles > 0 && st.last && now - st.last > CYCLE_FORGET_MS) st.cycles = 0;
  // Only strikes inside the short window count; spaced-out honest retries fall off.
  st.recent = [...(st.recent || []).filter((t) => now - t <= STRIKE_WINDOW_MS), now];
  st.strikes = st.recent.length;
  if (st.strikes >= STRIKES_PER_CYCLE) {
    st.strikes = 0;
    st.recent = [];
    st.last = now;
    st.cycles += 1;
    if (st.cycles >= BLOCK_AT_CYCLES) {
      st.permanent = true;
      if (ipHash) {
        const sb = await admin();
        const { error: banErr } = await sb.from('rate_limits').upsert(
          { bucket: 'ipban', identifier: ipHash, window_start: BAN_WINDOW, count: 1 },
          { onConflict: 'bucket,identifier,window_start' },
        );
        if (banErr) console.error('[purchase-guard] address block write failed', banErr.message);
      }
    } else {
      st.until = new Date(now + (st.cycles === 1 ? SUSPEND_FIRST_MS : st.cycles === 2 ? SUSPEND_SECOND_MS : SUSPEND_NEXT_MS)).toISOString();
    }
  }
  await writeState(userId, st);
  if (st.cycles > 0 && st.strikes === 0) void import('./ops-alert.server').then((m) => m.opsAlert(`payment strike round ${st.cycles}`, `cycles=${st.cycles} permanent=${!!st.permanent}`)).catch(() => {});
  console.warn(`[purchase-guard] user=${userId.slice(0, 8)} strikes=${st.strikes} cycles=${st.cycles} permanent=${!!st.permanent}`);
}

// Kept under 90 characters so the checkout toast shows them as written.
const FRIENDLY_BLOCK = "Plot twist: purchases are now blocked here for good. Please contact us.";
const FRIENDLY_PAUSE_1 = "Payment failed 3 times. Purchases are in timeout for 2 hours. Go grab a chai!";
const FRIENDLY_PAUSE_2 = "Still not getting it? Purchases are paused for 2 days. Check your card, please.";
const FRIENDLY_PAUSE_3 = "Third timeout. Purchases are paused for 3 days. Free features still work.";
const FRIENDLY_PAUSE_FINAL = "Final warning: one more round of failed payments and purchases are blocked for good.";

/** A successful payment clears strikes and old rounds (a permanent block is never lifted here). */
export async function clearStrikes(userId: string): Promise<void> {
  try {
    const st = await readState(userId);
    if (st.permanent) return;
    if (!st.strikes && !st.cycles && !(st.recent && st.recent.length) && !st.until) return;
    await writeState(userId, { strikes: 0, cycles: 0, seen: st.seen });
    console.warn(`[purchase-guard] cleared after successful payment user=${userId.slice(0, 8)}`);
  } catch (e) {
    console.error('[purchase-guard] clear failed', e);
  }
}

/** Returns a friendly message when purchases must be refused, otherwise null. Fails open. */
export async function purchaseBlockMessage(userId: string, ipHash?: string): Promise<string | null> {
  try {
    const st = await readState(userId);
    if (st.permanent) return FRIENDLY_BLOCK;
    if (ipHash) {
      const sb = await admin();
      const { data } = await sb
        .from('rate_limits')
        .select('count')
        .eq('bucket', 'ipban')
        .eq('identifier', ipHash)
        .eq('window_start', BAN_WINDOW)
        .maybeSingle();
      if (data) return FRIENDLY_BLOCK;
    }
    if (st.until && new Date(st.until).getTime() > Date.now()) {
      return st.cycles >= WARN_AT_CYCLES ? FRIENDLY_PAUSE_FINAL : st.cycles <= 1 ? FRIENDLY_PAUSE_1 : st.cycles === 2 ? FRIENDLY_PAUSE_2 : FRIENDLY_PAUSE_3;
    }
    if (st.cycles >= WARN_AT_CYCLES) {
      // suspension over, but warn on the next attempt through the checkout flow
      return null;
    }
    return null;
  } catch (e) {
    console.error('[purchase-guard] check failed, allowing', e);
    return null;
  }
}
