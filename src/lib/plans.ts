/**
 * Single source of truth for the plan catalogue and entitlement rules.
 *
 * Every gate in the app (tailoring limits, AI job finder, account UI) reads
 * from here so tier logic can never drift between files.
 */

import {
  STARTER_MONTHLY_LIMIT,
  JOB_HUNT_MONTHLY_LIMIT,
  CAREER_PRO_MONTHLY_LIMIT,
} from "./tailor-schema";
export {
  STARTER_MONTHLY_LIMIT,
  JOB_HUNT_MONTHLY_LIMIT,
  CAREER_PRO_MONTHLY_LIMIT,
} from "./tailor-schema";

/** Yearly billing is retired — every plan is sold monthly only. */
export const YEARLY_BILLING_ENABLED = false;

/** Career pro AI job finder searches per month. */
export const JOB_SEARCH_MONTHLY_LIMIT = 30;

/** Job hunt members get a taste of the job finder each month. */
export const JOB_HUNT_JOB_SEARCH_LIMIT = 10;

/** Starter members get a small monthly job finder allowance. */
export const STARTER_JOB_SEARCH_LIMIT = 5;

/** Saved daily job alerts a Career pro member can keep. */
export const JOB_ALERT_LIMIT = 5;

/** Free AI job finder searches per signed-in account per calendar month. */
export const FREE_JOB_SEARCH_TRIALS = 1;



export type PlanTier = "free" | "starter" | "job_hunt" | "career_pro";
export type PlanInterval = "month" | "year";


/**
 * Currencies we can actually bill in. Every one of these has a matching
 * Razorpay plan in each tier/interval, so the price a visitor sees is the
 * exact amount charged — no silent conversion at checkout.
 */
export const CHECKOUT_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "NZD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "TRY",
  "RUB",
  "UAH",
  "ILS",
  "AED",
  "SAR",
  "QAR",
  "KWD",
  "EGP",
  "MAD",
  "KES",
  "GHS",
  "NGN",
  "ZAR",
  "SGD",
  "HKD",
  "TWD",
  "JPY",
  "KRW",
  "CNY",
  "MYR",
  "THB",
  "IDR",
  "PHP",
  "VND",
  "PKR",
  "BDT",
  "LKR",
  "NPR",
  "BRL",
  "MXN",
  "ARS",
  "CLP",
  "COP",
  "PEN",
] as const;
export type CheckoutCurrency = (typeof CHECKOUT_CURRENCIES)[number];

export function isCheckoutCurrency(code?: string | null): code is CheckoutCurrency {
  return !!code && (CHECKOUT_CURRENCIES as readonly string[]).includes(code);
}

/** Lookup key for a plan in a given currency, e.g. `job_hunt_usd_monthly`. */
export function priceIdFor(
  tier: Exclude<PlanTier, "free">,
  interval: PlanInterval,
  currency: string,
  festival = false,
): string {
  const code = (isCheckoutCurrency(currency) ? currency : "USD").toLowerCase();
  const cycle = interval === "year" ? "yearly" : "monthly";
  return `${tier}_${code}${festival ? "_festival" : ""}_${cycle}`;
}

/** Festival-priced lookup keys that only exist while an offer is running. */
export const FESTIVAL_PRICE_IDS = new Set([
  "starter_inr_festival_monthly",
  "job_hunt_inr_festival_monthly",
  "career_pro_inr_festival_monthly",
  "job_hunt_inr_festival_yearly",
]);

export function isFestivalPriceId(priceId?: string | null): boolean {
  return !!priceId && FESTIVAL_PRICE_IDS.has(priceId);
}

/** Default (INR) lookup keys, kept for callers that are currency-agnostic. */
export const PLAN_PRICE_IDS: Record<Exclude<PlanTier, "free">, Record<PlanInterval, string>> = {
  starter: { month: "starter_inr_monthly", year: "starter_inr_yearly" },
  job_hunt: { month: "job_hunt_inr_monthly", year: "job_hunt_inr_yearly" },
  career_pro: { month: "career_pro_inr_monthly", year: "career_pro_inr_yearly" },
};

type PlanMeta = { tier: PlanTier; interval: PlanInterval; rank: number };

/** Rank orders upgrades: a higher rank is a strictly better plan. */
export const PLAN_BY_PRICE_ID: Record<string, PlanMeta> = {
  // Legacy keys kept so historical rows keep resolving.
  job_hunt_monthly: { tier: "job_hunt", interval: "month", rank: 3 },
  career_pro_monthly: { tier: "career_pro", interval: "month", rank: 5 },
  // Festival-priced variants entitle exactly the same as the standard plan.
  starter_inr_festival_monthly: { tier: "starter", interval: "month", rank: 1 },
  job_hunt_inr_festival_monthly: { tier: "job_hunt", interval: "month", rank: 3 },
  job_hunt_inr_festival_yearly: { tier: "job_hunt", interval: "year", rank: 4 },
  career_pro_inr_festival_monthly: { tier: "career_pro", interval: "month", rank: 5 },
};

for (const currency of CHECKOUT_CURRENCIES) {
  const code = currency.toLowerCase();
  PLAN_BY_PRICE_ID[`starter_${code}_monthly`] = { tier: "starter", interval: "month", rank: 1 };
  PLAN_BY_PRICE_ID[`starter_${code}_yearly`] = { tier: "starter", interval: "year", rank: 2 };
  PLAN_BY_PRICE_ID[`job_hunt_${code}_monthly`] = { tier: "job_hunt", interval: "month", rank: 3 };
  PLAN_BY_PRICE_ID[`job_hunt_${code}_yearly`] = { tier: "job_hunt", interval: "year", rank: 4 };
  PLAN_BY_PRICE_ID[`career_pro_${code}_monthly`] = { tier: "career_pro", interval: "month", rank: 5 };
  PLAN_BY_PRICE_ID[`career_pro_${code}_yearly`] = { tier: "career_pro", interval: "year", rank: 6 };
}


export function planForPriceId(priceId?: string | null): PlanMeta | null {
  if (!priceId) return null;
  return PLAN_BY_PRICE_ID[priceId] ?? null;
}

export function tierForPriceId(priceId?: string | null): PlanTier {
  return planForPriceId(priceId)?.tier ?? "free";
}

export function planLabel(priceId?: string | null): string {
  switch (tierForPriceId(priceId)) {
    case "career_pro":
      return "Career Pro Pack";
    case "job_hunt":
      return "Job Hunt Pack";
    case "starter":
      return "Starter Pack";
    default:
      return "Free";
  }
}


/** Days of access kept while Stripe retries a failed renewal payment. */
export const PAST_DUE_GRACE_DAYS = 4;

export type SubscriptionRow = {
  status: string | null;
  current_period_end: string | null;
  price_id?: string | null;
  cancel_at_period_end?: boolean | null;
};

function periodEndMs(sub: SubscriptionRow): number | null {
  if (!sub.current_period_end) return null;
  const ms = new Date(sub.current_period_end).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Whether a subscription row still grants paid access right now.
 *
 * - active / trialing: until the period ends
 * - past_due / unpaid: a grace window while Stripe retries the charge
 * - canceled: until the already-paid period ends
 */
export function isEntitled(sub: SubscriptionRow | null | undefined): boolean {
  if (!sub?.status) return false;
  const end = periodEndMs(sub);
  const now = Date.now();
  switch (sub.status) {
    case "active":
    case "trialing":
      return end === null || end > now;
    case "past_due":
      // Razorpay retries a failed renewal once a day, 3 times.
      return end === null || end + PAST_DUE_GRACE_DAYS * 86_400_000 > now;
    case "unpaid":
      // Halted after the failed retries: back to Free.
      return false;
    case "canceled":
      return end !== null && end > now;
    default:
      return false;
  }
}

/** True while a renewal payment is failing but access is still granted. */
export function isPaymentFailing(sub: SubscriptionRow | null | undefined): boolean {
  return sub?.status === "past_due" || sub?.status === "unpaid";
}

/** Career pro features (AI job finder, daily alerts). */
export function hasCareerPro(sub: SubscriptionRow | null | undefined): boolean {
  return isEntitled(sub) && tierForPriceId(sub?.price_id) === "career_pro";
}

/** Monthly resume + cover letter allowance for an active subscription. Free users use FREE_MONTHLY_LIMIT. */
export function monthlyTailorLimit(sub: SubscriptionRow | null | undefined): number {
  if (!isEntitled(sub)) return 0;
  return tailorLimitForTier(tierForPriceId(sub?.price_id));
}

/** Tailoring allowance for a tier. Unknown/free tiers get nothing paid. */
export function tailorLimitForTier(tier: PlanTier): number {
  switch (tier) {
    case "career_pro":
      return CAREER_PRO_MONTHLY_LIMIT;
    case "job_hunt":
      return JOB_HUNT_MONTHLY_LIMIT;
    case "starter":
      return STARTER_MONTHLY_LIMIT;
    default:
      return 0;
  }
}

/**
 * Job finder searches allowed per billing period for this subscription.
 *
 * Every tier is listed explicitly: an unrecognised plan must never fall
 * through to a higher tier's allowance.
 */
export function monthlyJobSearchLimit(sub: SubscriptionRow | null | undefined): number {
  if (!isEntitled(sub)) return 0;
  switch (tierForPriceId(sub?.price_id)) {
    case "career_pro":
      return JOB_SEARCH_MONTHLY_LIMIT;
    case "job_hunt":
      return JOB_HUNT_JOB_SEARCH_LIMIT;
    case "starter":
      return STARTER_JOB_SEARCH_LIMIT;
    default:
      return 0;
  }
}

export type PlanChangeKind = "upgrade" | "downgrade" | "same";


/** Compares two price IDs to decide how a plan switch should be applied. */
export function planChangeKind(currentPriceId?: string | null, nextPriceId?: string | null): PlanChangeKind {
  if (currentPriceId && nextPriceId && currentPriceId === nextPriceId) return "same";
  const current = planForPriceId(currentPriceId);
  const next = planForPriceId(nextPriceId);
  if (!current || !next) return "upgrade";
  if (next.rank === current.rank) return "same";
  return next.rank > current.rank ? "upgrade" : "downgrade";
}



/* ------------------------------------------------------------------ *
 * Per-plan allowances shown in the usage counters (all monthly).
 * ------------------------------------------------------------------ */

export const PLAN_LABEL: Record<PlanTier, string> = {
  free: "Free",
  starter: "Starter",
  job_hunt: "Job Hunt",
  career_pro: "Career Pro",
};

/** Resume builder: resumes a member can build and download per month. */
export const BUILDER_MONTHLY_LIMIT: Record<PlanTier, number> = {
  free: 5,
  starter: 12,
  job_hunt: 20,
  career_pro: 50,
};

/** Job alerts a member can set up per month (each sends 3 emails, 3 days apart). */
export const ALERT_ATTEMPT_LIMIT: Record<PlanTier, number> = {
  free: 1,
  starter: 3,
  job_hunt: 5,
  career_pro: 7,
};

/** Job finder searches per month for a tier (0 never happens: Free has a small allowance). */
export function jobSearchLimitForTier(tier: PlanTier): number {
  switch (tier) {
    case "career_pro":
      return JOB_SEARCH_MONTHLY_LIMIT;
    case "job_hunt":
      return JOB_HUNT_JOB_SEARCH_LIMIT;
    case "starter":
      return STARTER_JOB_SEARCH_LIMIT;
    default:
      return FREE_JOB_SEARCH_TRIALS;
  }
}

export function nextTier(tier: PlanTier): PlanTier | null {
  return tier === "free" ? "starter" : tier === "starter" ? "job_hunt" : tier === "job_hunt" ? "career_pro" : null;
}

/** Short "why upgrade" note. Upgrade prompts only ever point one tier up. */
export const UPGRADE_NOTE: Record<Exclude<PlanTier, "career_pro">, string> = {
  free: "Starter gives you 5 job searches, 20 tailored resumes and 12 builder resumes a month, plus 3 job alerts.",
  starter: "Job Hunt gives you 10 job searches, 129 tailored resumes and 20 builder resumes a month, plus 5 job alerts.",
  job_hunt: "Career Pro gives you 30 job searches, 199 tailored resumes and 50 builder resumes a month, plus 7 job alerts.",
};
