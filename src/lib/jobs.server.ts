import { generateText, Output } from "ai";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { jobListingsSchema, type JobListing, type JobSearchInput } from "./jobs-schema";

const FIRECRAWL_GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";

const BOARD_GROUPS: string[] = [
  "site:linkedin.com/jobs OR site:indeed.com",
  "site:glassdoor.com OR site:glassdoor.co.in OR site:simplyhired.com OR site:ziprecruiter.com OR site:monster.com",
  "site:naukri.com OR site:shine.com OR site:foundit.in OR site:timesjobs.com OR site:instahyre.com OR site:cutshort.io OR site:hirist.tech",
  "site:lever.co OR site:greenhouse.io OR site:ashbyhq.com OR site:workable.com OR site:smartrecruiters.com OR site:myworkdayjobs.com OR site:icims.com",
  "site:wellfound.com OR site:remoteok.com OR site:weworkremotely.com OR site:remotive.com OR site:jobs.jobvite.com OR site:recruitee.com",
  "", // open web — company career pages
];

function baseQuery(input: JobSearchInput, withExtras: boolean): string {
  const parts = [`"${input.role}" job opening apply`];
  if (input.remoteOnly) parts.push("remote");
  // Quote the place so the search engine treats it as a hard term, not a hint.
  if (input.location && input.location !== "Worldwide") parts.push(`"${input.location}"`);
  if (input.experience) parts.push(input.experience);
  if (withExtras) {
    if (input.salaryRange) parts.push(`salary ${input.salaryRange}`);
    if (input.extraFilters) parts.push(input.extraFilters);
  }
  return parts.join(" ");
}

/**
 * Country searches: a posting in Oslo rarely spells out "Norway", so accept the
 * country's own boards/major cities as proof the job is in that country.
 */
const COUNTRY_ALIASES: Record<string, string[]> = {
  norway: ["norway", "norge", "oslo", "bergen", "trondheim", "stavanger", ".no/"],
  sweden: ["sweden", "sverige", "stockholm", "gothenburg", "goteborg", "malmo", ".se/"],
  denmark: ["denmark", "danmark", "copenhagen", "kobenhavn", "aarhus", ".dk/"],
  finland: ["finland", "helsinki", "espoo", "tampere", ".fi/"],
  netherlands: ["netherlands", "holland", "amsterdam", "rotterdam", "utrecht", "eindhoven", "the hague", ".nl/"],
  germany: ["germany", "deutschland", "berlin", "munich", "munchen", "hamburg", "frankfurt", "cologne", "stuttgart", ".de/"],
  france: ["france", "paris", "lyon", "marseille", "toulouse", "bordeaux", ".fr/"],
  spain: ["spain", "espana", "madrid", "barcelona", "valencia", "seville", ".es/"],
  italy: ["italy", "italia", "milan", "milano", "rome", "roma", "turin", ".it/"],
  portugal: ["portugal", "lisbon", "lisboa", "porto", ".pt/"],
  ireland: ["ireland", "dublin", "cork", "galway", ".ie/"],
  poland: ["poland", "polska", "warsaw", "warszawa", "krakow", "wroclaw", ".pl/"],
  switzerland: ["switzerland", "zurich", "geneva", "basel", "bern", ".ch/"],
  austria: ["austria", "vienna", "wien", "graz", ".at/"],
  belgium: ["belgium", "brussels", "antwerp", "ghent", ".be/"],
  "united kingdom": ["united kingdom", "england", "britain", "london", "manchester", "birmingham", "leeds", "glasgow", "edinburgh", "bristol", ".co.uk"],
  uk: ["united kingdom", "england", "london", "manchester", "birmingham", "edinburgh", ".co.uk"],
  "united states": ["united states", "usa", "new york", "san francisco", "chicago", "austin", "seattle", "boston", "los angeles", "dallas", "houston", "atlanta", "denver", "miami", "san jose", "san diego", "philadelphia", "phoenix", "portland", "washington, d.c."],
  usa: ["usa", "united states", "new york", "san francisco", "chicago", "austin", "seattle", "boston", "los angeles"],
  canada: ["canada", "toronto", "vancouver", "montreal", "calgary", "ottawa", "edmonton", ".ca/"],
  australia: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", ".com.au"],
  "new zealand": ["new zealand", "auckland", "wellington", "christchurch", ".co.nz"],
  india: ["india", "bengaluru", "bangalore", "mumbai", "delhi", "gurgaon", "gurugram", "noida", "hyderabad", "pune", "chennai", ".in/"],
  singapore: ["singapore", ".sg/"],
  "united arab emirates": ["united arab emirates", "uae", "dubai", "abu dhabi", "sharjah", ".ae/"],
  uae: ["uae", "united arab emirates", "dubai", "abu dhabi", ".ae/"],
  "saudi arabia": ["saudi arabia", "riyadh", "jeddah", "dammam", ".sa/"],
  qatar: ["qatar", "doha", ".qa/"],
  japan: ["japan", "tokyo", "osaka", "kyoto", "yokohama", ".jp/"],
  "south korea": ["south korea", "korea", "seoul", "busan", ".kr/"],
  china: ["china", "beijing", "shanghai", "shenzhen", "guangzhou", ".cn/"],
  "hong kong": ["hong kong", ".hk/"],
  malaysia: ["malaysia", "kuala lumpur", "penang", ".my/"],
  indonesia: ["indonesia", "jakarta", "bandung", "surabaya", ".id/"],
  philippines: ["philippines", "manila", "cebu", "makati", ".ph/"],
  vietnam: ["vietnam", "hanoi", "ho chi minh", "saigon", ".vn/"],
  thailand: ["thailand", "bangkok", ".th/"],
  "south africa": ["south africa", "johannesburg", "cape town", "durban", "pretoria", ".za/"],
  nigeria: ["nigeria", "lagos", "abuja", ".ng/"],
  kenya: ["kenya", "nairobi", ".ke/"],
  egypt: ["egypt", "cairo", "giza", ".eg/"],
  brazil: ["brazil", "brasil", "sao paulo", "rio de janeiro", "belo horizonte", ".br/"],
  mexico: ["mexico", "cdmx", "mexico city", "guadalajara", "monterrey", ".mx/"],
  colombia: ["colombia", "bogota", "medellin", "cali", "barranquilla"],
  argentina: ["argentina", "buenos aires", "cordoba", ".ar/"],
  chile: ["chile", "santiago", ".cl/"],
  peru: ["peru", "lima", ".pe/"],
  turkey: ["turkey", "turkiye", "istanbul", "ankara", "izmir", ".tr/"],
  israel: ["israel", "tel aviv", "jerusalem", "haifa", ".il/"],
  pakistan: ["pakistan", "karachi", "lahore", "islamabad", ".pk/"],
  bangladesh: ["bangladesh", "dhaka", ".bd/"],
  "sri lanka": ["sri lanka", "colombo", ".lk/"],
  nepal: ["nepal", "kathmandu", ".np/"],
  "texas": ["texas", ", tx", "austin", "dallas", "houston", "san antonio", "fort worth", "plano"],
  "california": ["california", ", ca", "san francisco", "los angeles", "san diego", "san jose", "oakland", "sacramento", "palo alto", "mountain view", "sunnyvale", "irvine"],
  "new york": ["new york", ", ny", "new york city", "brooklyn", "manhattan", "buffalo", "albany"],
  "washington": ["washington", ", wa", "seattle", "bellevue", "redmond", "tacoma", "kirkland"],
  "massachusetts": ["massachusetts", ", ma", "boston", "cambridge", "worcester"],
  "illinois": ["illinois", ", il", "chicago", "naperville"],
  "florida": ["florida", ", fl", "miami", "orlando", "tampa", "jacksonville"],
  "georgia": ["georgia", ", ga", "atlanta", "savannah"],
  "colorado": ["colorado", ", co", "denver", "boulder", "colorado springs"],
  "virginia": ["virginia", ", va", "arlington", "richmond", "reston", "mclean"],
  "north carolina": ["north carolina", ", nc", "charlotte", "raleigh", "durham"],
  "arizona": ["arizona", ", az", "phoenix", "tempe", "scottsdale", "tucson"],
  "new jersey": ["new jersey", ", nj", "newark", "jersey city", "princeton"],
  "pennsylvania": ["pennsylvania", ", pa", "philadelphia", "pittsburgh"],
  "ohio": ["ohio", ", oh", "columbus", "cleveland", "cincinnati"],
  "michigan": ["michigan", ", mi", "detroit", "ann arbor"],
  "minnesota": ["minnesota", ", mn", "minneapolis", "saint paul"],
  "oregon": ["oregon", ", or", "portland", "eugene"],
  "utah": ["utah", ", ut", "salt lake city", "provo"],
  "maryland": ["maryland", ", md", "baltimore", "bethesda"],
  "bay area": ["bay area", "san francisco", "san jose", "oakland", "palo alto", "mountain view", "sunnyvale", "santa clara"],
  "san francisco bay area": ["bay area", "san francisco", "san jose", "oakland", "palo alto", "mountain view", "sunnyvale", "santa clara"],
  "taiwan": ["taiwan", "taipei", ".tw/"],
  "czech republic": ["czech", "prague", "brno", ".cz/"],
  "romania": ["romania", "bucharest", "cluj", ".ro/"],
  "hungary": ["hungary", "budapest", ".hu/"],
  "greece": ["greece", "athens", "thessaloniki", ".gr/"],
  "ukraine": ["ukraine", "kyiv", "kiev", ".ua/"],
  "luxembourg": ["luxembourg", ".lu/"],
  "estonia": ["estonia", "tallinn", ".ee/"],
  "bahrain": ["bahrain", "manama", ".bh/"],
  "kuwait": ["kuwait", ".kw/"],
  "oman": ["oman", "muscat", ".om/"],
};

/**
 * Nearby areas: allowed in results but always ranked AFTER the searched place.
 * Only close neighbours (same metro / adjoining state). Far regions never appear.
 */
const NEARBY_PLACES: Record<string, string[]> = {
  "new york": ["new jersey", ", nj", "newark", "jersey city", "hoboken", "connecticut", ", ct", "stamford", "white plains", "long island"],
  "new york city": ["new jersey", ", nj", "newark", "jersey city", "hoboken", "connecticut", ", ct", "stamford", "long island"],
  "new jersey": ["new york", ", ny", "philadelphia", "pennsylvania", ", pa"],
  "texas": ["oklahoma", ", ok", "louisiana", ", la", "new mexico", ", nm", "arkansas"],
  "california": ["nevada", ", nv", "oregon", ", or", "arizona", ", az"],
  "bay area": ["sacramento", "santa cruz", "fremont", "san mateo", "redwood city", "berkeley"],
  "san francisco": ["oakland", "san jose", "palo alto", "berkeley", "san mateo", "bay area"],
  "seattle": ["bellevue", "redmond", "tacoma", "kirkland", "everett", "washington"],
  "washington": ["oregon", ", or", "idaho", ", id", "portland"],
  "boston": ["cambridge", "somerville", "worcester", "providence", "massachusetts"],
  "massachusetts": ["new hampshire", ", nh", "rhode island", ", ri", "connecticut", ", ct"],
  "chicago": ["illinois", "naperville", "evanston", "indiana", "milwaukee", "wisconsin"],
  "london": ["croydon", "reading", "slough", "watford", "surrey", "kent", "essex"],
  "toronto": ["mississauga", "brampton", "markham", "oakville", "hamilton", "ontario"],
  "dubai": ["abu dhabi", "sharjah", "ajman"],
  "bangalore": ["bengaluru", "mysore", "mysuru", "karnataka"],
  "bengaluru": ["bangalore", "mysore", "mysuru", "karnataka"],
  "mumbai": ["navi mumbai", "thane", "pune", "maharashtra"],
  "delhi": ["gurgaon", "gurugram", "noida", "faridabad", "ghaziabad", "new delhi"],
  "singapore": ["johor", "johor bahru"],
  "sydney": ["new south wales", "nsw", "parramatta", "newcastle"],
  "melbourne": ["victoria", "geelong"],
};

function nearbyTokens(location: string): string[] {
  const norm = location
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[,/|]+|\s+-\s+/)
    .map((p) => p.trim());
  const out = new Set<string>();
  for (const part of norm) for (const t of NEARBY_PLACES[part] ?? []) out.add(t);
  return [...out];
}

/** "Bogotá, Colombia" -> ["bogota", "colombia"] (accent-insensitive). */
function locationTokens(location: string): string[] {
  const parts = location
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[,/|]+|\s+-\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2 && !/^(worldwide|anywhere|any|remote)$/.test(p));
  const expanded = new Set(parts);
  for (const part of parts) {
    for (const alias of COUNTRY_ALIASES[part] ?? []) expanded.add(alias);
  }
  return [...expanded];
}


function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** True when text mentions any part of the searched place. */
function mentionsLocation(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const t = normalizeText(text);
  return tokens.some((token) => t.includes(token));
}


function buildQueries(input: JobSearchInput, groups?: number[]): string[] {
  // One wide pass per board group (role + place only). Salary / extra filters
  // are applied later by the model — baking them into the search string starves
  // the result set and doubles the number of round trips.
  const wide = baseQuery(input, false);
  const picked = groups ? groups.map((i) => BOARD_GROUPS[i] ?? "") : BOARD_GROUPS;
  return picked.map((group) => (group ? `${wide} ${group}` : `${wide} careers`));
}


/** Words that don't help decide whether a title is the same role. */
const ROLE_STOPWORDS = new Set(["a", "an", "the", "of", "and", "or", "for", "jobs", "job", "role", "roles"]);

function roleTokens(role: string): string[] {
  return role
    .toLowerCase()
    .replace(/[^a-z0-9+/ ]/g, " ")
    .split(/[\s/]+/)
    .filter((t) => t.length > 1 && !ROLE_STOPWORDS.has(t));
}

/**
 * Seniority tiers — used so a "Brand Manager" search never returns a
 * "Social Media Executive" / intern posting as if it were relevant.
 */
const SENIORITY_TIERS: { tier: number; pattern: RegExp }[] = [
  { tier: 0, pattern: /\b(intern|internship|trainee|apprentice)\b/i },
  { tier: 1, pattern: /\b(executive|associate|assistant|coordinator|junior|jr\.?|entry|fresher|officer|analyst|specialist|representative)\b/i },
  { tier: 2, pattern: /\b(manager|lead|senior|sr\.?|supervisor|consultant)\b/i },
  { tier: 3, pattern: /\b(head|director|principal|chief|vp|vice president|avp|gm|general manager|cxo|c[to|eo|mo|fo]{2})\b/i },
];

function seniorityTier(title: string): number | null {
  let found: number | null = null;
  for (const { tier, pattern } of SENIORITY_TIERS) {
    if (pattern.test(title)) found = found === null ? tier : Math.max(found, tier);
  }
  return found;
}

/** True when the listing is clearly a lower rung than what the user searched for. */
function isBelowRequestedSeniority(title: string, role: string): boolean {
  const wanted = seniorityTier(role);
  const got = seniorityTier(title);
  if (wanted === null || got === null) return false;
  return got < wanted;
}

/** How many of the role's own words appear in a listing title (0-1). */
function roleOverlap(title: string, role: string): number {
  const tokens = roleTokens(role);
  if (tokens.length === 0) return 0;
  const t = title.toLowerCase();
  return tokens.filter((token) => t.includes(token)).length / tokens.length;
}

/** True only when the listing title really is the role the user asked for. */
function titleMatchesRole(title: string, role: string): boolean {
  const t = title.toLowerCase();
  if (t.includes(role.toLowerCase())) return true;
  const tokens = roleTokens(role);
  if (tokens.length === 0) return false;
  return tokens.every((token) => t.includes(token));
}


const STALE_PATTERNS =
  /(no longer accepting|no longer available|no longer active|no longer open|no longer being accepted|this job (is|has) (closed|expired)|position (has been )?(filled|closed)|applications? (are |have )?closed|application (window|deadline) (has )?(closed|passed)|closed for applications|job expired|expired job|this (job|listing|posting) (has )?expired|posting (is |has been )?(closed|expired|inactive|removed)|not accepting applications|accepting applications is closed|vacancy (is )?closed|role (has been )?(filled|closed)|we are no longer hiring|we've filled this|hiring (for this role )?(is )?(closed|paused)|job (post(ing)?|ad) (is )?(no longer|removed)|this position is no longer|requisition (is )?(closed|cancelled)|sorry, this job|job not found|this opening is closed)/i;

/** Job pages that redirect to a generic careers/search index are usually gone. */
function redirectedToIndex(originalUrl: string, finalUrl: string): boolean {
  try {
    const from = new URL(originalUrl);
    const to = new URL(finalUrl);
    const fromDepth = from.pathname.replace(/\/+$/, "").split("/").filter(Boolean).length;
    const toPath = to.pathname.replace(/\/+$/, "");
    const toDepth = toPath.split("/").filter(Boolean).length;
    if (fromDepth < 2 || toDepth >= fromDepth) return false;
    return /^\/?(jobs?|careers?|search|openings|opportunities|vacancies)?$/i.test(toPath);
  } catch {
    return false;
  }
}

/**
 * Fetches a posting and reports whether it visibly says applications are closed.
 * Returns false whenever we can't tell (blocked, timeout, JS-only page) so a
 * live job is never dropped by a failed check.
 */
async function looksClosed(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    // 404/410 (and other client-side "gone" codes) mean the posting was taken down.
    if (res.status === 404 || res.status === 410 || res.status === 451) return true;
    if (!res.ok) return false;
    if (res.url && redirectedToIndex(url, res.url)) return true;
    const html = (await res.text()).slice(0, 400_000);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ");
    if (STALE_PATTERNS.test(text)) return true;
    // Structured job data marks expiry explicitly on many ATS/board pages.
    const validThrough = html.match(/"validThrough"\s*:\s*"([^"]+)"/);
    if (validThrough?.[1]) {
      const until = Date.parse(validThrough[1]);
      if (Number.isFinite(until) && until < Date.now()) return true;
    }
    // Very old postings are almost always filled even when the page stays up.
    const datePosted = html.match(/"datePosted"\s*:\s*"([^"]+)"/);
    if (datePosted?.[1]) {
      const posted = Date.parse(datePosted[1]);
      const maxAgeMs = 120 * 24 * 60 * 60 * 1000;
      if (Number.isFinite(posted) && Date.now() - posted > maxAgeMs) return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Drops postings whose own page says they're closed. Runs a few at a time. */
async function dropClosedListings(jobs: JobListing[]): Promise<JobListing[]> {
  const checks = await runPooled(
    jobs.map((job) => () => looksClosed(job.url)),
    10,
  );
  return jobs.filter((_, i) => {
    const r = checks[i];
    return !(r && r.status === "fulfilled" && r.value === true);
  });
}


/** Strips tracking params / trailing slashes so the same posting is not listed twice. */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}


type RawResult = { url?: string; title?: string; description?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function firecrawlSearch(query: string, limit: number, attempt = 0): Promise<RawResult[]> {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const connectionKey = process.env.FIRECRAWL_API_KEY;
  const direct = process.env.FIRECRAWL_DIRECT !== "0";
  if (!connectionKey || (!direct && !lovableApiKey)) {
    throw new Error("Job search is not configured yet. Please try again later.");
  }

  // Direct mode: the user's own Firecrawl key, no Lovable connector gateway.
  const response = await fetch(
    direct ? "https://api.firecrawl.dev/v2/search" : `${FIRECRAWL_GATEWAY}/search`,
    {
      method: "POST",
      headers: direct
        ? { "Content-Type": "application/json", Authorization: `Bearer ${connectionKey}` }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
            "X-Connection-Api-Key": connectionKey,
          },
      body: JSON.stringify({ query, limit, tbs: "qdr:m" }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.error(`Firecrawl search failed [${response.status}]: ${body}`);
    if (response.status === 402) {
      throw new Error("Job search is refreshing its sources right now. Please try again in a few minutes.");
    }
    // Rate limited / transient — back off and retry a couple of times.
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 8000)
        : 1200 * 2 ** attempt;
      await sleep(waitMs);
      return firecrawlSearch(query, limit, attempt + 1);
    }
    if (response.status === 429) {
      throw new Error("Job searches are busy right now. Please wait a few seconds and try again.");
    }
    throw new Error(`Job search failed (${response.status}). Please try again.`);
  }

  const payload = (await response.json()) as {
    data?: RawResult[] | { web?: RawResult[] };
    results?: RawResult[];
  };
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.web)) return data.web;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

/** Runs tasks a few at a time so the search gateway isn't rate limited. */
async function runPooled<T>(tasks: (() => Promise<T>)[], concurrency: number) {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (next < tasks.length) {
      const index = next++;
      try {
        results[index] = { status: "fulfilled", value: await tasks[index]() };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function sourceFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}

async function searchViaFirecrawl(input: JobSearchInput, queries: string[]): Promise<JobListing[]> {
  const settled = await runPooled(
    queries.map((query) => () => firecrawlSearch(query, 25)),
    // All board queries are independent, so run them in a single wave.
    queries.length,
  );
  const ok = settled.filter((r) => r.status === "fulfilled") as PromiseFulfilledResult<RawResult[]>[];
  if (ok.length === 0) {
    const firstError = settled.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw firstError?.reason instanceof Error
      ? firstError.reason
      : new Error("Job search failed. Please try again.");
  }


  const seen = new Set<string>();
  const all: { url: string; title: string; description: string; source: string }[] = [];
  for (const result of ok) {
    for (const r of result.value) {
      if (typeof r.url !== "string" || r.url.length === 0) continue;
      const key = normalizeUrl(r.url);
      if (seen.has(key)) continue;
      seen.add(key);
      const title = r.title ?? "";
      const description = (r.description ?? "").slice(0, 180);
      // Drop postings that already say they're closed/expired.
      if (STALE_PATTERNS.test(`${title} ${description}`)) continue;
      // Drop junior/intern rungs when the user searched for a senior title.
      if (isBelowRequestedSeniority(title, input.role)) continue;
      all.push({ url: r.url, title, description, source: sourceFromUrl(r.url) });
    }
  }

  if (all.length === 0) return [];

  // Keep only results that actually mention the searched place. A city search
  // must not fall back to postings from somewhere else.
  const placeTokens = input.location && input.location !== "Worldwide"
    ? locationTokens(input.location)
    : [];
  const candidateText = (c: { title: string; description: string; url: string }) =>
    `${c.title} ${c.description} ${c.url}`;
  const inPlace = placeTokens.length
    ? all.filter((c) => mentionsLocation(candidateText(c), placeTokens))
    : all;
  // Close neighbours (never far regions) may follow, ranked strictly after the exact place.
  const nearTokens = placeTokens.length ? nearbyTokens(input.location ?? "") : [];
  const inPlaceUrls = new Set(inPlace.map((c) => c.url));
  const nearby = nearTokens.length
    ? all.filter((c) => !inPlaceUrls.has(c.url) && mentionsLocation(candidateText(c), nearTokens))
    : [];
  const nearbyUrls = new Set(nearby.map((c) => c.url));
  const pool = inPlace.length > 0 ? inPlace : [];
  if (pool.length === 0 && nearby.length === 0) return [];

  // Exact-role matches first, then the closest adjacent roles by word overlap.
  const exact = pool.filter((c) => titleMatchesRole(c.title, input.role));
  const exactUrls = new Set(exact.map((c) => c.url));
  const related = pool
    .filter((c) => !exactUrls.has(c.url))
    // Keep only genuinely adjacent roles — at least half the role's words must match.
    .filter((c) => roleOverlap(c.title, input.role) >= 0.34)
    .sort((a, b) => roleOverlap(b.title, input.role) - roleOverlap(a.title, input.role));


  // Interleave by source with a per-domain cap so one board (usually LinkedIn)
  // can't swallow the whole shortlist and hide Indeed/Glassdoor/company sites.
  const diversify = (list: typeof all, perSourceCap: number) => {
    const bySource = new Map<string, typeof all>();
    for (const c of list) {
      const bucket = bySource.get(c.source) ?? [];
      if (bucket.length < perSourceCap) bucket.push(c);
      bySource.set(c.source, bucket);
    }
    const buckets = [...bySource.values()];
    const out: typeof all = [];
    for (let i = 0; buckets.some((b) => i < b.length); i++) {
      for (const b of buckets) if (i < b.length) out.push(b[i]);
    }
    return out;
  };

  const exactShortlist = [...diversify(exact, 14), ...diversify(related, 8)].slice(0, 90);
  const nearbyShortlist = nearby
    .filter((c) => titleMatchesRole(c.title, input.role) || roleOverlap(c.title, input.role) >= 0.5)
    .slice(0, 20);
  const shortlist = [
    ...exactShortlist.map((c) => ({ ...c, area: "exact-place" })),
    ...nearbyShortlist.map((c) => ({ ...c, area: "nearby" })),
  ];


  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);

  const prompt = `You are a job-search assistant. Below are raw web search results for someone looking for a "${input.role}" role.

User filters:
- Location: ${input.location || "any"}
- Remote only: ${input.remoteOnly ? "yes" : "no"}
- Experience level: ${input.experience || "any"}
- Expected yearly salary: ${input.salaryRange || "any"}
- Extra requirements: ${input.extraFilters || "none"}

Turn these results into a clean list of job listings.
Rules:
- Set match = "exact" when the job title IS the "${input.role}" role (or an obvious synonym).
- Set match = "related" ONLY for roles in the same job family AND at the same seniority level as "${input.role}". Never downgrade seniority: for a Manager search do not return Executive, Associate, Coordinator, Assistant, Intern, or Trainee roles; for a Head/Director search do not return Manager roles. Drop anything from a different field.
- Salary filter (${input.salaryRange || "not set"}): drop a listing only when its stated pay is clearly below that range. If pay is not stated, KEEP the listing and write "Not specified".
- Each result has an "area" field. "exact-place" results are in the searched place; "nearby" results are in a close neighbouring area. Keep nearby results only if they are otherwise valid, list ALL exact-place results BEFORE any nearby result, and never move a nearby result above an exact-place one. Set the job's location to its real city/region.
- Location is a HARD filter${input.location && input.location !== "Worldwide" ? ` (${input.location})` : ""}: drop every listing that is not in that city/region (the only exception: "nearby"-area results as described above; drop everything farther away)${input.remoteOnly ? ", unless it is fully remote and open to that region" : ""}. Do not substitute a nearby or different city, state, or country. Copy the listing's real location text into "location"; if the result does not clearly belong to that place, drop it instead of guessing.
- Experience: drop a listing only when it clearly contradicts it. If unclear, keep it.
- Extra requirements are soft preferences. If the user set none, do not invent any.
- Only include results that are an actual, currently open job posting. Drop blogs, courses, salary guides, generic company pages, and job-category/search pages.
- Drop any posting that says it is closed, expired, filled, or no longer accepting applications.
- Keep the url EXACTLY as given. Never invent a url.
- If a field is unknown, write "Not specified" — never guess a salary.
- workMode must be one of: Remote, Hybrid, On-site, Not specified.
- summary: one sentence, max 25 words, about what the role involves.
- Never return the same job twice: if two results are the same role at the same company, keep only one (prefer the direct company/ATS link).
- Be generous: return EVERY qualifying listing you can, up to 45 — all exact matches first, then related roles. Returning too few is worse than including a borderline one.

RESULTS:
${JSON.stringify(shortlist)}`;


  let output: { jobs?: JobListing[] } | undefined;
  try {
    ({ output } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) => generateText({
      model: gateway(modelId),
      output: Output.object({ schema: jobListingsSchema }),
      prompt,
    })));
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }

  const allowed = new Set(shortlist.map((c) => c.url));
  const byUrl = new Map(shortlist.map((c) => [c.url, c]));
  const outUrls = new Set<string>();
  const outIdentity = new Set<string>();
  const jobs: JobListing[] = [];
  for (const job of output?.jobs ?? []) {
    if (!allowed.has(job.url)) continue;
    if (STALE_PATTERNS.test(`${job.title} ${job.summary}`)) continue;
    // Final guard: never show a lower rung than the searched role.
    if (isBelowRequestedSeniority(job.title, input.role)) continue;
    // Final guard: the listing must belong to the place the user searched.
    if (placeTokens.length) {
      const remoteOk = input.remoteOnly && /remote/i.test(`${job.workMode} ${job.location}`);
      const candidate = byUrl.get(job.url);
      const matchesPlace =
        mentionsLocation(job.location ?? "", placeTokens) ||
        (candidate ? mentionsLocation(candidateText(candidate), placeTokens) : false);
      const matchesNearby =
        nearTokens.length > 0 &&
        (mentionsLocation(job.location ?? "", nearTokens) || nearbyUrls.has(job.url));
      if (!remoteOk && !matchesPlace && !matchesNearby) continue;
    }
    const urlKey = normalizeUrl(job.url);
    const identity = `${job.title}|${job.company}`.toLowerCase().replace(/\s+/g, " ").trim();
    if (outUrls.has(urlKey) || outIdentity.has(identity)) continue;
    outUrls.add(urlKey);
    outIdentity.add(identity);
    jobs.push({
      ...job,
      location: job.location && job.location !== "Not specified" ? job.location : input.location || "Not specified",
      match: titleMatchesRole(job.title, input.role) ? "exact" : job.match ?? "related",
    });
  }
  // Safety net: when the model over-filters, top the list up straight from the
  // search results so a broad role never comes back with only 2-3 openings.

  if (jobs.length < 15) {
    for (const c of shortlist) {
      if (jobs.length >= 15) break;
      const urlKey = normalizeUrl(c.url);
      if (outUrls.has(urlKey)) continue;
      const isExact = titleMatchesRole(c.title, input.role);
      if (!isExact && roleOverlap(c.title, input.role) < 0.5) continue;
      const cleanTitle = c.title.split(/\s+[-|–—]\s+/)[0]?.trim() || c.title;
      const company = c.title.split(/\s+[-|–—]\s+/)[1]?.trim() || c.source;
      outUrls.add(urlKey);
      jobs.push({
        title: cleanTitle.slice(0, 120),
        company: company.slice(0, 80),
        location: input.location || "Not specified",
        workMode: input.remoteOnly ? "Remote" : "Not specified",
        experience: input.experience || "Not specified",
        salary: "Not specified",
        source: c.source,
        url: c.url,
        summary: c.description.slice(0, 160) || "Open role listed on " + c.source,
        match: isExact ? "exact" : "related",
      });
    }
  }

  // Open each posting and drop the ones that say applications are closed.
  const live = await dropClosedListings(jobs);

  // Searched place first, nearby areas strictly after; within each, exact role matches first.
  const tier = (j: JobListing) =>
    placeTokens.length && !mentionsLocation(j.location ?? "", placeTokens) && nearbyUrls.has(j.url) ? 1 : 0;
  return live.sort((a, b) => {
    if (tier(a) !== tier(b)) return tier(a) - tier(b);
    return a.match === b.match ? 0 : a.match === "exact" ? -1 : 1;
  });
}





const MIN_RESULTS = 7;

/** Which board groups to query: fewer for Free (saves Firecrawl credits). */
function firecrawlGroups(input: JobSearchInput, tier: string): number[] {
  const regional = /india|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|kolkata|gurgaon|noida|shimla/i.test(input.location ?? "") ? 2 : 1;
  return tier === "free" ? [0, regional, 5] : [0, regional, 3, 5];
}


/** Adzuna listings for a search, filtered to the exact role and adjacent roles, merged after `jobs`. */
async function adzunaPipeline(input: JobSearchInput, country: string, jobs: JobListing[], want = MIN_RESULTS): Promise<JobListing[]> {
  const src = await import("./job-sources.server");
  const base = { role: input.role, location: input.location, remoteOnly: input.remoteOnly, country };
  let extra = await src.adzunaSearch(base);
  if (jobs.length + extra.length < want) {
    const more = await src.adzunaSearch({ ...base, orMode: true });
    const have = new Set(extra.map((j) => normalizeUrl(j.url)));
    extra = [...extra, ...more.filter((j) => !have.has(normalizeUrl(j.url)))];
  }
  const seen = new Set(jobs.map((j) => normalizeUrl(j.url)));
  const identity = new Set(jobs.map((j) => `${j.title}|${j.company}`.toLowerCase()));
  const accepted: JobListing[] = [];
  for (const j of extra) {
    if (seen.has(normalizeUrl(j.url))) continue;
    const id = `${j.title}|${j.company}`.toLowerCase();
    if (identity.has(id)) continue;
    if (isBelowRequestedSeniority(j.title, input.role)) continue;
    const exact = titleMatchesRole(j.title, input.role);
    // Exact role first, then adjacent roles; never unrelated ones.
    if (!exact && roleOverlap(j.title, input.role) < 0.34) continue;
    seen.add(normalizeUrl(j.url));
    identity.add(id);
    accepted.push({ ...j, match: exact ? "exact" : "related" });
  }
  const merged = [...jobs, ...accepted];
  merged.sort((a, b) => (a.match === b.match ? 0 : a.match === "exact" ? -1 : 1));
  return merged;
}

/** Alerts use Adzuna only (never Firecrawl). */
export async function searchAlertListings(input: JobSearchInput, visitorCountry?: string | null): Promise<JobListing[]> {
  const src = await import("./job-sources.server");
  const country = src.adzunaCountryFor(input.location, visitorCountry);
  if (!country) return [];
  return adzunaPipeline(input, country, [], 8);
}

/**
 * Live search. One source at a time: Firecrawl first (paid plans always, Free only
 * while credits comfortably remain), Adzuna second when Firecrawl is not allowed,
 * fails, runs out or returns too few. Always aims for at least MIN_RESULTS.
 */
export async function searchJobListings(
  input: JobSearchInput,
  opts: { tier?: "free" | "starter" | "job_hunt" | "career_pro"; country?: string | null } = {},
): Promise<JobListing[]> {
  const tier = opts.tier ?? "free";
  const src = await import("./job-sources.server");
  // Gulf / Japan / Korea: clear "not available yet" before anything is spent.
  const adzunaCountry = src.adzunaCountryFor(input.location, opts.country);

  let jobs: JobListing[] = [];
  let firstError: unknown = null;
  if (await src.mayUseFirecrawl(tier)) {
    try {
      jobs = await searchViaFirecrawl(input, buildQueries(input, firecrawlGroups(input, tier)));
      const { countCall } = await import("./model-router.server");
      await countCall("firecrawl-search");
    } catch (error) {
      firstError = error;
      console.warn("[jobs] firecrawl path failed, trying Adzuna", error);
    }
  }
  if (jobs.length >= MIN_RESULTS) return jobs;

  if (!adzunaCountry) {
    if (jobs.length > 0) return jobs;
    const { userError } = await import("./safe-error.server");
    throw userError("Job sources for this place are refreshing. Please try again in a few minutes.");
  }

  try {
    return await adzunaPipeline(input, adzunaCountry, jobs);
  } catch (error) {
    if (jobs.length > 0) return jobs;
    throw error instanceof Error && (error as any).userFacing ? error : firstError ?? error;
  }
}
