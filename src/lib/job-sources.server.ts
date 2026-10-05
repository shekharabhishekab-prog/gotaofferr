/**
 * Job sources beyond the main web search: Firecrawl credit check (decides who
 * may use Firecrawl), and the Adzuna backup source. Server only.
 * Free tiers only: Adzuna calls are capped per day below its free limit.
 */
import type { JobListing } from "./jobs-schema";
import { UserFacingError } from "./safe-error.server";

export type SearchTier = "free" | "starter" | "job_hunt" | "career_pro";

/** Free users only use Firecrawl while this many credits remain (half the monthly plan). */
export const FIRECRAWL_FREE_RESERVE = 500;
const CREDIT_CACHE_MS = 5 * 60 * 1000;
let creditCache: { at: number; remaining: number | null } | null = null;

/** Remaining Firecrawl credits, or null when it cannot be read. Cached ~5 min. */
export async function firecrawlCreditsRemaining(): Promise<number | null> {
  if (creditCache && Date.now() - creditCache.at < CREDIT_CACHE_MS) return creditCache.remaining;
  const key = process.env.FIRECRAWL_API_KEY;
  let remaining: number | null = null;
  if (key) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/team/credit-usage", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        const j = (await res.json()) as any;
        const v = j?.data?.remainingCredits ?? j?.data?.remaining_credits ?? j?.remainingCredits;
        if (typeof v === "number") remaining = v;
      }
    } catch (e) {
      console.warn("[firecrawl] credit check failed", e);
    }
  }
  creditCache = { at: Date.now(), remaining };
  return remaining;
}

/** Paid plans: Firecrawl first. Free: only while credits comfortably remain. */
export async function mayUseFirecrawl(tier: SearchTier): Promise<boolean> {
  if (!process.env.FIRECRAWL_API_KEY) return false;
  const remaining = await firecrawlCreditsRemaining();
  if (tier === "free") return remaining !== null && remaining > FIRECRAWL_FREE_RESERVE;
  return remaining === null || remaining > 0;
}

/** Adzuna country codes with a real job index. */
const ADZUNA_COUNTRIES = new Set([
  "in", "us", "gb", "de", "za", "ca", "au", "sg", "fr", "es", "mx", "it", "br", "nl", "pl", "at", "nz", "be", "ch",
]);

/** Visitor ISO code -> Adzuna code (UK is "gb"). */
const ISO_TO_ADZUNA: Record<string, string> = { GB: "gb", UK: "gb" };

/** Place words that tell us the country the user is searching in. */
const PLACE_TO_COUNTRY: [RegExp, string][] = [
  [/\b(india|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|kolkata|gurgaon|gurugram|noida|ahmedabad|jaipur|shimla|chandigarh|kochi|indore|lucknow)\b/i, "in"],
  [/\b(united states|usa|u\.s\.|new york|california|texas|chicago|seattle|boston|austin|san francisco|los angeles)\b/i, "us"],
  [/\b(united kingdom|uk|england|london|manchester|scotland|wales|birmingham|leeds)\b/i, "gb"],
  [/\b(germany|berlin|munich|hamburg|frankfurt|deutschland)\b/i, "de"],
  [/\b(canada|toronto|vancouver|montreal|ottawa|calgary)\b/i, "ca"],
  [/\b(australia|sydney|melbourne|brisbane|perth)\b/i, "au"],
  [/\b(singapore)\b/i, "sg"],
  [/\b(south africa|johannesburg|cape town|durban)\b/i, "za"],
  [/\b(france|paris|lyon|marseille)\b/i, "fr"],
  [/\b(spain|madrid|barcelona)\b/i, "es"],
  [/\b(mexico|cdmx)\b/i, "mx"],
  [/\b(italy|milan|rome)\b/i, "it"],
  [/\b(brazil|sao paulo|rio de janeiro)\b/i, "br"],
  [/\b(netherlands|amsterdam|rotterdam)\b/i, "nl"],
  [/\b(poland|warsaw|krakow)\b/i, "pl"],
  [/\b(austria|vienna)\b/i, "at"],
  [/\b(new zealand|auckland|wellington)\b/i, "nz"],
  [/\b(belgium|brussels)\b/i, "be"],
  [/\b(switzerland|zurich|geneva)\b/i, "ch"],
];

/** Gulf, Japan and Korea have no source yet. */
const NOT_AVAILABLE =
  /\b(uae|united arab emirates|dubai|abu dhabi|saudi|riyadh|qatar|doha|kuwait|bahrain|oman|muscat|japan|tokyo|osaka|korea|seoul|busan)\b/i;

export class SourceUnavailableError extends UserFacingError {}

export function adzunaCountryFor(location: string | undefined, visitorIso?: string | null): string | null {
  const loc = location ?? "";
  if (NOT_AVAILABLE.test(loc)) throw new SourceUnavailableError("Job search is not available in this country yet. We are working on it.");
  for (const [re, code] of PLACE_TO_COUNTRY) if (re.test(loc)) return code;
  if (!loc || /worldwide|anywhere|remote/i.test(loc)) {
    const iso = (visitorIso ?? "").toUpperCase();
    const code = ISO_TO_ADZUNA[iso] ?? iso.toLowerCase();
    if (ADZUNA_COUNTRIES.has(code)) return code;
  }
  return null;
}

function money(min?: number, max?: number, country?: string): string {
  if (!min && !max) return "Not specified";
  const sym = ({ in: "₹", us: "$", gb: "£", ca: "CA$", au: "A$", sg: "S$", de: "€", fr: "€", es: "€", it: "€", nl: "€", at: "€", be: "€", pl: "zł ", br: "R$", mx: "MX$", nz: "NZ$", ch: "CHF ", za: "R" } as Record<string, string>)[country ?? ""] ?? "";
  const f = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n)));
  const a = min ? f(min) : "";
  const b = max ? f(max) : "";
  return (a && b && a !== b ? `${sym}${a} - ${sym}${b}` : `${sym}${a || b}`) + " / year";
}

/** One Adzuna search. Returns listings ready to show. Counts against the daily cap. */
export async function adzunaSearch(opts: {
  role: string;
  location?: string;
  remoteOnly?: boolean;
  country: string;
  orMode?: boolean;
}): Promise<JobListing[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) throw new SourceUnavailableError("Job sources are refreshing. Please try again in a few minutes.");
  const { countCall } = await import("./model-router.server");
  if (!(await countCall("adzuna-search"))) {
    throw new SourceUnavailableError("Job sources are refreshing. Please try again in a few minutes.");
  }
  const p = new URLSearchParams({
    app_id: id,
    app_key: key,
    results_per_page: "50",
    "content-type": "application/json",
    max_days_old: "30",
    sort_by: "relevance",
  });
  const what = opts.remoteOnly ? `${opts.role} remote` : opts.role;
  if (opts.orMode) p.set("what_or", what.replace(/[^\p{L}\p{N} ]/gu, " "));
  else p.set("what_phrase", opts.role);
  if (opts.location && !/worldwide|anywhere|remote/i.test(opts.location)) {
    // Adzuna "where" takes a place name; drop a trailing country word.
    p.set("where", opts.location.split(",")[0]!.trim());
  }
  const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${opts.country}/search/1?${p}`);
  if (!res.ok) {
    console.error("[adzuna] failed", res.status);
    throw new SourceUnavailableError("Job sources are refreshing. Please try again in a few minutes.");
  }
  const j = (await res.json()) as any;
  const out: JobListing[] = [];
  for (const r of j?.results ?? []) {
    if (!r?.redirect_url || !r?.title) continue;
    const text = `${r.title} ${r.description ?? ""} ${r.location?.display_name ?? ""}`;
    out.push({
      title: String(r.title).replace(/<[^>]+>/g, "").slice(0, 120),
      company: String(r.company?.display_name ?? "Company not listed").slice(0, 80),
      location: String(r.location?.display_name ?? opts.location ?? "Not specified"),
      workMode: /remote/i.test(text) ? "Remote" : /hybrid/i.test(text) ? "Hybrid" : "Not specified",
      experience: "Not specified",
      salary: money(r.salary_min, r.salary_max, opts.country),
      source: "Adzuna",
      url: String(r.redirect_url),
      summary: String(r.description ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 160) || "Open role",
      match: "related",
    } as JobListing);
  }
  return out;
}
