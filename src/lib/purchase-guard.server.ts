/**
 * Purchase-only suspension ladder. Free features are never affected.
 * Strikes: a halted subscription, or a failed payment on a NEW checkout.
 * 3 strikes = one cycle. Cycle 1 = 2 days, cycle 2+ = 7 days (the maximum).
 * After WARN_AT_CYCLES cycles the buyer sees a final warning. After
 * BLOCK_AT_CYCLES cycles purchases are blocked for good for the account and the network address.
 * State lives in the user's auth app_metadata (no schema change); the address block
 * reuses the rate_limits table (hashed address only).
 */
export const STRIKES_PER_CYCLE = 3;
export const SUSPEND_FIRST_MS = 2 * 24 * 3600 * 1000;
export const SUSPEND_NEXT_MS = 7 * 24 * 3600 * 1000;
export const WARN_AT_CYCLES = 4;
export const BLOCK_AT_CYCLES = 6;

type PBan = { strikes: number; cycles: number; until?: string; permanent?: boolean; seen?: string[] };

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
  st.seen = [...seen, key].slice(-30);
  st.strikes += 1;
  if (st.strikes >= STRIKES_PER_CYCLE) {
    st.strikes = 0;
    st.cycles += 1;
    if (st.cycles >= BLOCK_AT_CYCLES) {
      st.permanent = true;
      if (ipHash) {
        const sb = await admin();
        await sb.from('rate_limits').upsert(
          { bucket: 'ipban', identifier: ipHash, window_start: BAN_WINDOW, count: 1 },
          { onConflict: 'bucket,identifier,window_start' },
        );
      }
    } else {
      st.until = new Date(Date.now() + (st.cycles === 1 ? SUSPEND_FIRST_MS : SUSPEND_NEXT_MS)).toISOString();
    }
  }
  await writeState(userId, st);
  console.warn(`[purchase-guard] user=${userId.slice(0, 8)} strikes=${st.strikes} cycles=${st.cycles} permanent=${!!st.permanent}`);
}

const FRIENDLY_BLOCK =
  "We can't take new purchases from this account right now. Everything free still works. Please write to us from the Contact page and we will help.";

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
      const d = new Date(st.until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const warn =
        st.cycles >= WARN_AT_CYCLES
          ? ' Final warning: after a few more failed attempts, new purchases will be blocked permanently.'
          : '';
      return `New purchases are paused on this account until ${d} because several payments did not go through. Everything free still works.${warn}`;
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
