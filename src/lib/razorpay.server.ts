/**
 * Razorpay REST client + webhook verification (server only).
 *
 * Subscriptions are billed in INR from our own Razorpay account. Plan IDs are
 * mapped to the stable lookup keys the rest of the app already uses.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.razorpay.com/v1';

/** Kept for compatibility with existing rows/callers — we only run live. */
export type PaymentsEnv = 'live' | 'sandbox';
export type StripeEnv = PaymentsEnv;

/** Stable lookup key → Razorpay plan ID (live account, one per currency). */
export const RAZORPAY_PLAN_IDS: Record<string, string> = {
  // Starter pack — sold in every billable currency.
  starter_inr_monthly: 'plan_TNgVxQhH31Jbw8',
  starter_inr_festival_monthly: 'plan_TNgVy9w3nhiaSW',
  starter_usd_monthly: 'plan_TQMyEulrLUloQx',
  starter_eur_monthly: 'plan_TQMyFZGRW2gWzr',
  starter_gbp_monthly: 'plan_TQMyGGP0koWXfO',
  starter_cad_monthly: 'plan_TQMyGupnLDI3k5',
  starter_aud_monthly: 'plan_TQMyHXJLTJxlM5',


  job_hunt_inr_monthly: 'plan_TLnhpqWzp9rzdx',
  job_hunt_inr_yearly: 'plan_TKabJJE4LMU1z5',
  career_pro_inr_monthly: 'plan_TLnygf5Kr1ibJr',
  career_pro_inr_yearly: 'plan_TKabKZKJXN0wi4',

  // Festival offer (India) — only usable while a festival window is open.
  job_hunt_inr_festival_monthly: 'plan_TLnhrG9373SNqd',
  career_pro_inr_festival_monthly: 'plan_TLnyhQlB0aQmrc',
  job_hunt_inr_festival_yearly: 'plan_TLNSAfXNhtBgkh',


  job_hunt_usd_monthly: 'plan_TLnyiAFsfQ02NJ',
  job_hunt_usd_yearly: 'plan_TLKepBn0a94nuw',
  career_pro_usd_monthly: 'plan_TLnyivSlXE7PFP',
  career_pro_usd_yearly: 'plan_TLKeqTPDPLsJTV',

  job_hunt_gbp_monthly: 'plan_TLnyl7PMPgwJoJ',
  job_hunt_gbp_yearly: 'plan_TLKerkQJgmY8wG',
  career_pro_gbp_monthly: 'plan_TLnyluU53r2jjh',
  career_pro_gbp_yearly: 'plan_TLKet0FFWwSpLu',

  job_hunt_eur_monthly: 'plan_TLnyjfSOJw6H5e',
  job_hunt_eur_yearly: 'plan_TLKeuCrqGws4rM',
  career_pro_eur_monthly: 'plan_TLnykPRYExL0ss',
  career_pro_eur_yearly: 'plan_TLKevQKp5YkFdY',

  job_hunt_cad_monthly: 'plan_TLnyme14wlYtGj',
  job_hunt_cad_yearly: 'plan_TLKeweFFl4jw5h',
  career_pro_cad_monthly: 'plan_TLnynNVP1uU423',
  career_pro_cad_yearly: 'plan_TLKexw8GBOZ0g1',

  job_hunt_aud_monthly: 'plan_TLnyo7Z4Yo3OiQ',
  job_hunt_aud_yearly: 'plan_TLKezEz3uIZyUX',
  career_pro_aud_monthly: 'plan_TLnyoqBnmfV2p7',
  career_pro_aud_yearly: 'plan_TLKf0Tk59yuoVg',

  // Local-currency monthly plans (one per market currency).
  career_pro_aed_monthly: 'plan_TQNF0jiZliAtFm',
  career_pro_ars_monthly: 'plan_TQNFMze8kl1xk9',
  career_pro_bdt_monthly: 'plan_TQNFIsyM0DY74U',
  career_pro_bgn_monthly: 'plan_TQNEwWQ2F9VPgC',
  career_pro_brl_monthly: 'plan_TQNFLKhmmwUucn',
  career_pro_chf_monthly: 'plan_TQNEpmWI6rNTRV',
  career_pro_clp_monthly: 'plan_TQNFNpLcDS7zzu',
  career_pro_cny_monthly: 'plan_TQNFD7DKmCI39H',
  career_pro_cop_monthly: 'plan_TQNFOdhgMBfabu',
  career_pro_czk_monthly: 'plan_TQNEu52oAqcjFW',
  career_pro_dkk_monthly: 'plan_TQNEsNkH8YdoF6',
  career_pro_egp_monthly: 'plan_TQNF42e17t3vTO',
  career_pro_ghs_monthly: 'plan_TQNF6VkC7ehfhS',
  career_pro_hkd_monthly: 'plan_TQNF9pS77y1TwR',
  career_pro_huf_monthly: 'plan_TQNEurpj133UPy',
  career_pro_idr_monthly: 'plan_TQNFFXFaojkmRS',
  career_pro_ils_monthly: 'plan_TQNEzrAm3rKCRB',
  career_pro_jpy_monthly: 'plan_TQNFBTzECwIdmY',
  career_pro_kes_monthly: 'plan_TQNF5hjcKx9xc7',
  career_pro_krw_monthly: 'plan_TQNFCKJwacjmyz',
  career_pro_kwd_monthly: 'plan_TQNF3FEuBm0EG3',
  career_pro_lkr_monthly: 'plan_TQNFJjEQX6C9cb',
  career_pro_mad_monthly: 'plan_TQNF4s1BkJ9084',
  career_pro_mxn_monthly: 'plan_TQNFM9eF6Wz2Fd',
  career_pro_myr_monthly: 'plan_TQNFDuQuEjNYHF',
  career_pro_ngn_monthly: 'plan_TQNF7JPrrflJT9',
  career_pro_nok_monthly: 'plan_TQNErScQqH9Loe',
  career_pro_npr_monthly: 'plan_TQNFKXPUC7YDgD',
  career_pro_nzd_monthly: 'plan_TQNEoqxjqIOphD',
  career_pro_pen_monthly: 'plan_TQNFPToN3FOhwr',
  career_pro_php_monthly: 'plan_TQNFGLxF711cYT',
  career_pro_pkr_monthly: 'plan_TQNFI0AGTjoD0d',
  career_pro_pln_monthly: 'plan_TQNEtD6sP0mRLf',
  career_pro_qar_monthly: 'plan_TQNF2PmAxK2Hml',
  career_pro_ron_monthly: 'plan_TQNEvi2v8EYvqu',
  career_pro_rub_monthly: 'plan_TQNEyCdUlLNXrs',
  career_pro_sar_monthly: 'plan_TQNF1ZxSr0jJnQ',
  career_pro_sek_monthly: 'plan_TQNEqceHUrAA7n',
  career_pro_sgd_monthly: 'plan_TQNF8vev0yXQfR',
  career_pro_thb_monthly: 'plan_TQNFEhqp5gkZm9',
  career_pro_try_monthly: 'plan_TQNExLcKzdYxvd',
  career_pro_twd_monthly: 'plan_TQNFAd3yZyrBzu',
  career_pro_uah_monthly: 'plan_TQNEz1sroz465A',
  career_pro_vnd_monthly: 'plan_TQNFHBfmiyELdz',
  career_pro_zar_monthly: 'plan_TQNF87oYf62qVA',
  job_hunt_aed_monthly: 'plan_TQNF0T1GanGKhB',
  job_hunt_ars_monthly: 'plan_TQNFMhtzLE1n5U',
  job_hunt_bdt_monthly: 'plan_TQNFIZzmVcfoN5',
  job_hunt_bgn_monthly: 'plan_TQNEwFQXuhffRy',
  job_hunt_brl_monthly: 'plan_TQNFL4cIFD4T5n',
  job_hunt_chf_monthly: 'plan_TQNEpUpwmy4SHQ',
  job_hunt_clp_monthly: 'plan_TQNFNYNZR1rkLB',
  job_hunt_cny_monthly: 'plan_TQNFCqrWQDkrF3',
  job_hunt_cop_monthly: 'plan_TQNFOLpeIsAoK6',
  job_hunt_czk_monthly: 'plan_TQNEtmbNzpJnkv',
  job_hunt_dkk_monthly: 'plan_TQNEs6zK7YqCRz',
  job_hunt_egp_monthly: 'plan_TQNF3mwjfsaeU7',
  job_hunt_ghs_monthly: 'plan_TQNF6FrSd8Hk3f',
  job_hunt_hkd_monthly: 'plan_TQNF9XI7FXzaeZ',
  job_hunt_huf_monthly: 'plan_TQNEub7Po9kd7Q',
  job_hunt_idr_monthly: 'plan_TQNFFGcQJJdJXq',
  job_hunt_ils_monthly: 'plan_TQNEzaa90rUyjJ',
  job_hunt_jpy_monthly: 'plan_TQNFBCF6vaMlQ2',
  job_hunt_kes_monthly: 'plan_TQNF5RfgdjyaHV',
  job_hunt_krw_monthly: 'plan_TQNFC30j0espy6',
  job_hunt_kwd_monthly: 'plan_TQNF2xnQZJAuCc',
  job_hunt_lkr_monthly: 'plan_TQNFJSPOYClLqx',
  job_hunt_mad_monthly: 'plan_TQNF4asLvBzpdA',
  job_hunt_mxn_monthly: 'plan_TQNFLs1fIb212g',
  job_hunt_myr_monthly: 'plan_TQNFDetOhd0s1V',
  job_hunt_ngn_monthly: 'plan_TQNF720DyD3sFl',
  job_hunt_nok_monthly: 'plan_TQNErBs8slplv8',
  job_hunt_npr_monthly: 'plan_TQNFKHMek3ETNl',
  job_hunt_nzd_monthly: 'plan_TQNEoXG2plmuIP',
  job_hunt_pen_monthly: 'plan_TQNFPCOBhJP1NW',
  job_hunt_php_monthly: 'plan_TQNFG58wYwR6fF',
  job_hunt_pkr_monthly: 'plan_TQNFHkP74GrvWE',
  job_hunt_pln_monthly: 'plan_TQNEswn5I8m9K4',
  job_hunt_qar_monthly: 'plan_TQNF27GeE6luwO',
  job_hunt_ron_monthly: 'plan_TQNEvRPXzK8xOp',
  job_hunt_rub_monthly: 'plan_TQNExux6fhlZm4',
  job_hunt_sar_monthly: 'plan_TQNF1IGUhsoN49',
  job_hunt_sek_monthly: 'plan_TQNEqIrE0yrDog',
  job_hunt_sgd_monthly: 'plan_TQNF8ebeWCZsAp',
  job_hunt_thb_monthly: 'plan_TQNFERBhsTrbnU',
  job_hunt_try_monthly: 'plan_TQNEx4JEPoo0cY',
  job_hunt_twd_monthly: 'plan_TQNFAMoBnn10VL',
  job_hunt_uah_monthly: 'plan_TQNEykfJ4hXaV0',
  job_hunt_vnd_monthly: 'plan_TQNFGtydsLTwfT',
  job_hunt_zar_monthly: 'plan_TQNF7qFh7ChyVW',
  starter_aed_monthly: 'plan_TQNF0997vE6zRP',
  starter_ars_monthly: 'plan_TQNFMS2uZvU7jc',
  starter_bdt_monthly: 'plan_TQNFIIAOZmyqhe',
  starter_bgn_monthly: 'plan_TQNEvytirmNPxH',
  starter_brl_monthly: 'plan_TQNFKnjW6M31zv',
  starter_chf_monthly: 'plan_TQNEpDOE9iRmBv',
  starter_clp_monthly: 'plan_TQNFNHJIoT8h0d',
  starter_cny_monthly: 'plan_TQNFCaxinYVWXS',
  starter_cop_monthly: 'plan_TQNFO5gqrZI9V4',
  starter_czk_monthly: 'plan_TQNEtULLVBNcX7',
  starter_dkk_monthly: 'plan_TQNErpXA29IkpR',
  starter_egp_monthly: 'plan_TQNF3WaVq4Drt1',
  starter_ghs_monthly: 'plan_TQNF5zYf5Hv9fi',
  starter_hkd_monthly: 'plan_TQNF9Ej6aWzDlz',
  starter_huf_monthly: 'plan_TQNEuLCg4gvqhd',
  starter_idr_monthly: 'plan_TQNFEzRg66eaDy',
  starter_ils_monthly: 'plan_TQNEzIxA9XWyKd',
  starter_jpy_monthly: 'plan_TQNFAuRWwe7JXD',
  starter_kes_monthly: 'plan_TQNF5AbvsD4J3a',
  starter_krw_monthly: 'plan_TQNFBkcTTb0All',
  starter_kwd_monthly: 'plan_TQNF2gxxaygyHl',
  starter_lkr_monthly: 'plan_TQNFJB8NTixFnH',
  starter_mad_monthly: 'plan_TQNF4JRGs3Ouai',
  starter_mxn_monthly: 'plan_TQNFLbfL020dwv',
  starter_myr_monthly: 'plan_TQNFDMqLb6XzXb',
  starter_ngn_monthly: 'plan_TQNF6mB50dp3RS',
  starter_nok_monthly: 'plan_TQNEquC2BMc6gP',
  starter_npr_monthly: 'plan_TQNFK042ULwg19',
  starter_nzd_monthly: 'plan_TQNEo6G4ZWlS3p',
  starter_pen_monthly: 'plan_TQNFOw33zK4A6y',
  starter_php_monthly: 'plan_TQNFForTXHTEit',
  starter_pkr_monthly: 'plan_TQNFHT0NpadNwt',
  starter_pln_monthly: 'plan_TQNEsgFtx5rH59',
  starter_qar_monthly: 'plan_TQNF1r5MhQksT0',
  starter_ron_monthly: 'plan_TQNEv8yNBVvhFN',
  starter_rub_monthly: 'plan_TQNExcReQvIGQG',
  starter_sar_monthly: 'plan_TQNF10oZyb9NqS',
  starter_sek_monthly: 'plan_TQNEq2McxQmqCP',
  starter_sgd_monthly: 'plan_TQNF8On9AtwAne',
  starter_thb_monthly: 'plan_TQNFEAyeg2ktDz',
  starter_try_monthly: 'plan_TQNEwnYHm8XIoz',
  starter_twd_monthly: 'plan_TQNFA5zEaoG3Pu',
  starter_uah_monthly: 'plan_TQNEyTrIfMnPAk',
  starter_vnd_monthly: 'plan_TQNFGdQa5u8tod',
  starter_zar_monthly: 'plan_TQNF7ZxjBWPpKm',
};

/** How many billing cycles a subscription is created for. */
export function totalCountFor(lookupKey: string): number {
  return lookupKey.endsWith('_yearly') ? 10 : 120;
}

/**
 * Plan IDs we no longer sell but that live subscriptions still reference
 * (older INR price points, and the retired festival yearly plan).
 */
const LEGACY_PLAN_IDS: Record<string, string> = {
  plan_TLNS9IGCubVCOq: 'job_hunt_inr_monthly',
  plan_TKabJvftVhgLZd: 'career_pro_inr_monthly',
  plan_TLnhqYmWUpq4E4: 'career_pro_inr_monthly',
  plan_TLNS9yHJDLYHni: 'job_hunt_inr_festival_monthly',
  plan_TLnhrumOyKn0Ny: 'career_pro_inr_festival_monthly',
  plan_TLNSAfXNhtBgkh: 'job_hunt_inr_festival_yearly',
  plan_TLKeXjfB2GTH7A: 'job_hunt_usd_monthly',
  plan_TLKepoeeAo67UO: 'career_pro_usd_monthly',
  plan_TLKetbVrDJFTOS: 'job_hunt_eur_monthly',
  plan_TLKeuoqBBe7ttc: 'career_pro_eur_monthly',
  plan_TLKer6Jnu9J8Zb: 'job_hunt_gbp_monthly',
  plan_TLKesMHhgRj6PM: 'career_pro_gbp_monthly',
  plan_TLKew3B166O2bw: 'job_hunt_cad_monthly',
  plan_TLKexJ7iONDnrb: 'career_pro_cad_monthly',
  plan_TLKeybKYDiqWef: 'job_hunt_aud_monthly',
  plan_TLKezrhd4Gqw9W: 'career_pro_aud_monthly',
};

export function lookupKeyForPlanId(planId?: string | null): string | null {
  if (!planId) return null;
  const found = Object.entries(RAZORPAY_PLAN_IDS).find(([, id]) => id === planId);
  return found ? found[0] : (LEGACY_PLAN_IDS[planId] ?? null);
}

function authHeader(): string {
  const id = process.env['RAZORPAY_KEY_ID'];
  const secret = process.env['RAZORPAY_KEY_SECRET'];
  if (!id || !secret) throw new Error('Payments are not configured on the server.');
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

export async function rzp<T = any>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? 'GET',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const description = json?.error?.description || `Razorpay request failed (${res.status})`;
    throw new Error(description);
  }
  return json as T;
}

export function getPaymentsErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong with the payment. Please try again.';
}

/** Verifies the `x-razorpay-signature` HMAC over the raw request body. */
export async function verifyRazorpayWebhook(
  request: Request,
): Promise<{ event: string; payload: any }> {
  const secret = process.env['RAZORPAY_WEBHOOK_SECRET'];
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  const raw = await request.text();
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('Invalid signature');
  const body = JSON.parse(raw);
  return { event: body.event as string, payload: body.payload };
}
