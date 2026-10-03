/**
 * Purchasing-power aware display pricing.
 *
 * The Stripe catalogue is billed in INR; these values are the localised
 * equivalents we *show* so visitors outside India see a familiar currency and
 * a price that matches their market rather than a raw conversion.
 */

export type PlanId = "starter" | "job_hunt" | "career_pro";

/** Plans that carry a hand-set amount in every currency row below. */
type CorePlanId = "job_hunt" | "career_pro";

export interface CurrencyPricing {
  code: string;
  symbol: string;
  /** Displayed monthly amounts, already rounded to a nice local number. */
  amounts: Record<CorePlanId, number>;
  /** Where the currency is shown, for the small print. */
  label: string;
}


const PRICING: Record<string, CurrencyPricing> = {
  INR: { code: "INR", symbol: "₹", label: "India", amounts: { job_hunt: 499, career_pro: 1299 } },
  USD: { code: "USD", symbol: "$", label: "United States", amounts: { job_hunt: 12, career_pro: 29 } },
  EUR: { code: "EUR", symbol: "€", label: "Europe", amounts: { job_hunt: 11, career_pro: 27 } },
  GBP: { code: "GBP", symbol: "£", label: "United Kingdom", amounts: { job_hunt: 10, career_pro: 24 } },
  CAD: { code: "CAD", symbol: "CA$", label: "Canada", amounts: { job_hunt: 16, career_pro: 39 } },
  AUD: { code: "AUD", symbol: "A$", label: "Australia", amounts: { job_hunt: 18, career_pro: 42 } },
  NZD: { code: "NZD", symbol: "NZ$", label: "New Zealand", amounts: { job_hunt: 15, career_pro: 29 } },
  CHF: { code: "CHF", symbol: "CHF ", label: "Switzerland", amounts: { job_hunt: 9, career_pro: 18 } },
  SEK: { code: "SEK", symbol: "kr ", label: "Sweden", amounts: { job_hunt: 99, career_pro: 199 } },
  NOK: { code: "NOK", symbol: "kr ", label: "Norway", amounts: { job_hunt: 99, career_pro: 199 } },
  DKK: { code: "DKK", symbol: "kr ", label: "Denmark", amounts: { job_hunt: 69, career_pro: 139 } },
  PLN: { code: "PLN", symbol: "zł ", label: "Poland", amounts: { job_hunt: 29, career_pro: 59 } },
  CZK: { code: "CZK", symbol: "Kč ", label: "Czechia", amounts: { job_hunt: 149, career_pro: 299 } },
  HUF: { code: "HUF", symbol: "Ft ", label: "Hungary", amounts: { job_hunt: 2490, career_pro: 4990 } },
  RON: { code: "RON", symbol: "lei ", label: "Romania", amounts: { job_hunt: 29, career_pro: 59 } },
  BGN: { code: "BGN", symbol: "лв ", label: "Bulgaria", amounts: { job_hunt: 15, career_pro: 29 } },
  TRY: { code: "TRY", symbol: "₺", label: "Türkiye", amounts: { job_hunt: 199, career_pro: 399 } },
  RUB: { code: "RUB", symbol: "₽", label: "Russia", amounts: { job_hunt: 399, career_pro: 799 } },
  UAH: { code: "UAH", symbol: "₴", label: "Ukraine", amounts: { job_hunt: 149, career_pro: 299 } },
  ILS: { code: "ILS", symbol: "₪", label: "Israel", amounts: { job_hunt: 35, career_pro: 69 } },
  AED: { code: "AED", symbol: "AED ", label: "United Arab Emirates", amounts: { job_hunt: 33, career_pro: 69 } },
  SAR: { code: "SAR", symbol: "SAR ", label: "Saudi Arabia", amounts: { job_hunt: 33, career_pro: 69 } },
  QAR: { code: "QAR", symbol: "QAR ", label: "Qatar", amounts: { job_hunt: 33, career_pro: 69 } },
  KWD: { code: "KWD", symbol: "KD ", label: "Kuwait", amounts: { job_hunt: 3, career_pro: 6 } },
  EGP: { code: "EGP", symbol: "EGP ", label: "Egypt", amounts: { job_hunt: 249, career_pro: 499 } },
  MAD: { code: "MAD", symbol: "MAD ", label: "Morocco", amounts: { job_hunt: 49, career_pro: 99 } },
  KES: { code: "KES", symbol: "KSh ", label: "Kenya", amounts: { job_hunt: 490, career_pro: 990 } },
  GHS: { code: "GHS", symbol: "GH₵", label: "Ghana", amounts: { job_hunt: 49, career_pro: 99 } },
  NGN: { code: "NGN", symbol: "₦", label: "Nigeria", amounts: { job_hunt: 4900, career_pro: 9900 } },
  ZAR: { code: "ZAR", symbol: "R", label: "South Africa", amounts: { job_hunt: 99, career_pro: 199 } },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore", amounts: { job_hunt: 12, career_pro: 25 } },
  HKD: { code: "HKD", symbol: "HK$", label: "Hong Kong", amounts: { job_hunt: 69, career_pro: 149 } },
  TWD: { code: "TWD", symbol: "NT$", label: "Taiwan", amounts: { job_hunt: 290, career_pro: 590 } },
  JPY: { code: "JPY", symbol: "¥", label: "Japan", amounts: { job_hunt: 1290, career_pro: 2590 } },
  KRW: { code: "KRW", symbol: "₩", label: "South Korea", amounts: { job_hunt: 11900, career_pro: 23900 } },
  CNY: { code: "CNY", symbol: "CN¥", label: "China", amounts: { job_hunt: 49, career_pro: 99 } },
  MYR: { code: "MYR", symbol: "RM ", label: "Malaysia", amounts: { job_hunt: 29, career_pro: 59 } },
  THB: { code: "THB", symbol: "฿", label: "Thailand", amounts: { job_hunt: 199, career_pro: 399 } },
  IDR: { code: "IDR", symbol: "Rp ", label: "Indonesia", amounts: { job_hunt: 59000, career_pro: 119000 } },
  PHP: { code: "PHP", symbol: "₱", label: "Philippines", amounts: { job_hunt: 249, career_pro: 499 } },
  VND: { code: "VND", symbol: "₫", label: "Vietnam", amounts: { job_hunt: 99000, career_pro: 199000 } },
  PKR: { code: "PKR", symbol: "Rs ", label: "Pakistan", amounts: { job_hunt: 990, career_pro: 1990 } },
  BDT: { code: "BDT", symbol: "৳", label: "Bangladesh", amounts: { job_hunt: 420, career_pro: 850 } },
  LKR: { code: "LKR", symbol: "Rs ", label: "Sri Lanka", amounts: { job_hunt: 1090, career_pro: 2190 } },
  NPR: { code: "NPR", symbol: "NRs ", label: "Nepal", amounts: { job_hunt: 490, career_pro: 990 } },
  BRL: { code: "BRL", symbol: "R$", label: "Brazil", amounts: { job_hunt: 24, career_pro: 49 } },
  MXN: { code: "MXN", symbol: "MX$", label: "Mexico", amounts: { job_hunt: 99, career_pro: 199 } },
  ARS: { code: "ARS", symbol: "AR$", label: "Argentina", amounts: { job_hunt: 4900, career_pro: 9900 } },
  CLP: { code: "CLP", symbol: "CLP ", label: "Chile", amounts: { job_hunt: 4900, career_pro: 9900 } },
  COP: { code: "COP", symbol: "COP ", label: "Colombia", amounts: { job_hunt: 19900, career_pro: 39900 } },
  PEN: { code: "PEN", symbol: "S/ ", label: "Peru", amounts: { job_hunt: 19, career_pro: 39 } },
};

/**
 * Country (ISO-3166 alpha-2) → the currency we price that market in.
 * Every country resolves: markets without their own row fall back to the
 * closest regional bucket (EUR in Europe, USD elsewhere) via regionFallback().
 */
const COUNTRY_CURRENCY: Record<string, string> = {
  IN: "INR", US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
  IE: "EUR", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", IS: "EUR",
  PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN", TR: "TRY",
  RU: "RUB", BY: "RUB", UA: "UAH", MD: "EUR", RS: "EUR", HR: "EUR",
  SI: "EUR", SK: "EUR", BA: "EUR", MK: "EUR", AL: "EUR", ME: "EUR",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR",
  BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", MT: "EUR",
  CY: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", MC: "EUR", AD: "EUR",
  IL: "ILS", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "AED",
  OM: "AED", JO: "AED", LB: "USD", IQ: "USD", IR: "USD",
  EG: "EGP", MA: "MAD", DZ: "MAD", TN: "MAD", KE: "KES", GH: "GHS",
  NG: "NGN", ZA: "ZAR", UG: "KES", TZ: "KES", RW: "KES", ET: "KES",
  ZM: "ZAR", ZW: "ZAR", BW: "ZAR", NA: "ZAR", MU: "ZAR", SN: "MAD",
  CI: "MAD", CM: "MAD",
  SG: "SGD", HK: "HKD", TW: "TWD", JP: "JPY", KR: "KRW", CN: "CNY",
  MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND", KH: "USD",
  LA: "USD", MM: "USD", BN: "SGD", MO: "HKD", MN: "USD",
  PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR", BT: "INR", MV: "INR",
  AF: "USD", KZ: "USD", UZ: "USD", GE: "USD", AM: "USD", AZ: "USD",
  BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",
  UY: "USD", PY: "USD", BO: "USD", EC: "USD", VE: "USD", CR: "USD",
  PA: "USD", GT: "USD", DO: "USD", JM: "USD", TT: "USD", PR: "USD",
  HN: "USD", NI: "USD", SV: "USD", CU: "USD", BS: "USD",
  FJ: "AUD", PG: "AUD", NC: "AUD", PF: "AUD",
};

/** Regional fallback for any country not listed above, so nobody sees a wrong market price. */
function regionFallback(country: string): string {
  const EUROPE = /^(AX|FO|GI|GG|IM|JE|LI|SM|VA|XK)$/;
  if (EUROPE.test(country)) return "EUR";
  return "USD";
}

/**
 * Currencies Razorpay can actually charge in. Any market priced in another
 * currency is shown (and billed) in the closest billable one, so the amount
 * on the pricing page is exactly what the card is charged.
 */
const BILLABLE = new Set(Object.keys(PRICING));

function toBillable(code: string, country?: string): string {
  if (BILLABLE.has(code)) return code;
  if (country && /^(NZ)$/.test(country)) return "NZD";
  return "USD";
}

function currencyForCountry(country?: string): CurrencyPricing | undefined {
  if (!country) return undefined;
  const code = COUNTRY_CURRENCY[country] ?? regionFallback(country);
  return PRICING[toBillable(code, country)];
}

/** Timezone → country. Timezone is the most reliable silent location signal. */
const TZ_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Singapore": "SG", "Africa/Lagos": "NG", "Africa/Johannesburg": "ZA",
  "America/Sao_Paulo": "BR", "America/Bahia": "BR", "America/Fortaleza": "BR",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Berlin": "DE",
  "Europe/Paris": "FR", "Europe/Madrid": "ES", "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL", "Europe/Lisbon": "PT", "Europe/Brussels": "BE",
  "Europe/Vienna": "AT", "Europe/Helsinki": "FI", "Europe/Athens": "GR",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU",
  "Australia/Brisbane": "AU", "Pacific/Auckland": "NZ",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA",
  "America/Winnipeg": "CA", "America/Halifax": "CA",
  "America/Mexico_City": "MX", "America/Monterrey": "MX", "America/Tijuana": "MX",
  "America/Bogota": "CO", "America/Lima": "PE", "America/Santiago": "CL",
  "America/Argentina/Buenos_Aires": "AR", "America/Caracas": "VE",
  "America/Guatemala": "GT", "America/Panama": "PA", "America/Santo_Domingo": "DO",
  "Asia/Tokyo": "JP", "Asia/Seoul": "KR", "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW", "Asia/Kuala_Lumpur": "MY", "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID", "Asia/Manila": "PH", "Asia/Ho_Chi_Minh": "VN",
  "Asia/Colombo": "LK", "Asia/Kathmandu": "NP", "Asia/Jerusalem": "IL",
  "Asia/Tel_Aviv": "IL", "Asia/Qatar": "QA", "Asia/Kuwait": "KW", "Asia/Bahrain": "BH",
  "Asia/Muscat": "OM", "Asia/Amman": "JO", "Asia/Baghdad": "IQ", "Asia/Tehran": "IR",
  "Africa/Cairo": "EG", "Africa/Casablanca": "MA", "Africa/Algiers": "DZ",
  "Africa/Tunis": "TN", "Africa/Nairobi": "KE", "Africa/Accra": "GH",
  "Africa/Kampala": "UG", "Africa/Dar_es_Salaam": "TZ", "Africa/Addis_Ababa": "ET",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH", "Europe/Warsaw": "PL", "Europe/Prague": "CZ",
  "Europe/Budapest": "HU", "Europe/Bucharest": "RO", "Europe/Sofia": "BG",
  "Europe/Istanbul": "TR", "Europe/Moscow": "RU", "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA", "Europe/Belgrade": "RS", "Europe/Zagreb": "HR",
  "Europe/Riga": "LV", "Europe/Vilnius": "LT", "Europe/Tallinn": "EE",
  "Pacific/Fiji": "FJ", "Pacific/Port_Moresby": "PG",
};

export const DEFAULT_PRICING = PRICING.INR;

export function pricingForCurrency(code: string): CurrencyPricing {
  return PRICING[toBillable(code)] ?? PRICING.USD;
}

/** Market pricing for an ISO-3166 alpha-2 country code from the edge geo header. */
export function pricingForCountry(country?: string | null): CurrencyPricing | undefined {
  return currencyForCountry(country ?? undefined);
}

function countryFromTimezone(tz?: string): string | undefined {
  if (!tz) return undefined;
  if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  if (tz.startsWith("America/")) return "US";
  if (tz.startsWith("Europe/")) return "DE"; // euro-zone fallback
  return undefined;
}

/**
 * Browser-side fallback used only when the edge did not report a country.
 * Device timezone first (an actual location signal), then locale region.
 * There is deliberately no manual override: the price a visitor sees is
 * tied to where they actually are, not to a country they pick.
 */
export function detectPricing(): CurrencyPricing {
  if (typeof window === "undefined") return DEFAULT_PRICING;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const byTimezone = currencyForCountry(countryFromTimezone(tz));
    if (byTimezone) return byTimezone;

    for (const locale of [navigator.language, ...(navigator.languages ?? [])]) {
      if (!locale) continue;
      const region = new Intl.Locale(locale).maximize().region ?? undefined;
      const byLocale = currencyForCountry(region);
      if (byLocale) return byLocale;
    }
  } catch {
    /* fall through to default */
  }
  return DEFAULT_PRICING;
}


/**
 * Starter monthly prices. Only the billable currencies are hand-set; any other
 * market is scaled from its local Job hunt price so the entry tier keeps the
 * same relative position everywhere.
 */
const STARTER_AMOUNTS: Record<string, number> = {
  INR: 99, USD: 5, EUR: 5, GBP: 5, CAD: 7, AUD: 7,
  NZD: 6, CHF: 4, SEK: 39, NOK: 39, DKK: 29, PLN: 12, CZK: 59, HUF: 990,
  RON: 12, BGN: 6, TRY: 79, RUB: 159, UAH: 59, ILS: 14, AED: 13, SAR: 13,
  QAR: 13, KWD: 1, EGP: 99, MAD: 19, KES: 199, GHS: 19, NGN: 1900, ZAR: 39,
  SGD: 5, HKD: 29, TWD: 119, JPY: 490, KRW: 4900, CNY: 19, MYR: 12, THB: 79,
  IDR: 24000, PHP: 99, VND: 39000, PKR: 390, BDT: 169, LKR: 439, NPR: 199,
  BRL: 10, MXN: 39, ARS: 1900, CLP: 1900, COP: 7900, PEN: 8,
};

/** Monthly list price of any plan in this currency. */
export function baseAmount(pricing: CurrencyPricing, plan: PlanId): number {
  if (plan === "starter") {
    return STARTER_AMOUNTS[pricing.code] ?? Math.max(1, Math.round(pricing.amounts.job_hunt * 0.2));
  }
  return pricing.amounts[plan];
}

export function formatPrice(pricing: CurrencyPricing, plan: PlanId): string {
  const amount = baseAmount(pricing, plan);
  return `${pricing.symbol}${amount.toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ *
 * Annual (founding-member) pricing
 * ------------------------------------------------------------------ */

export type BillingInterval = "month" | "year";

/** Hand-tuned launch prices for the markets we care most about. */
const ANNUAL_OVERRIDES: Record<
  string,
  { now: Record<CorePlanId, number>; was: Record<CorePlanId, number> }
> = {
  INR: { now: { job_hunt: 799, career_pro: 1399 }, was: { job_hunt: 1599, career_pro: 2999 } },
  USD: { now: { job_hunt: 39, career_pro: 79 }, was: { job_hunt: 99, career_pro: 199 } },
  GBP: { now: { job_hunt: 29, career_pro: 59 }, was: { job_hunt: 79, career_pro: 149 } },
  EUR: { now: { job_hunt: 35, career_pro: 69 }, was: { job_hunt: 89, career_pro: 179 } },
  CAD: { now: { job_hunt: 49, career_pro: 99 }, was: { job_hunt: 129, career_pro: 249 } },
  AUD: { now: { job_hunt: 55, career_pro: 109 }, was: { job_hunt: 139, career_pro: 279 } },
};

/** Rounds to a friendly local price point (…9 / …99). */
function niceRound(value: number): number {
  if (value < 10) return Math.max(1, Math.round(value));
  if (value < 100) return Math.max(9, Math.round(value / 10) * 10 - 1);
  if (value < 1000) return Math.round(value / 50) * 50 - 1;
  if (value < 10000) return Math.round(value / 100) * 100 - 1;
  return Math.round(value / 1000) * 1000 - 1;
}

/** What we charge for a year, and the crossed-out 12×monthly reference. */
export function annualAmount(pricing: CurrencyPricing, plan: PlanId): number {
  if (plan !== "starter") {
    const override = ANNUAL_OVERRIDES[pricing.code];
    if (override) return override.now[plan];
  }
  return niceRound(baseAmount(pricing, plan) * 12 * 0.35);
}

export function annualWasAmount(pricing: CurrencyPricing, plan: PlanId): number {
  if (plan !== "starter") {
    const override = ANNUAL_OVERRIDES[pricing.code];
    if (override) return override.was[plan];
  }
  return baseAmount(pricing, plan) * 12;
}


/**
 * Modest crossed-out reference for the monthly plan. Keeps a visible saving on
 * monthly without undercutting the annual launch offer.
 */
const MONTHLY_WAS_OVERRIDES: Record<string, Record<PlanId, number>> = {
  INR: { starter: 299, job_hunt: 1999, career_pro: 3999 },
  USD: { starter: 12, job_hunt: 29, career_pro: 69 },
  GBP: { starter: 10, job_hunt: 25, career_pro: 59 },
  EUR: { starter: 12, job_hunt: 27, career_pro: 65 },
  CAD: { starter: 15, job_hunt: 39, career_pro: 95 },
  AUD: { starter: 15, job_hunt: 45, career_pro: 99 },
};

export function monthlyWasAmount(pricing: CurrencyPricing, plan: PlanId): number {
  const override = MONTHLY_WAS_OVERRIDES[pricing.code];
  if (override) return override[plan];
  const now = baseAmount(pricing, plan);
  const was = now < 10 ? Math.round(now * 1.35) : niceRound(now * 1.35) + 1;
  return was > now ? was : now + 1;
}


/* ------------------------------------------------------------------ *
 * Festival pricing
 * ------------------------------------------------------------------ */

/**
 * Discounted amounts charged during a festival window. Only the currency and
 * plan combinations listed here have a matching festival plan at the payment
 * provider — everything else keeps its normal price.
 */
const FESTIVAL_AMOUNTS: Record<string, Partial<Record<PlanId, Record<BillingInterval, number>>>> = {
  INR: {
    starter: { month: 59, year: 59 },
    job_hunt: { month: 399, year: 399 },
    career_pro: { month: 999, year: 999 },
  },
};

/** Festival price for this plan, or null when the offer does not cover it. */
export function festivalAmount(
  pricing: CurrencyPricing,
  plan: PlanId,
  interval: BillingInterval,
): number | null {
  return FESTIVAL_AMOUNTS[pricing.code]?.[plan]?.[interval] ?? null;
}

export function hasFestivalPrice(pricing: CurrencyPricing, plan: PlanId): boolean {
  return !!FESTIVAL_AMOUNTS[pricing.code]?.[plan];
}

export function amountFor(
  pricing: CurrencyPricing,
  plan: PlanId,
  interval: BillingInterval,
  festival = false,
): number {
  if (festival) {
    const discounted = festivalAmount(pricing, plan, interval);
    if (discounted !== null) return discounted;
  }
  return interval === "year" ? annualAmount(pricing, plan) : baseAmount(pricing, plan);
}


/**
 * Crossed-out reference price for either billing interval. It is always the
 * list price (₹499/month, ₹1,599/year) — festivals only move the live price,
 * so the crossed-out figure stays the same before, during and after an offer.
 */
export function wasAmountFor(
  pricing: CurrencyPricing,
  plan: PlanId,
  interval: BillingInterval,
  _festival = false,
): number {
  return interval === "year" ? annualWasAmount(pricing, plan) : monthlyWasAmount(pricing, plan);
}



export function formatAmount(pricing: CurrencyPricing, amount: number): string {
  return `${pricing.symbol}${amount.toLocaleString("en-US")}`;
}


/** Whole-percent saving vs. the crossed-out reference price. */
export function savingPercent(
  pricing: CurrencyPricing,
  plan: PlanId,
  interval: BillingInterval,
  festival = false,
): number {
  const was = wasAmountFor(pricing, plan, interval, festival);
  const now = amountFor(pricing, plan, interval, festival);
  if (!was || now >= was) return 0;
  return Math.round((1 - now / was) * 100);
}

export function annualSavingPercent(pricing: CurrencyPricing, plan: PlanId): number {
  return savingPercent(pricing, plan, "year");
}

