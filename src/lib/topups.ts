/**
 * Top-up packs: one-off purchases that add extra usage on top of whatever
 * monthly allowance the account already has.
 *
 * Credits never expire silently — each pack carries its own validity window
 * so we can size the AI cost we carry. Prices are hand-set for the markets we
 * sell most in and scaled from the local Job hunt price everywhere else, so a
 * visitor in any country sees a sane number in their own currency.
 */

import type { CurrencyPricing } from "./pricing-currency";

/** Top-ups are switched off for now; the catalogue stays for when we re-enable them. */
export const TOPUPS_ENABLED = false;

export type TopupKind = "tailor" | "job_search" | "job_alert";

export interface TopupPack {
  id: string;
  kind: TopupKind;
  /** Units granted: rewrites, searches, or extra alert slots. */
  credits: number;
  name: string;
  blurb: string;
  /** How long the credits stay usable after purchase. */
  validDays: number;
  /** India price; every other currency is derived or overridden below. */
  inr: number;
  popular?: boolean;
}

export const TOPUP_PACKS: TopupPack[] = [
  {
    id: "tailor_25",
    kind: "tailor",
    credits: 25,
    name: "25 tailored applications",
    blurb: "25 more resume rewrites with cover letters, on top of your plan.",
    validDays: 90,
    inr: 149,
  },
  {
    id: "tailor_75",
    kind: "tailor",
    credits: 75,
    name: "75 tailored applications",
    blurb: "Best value per application — for a heavy applying week.",
    validDays: 90,
    inr: 349,
    popular: true,
  },
  {
    id: "search_10",
    kind: "job_search",
    credits: 10,
    name: "10 AI job finder searches",
    blurb: "Ten more merged searches across every job board we cover.",
    validDays: 90,
    inr: 199,
  },
  {
    id: "search_30",
    kind: "job_search",
    credits: 30,
    name: "30 AI job finder searches",
    blurb: "For running several role tracks at once.",
    validDays: 90,
    inr: 499,
  },
  {
    id: "alert_1_30d",
    kind: "job_alert",
    credits: 1,
    name: "1 extra daily job alert",
    blurb: "One more saved alert emailing you fresh roles daily, for 30 days.",
    validDays: 30,
    inr: 249,
  },
];

export function packById(id: string): TopupPack | undefined {
  return TOPUP_PACKS.find((p) => p.id === id);
}

/** Hand-set prices for our biggest markets. */
const PACK_PRICES: Record<string, Record<string, number>> = {
  USD: { tailor_25: 5, tailor_75: 11, search_10: 6, search_30: 14, alert_1_30d: 7 },
  EUR: { tailor_25: 5, tailor_75: 10, search_10: 6, search_30: 13, alert_1_30d: 7 },
  GBP: { tailor_25: 4, tailor_75: 9, search_10: 5, search_30: 12, alert_1_30d: 6 },
  CAD: { tailor_25: 7, tailor_75: 15, search_10: 8, search_30: 19, alert_1_30d: 9 },
  AUD: { tailor_25: 8, tailor_75: 17, search_10: 9, search_30: 21, alert_1_30d: 10 },
  INR: { tailor_25: 149, tailor_75: 349, search_10: 199, search_30: 499, alert_1_30d: 249 },
};

/** Rounds a derived price to a friendly local number. */
function nice(value: number): number {
  if (value < 10) return Math.max(1, Math.round(value));
  if (value < 100) return Math.max(9, Math.round(value / 5) * 5 - 1);
  if (value < 1000) return Math.round(value / 50) * 50 - 1;
  if (value < 10000) return Math.round(value / 100) * 100 - 1;
  return Math.round(value / 1000) * 1000 - 1;
}

/**
 * Price of a pack in the visitor's currency. Markets without a hand-set price
 * are scaled from their local Job hunt monthly price so the ratio between a
 * subscription and a top-up stays the same everywhere.
 */
export function topupAmount(pricing: CurrencyPricing, pack: TopupPack): number {
  const fixed = PACK_PRICES[pricing.code]?.[pack.id];
  if (fixed) return fixed;
  const ratio = pricing.amounts.job_hunt / 499;
  return nice(pack.inr * ratio);
}

/** Currencies Razorpay charges without decimals (amount is already minor). */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "IDR", "CLP", "ISK"]);

/** Converts a display amount into the minor units Razorpay expects. */
export function toMinorUnits(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export const TOPUP_KIND_LABEL: Record<TopupKind, string> = {
  tailor: "Tailored applications",
  job_search: "AI job finder searches",
  job_alert: "Extra daily job alerts",
};
