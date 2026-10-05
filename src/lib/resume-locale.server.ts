import { getRequest } from "@tanstack/react-start/server";

/**
 * Resume conventions differ sharply by market: a US resume that carries a
 * photo and date of birth gets binned, while an Indian or German CV that
 * omits expected details looks incomplete. We resolve the applicant's country
 * from edge/CDN geo headers and feed the matching rules into the prompt.
 */

export type ResumeMarket = {
  /** ISO country code we resolved, or null when unknown. */
  country: string | null;
  /** Human label used in the prompt. */
  label: string;
  /** Market-specific writing rules. */
  rules: string[];
};

const GEO_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
  "x-geo-country",
  "fastly-client-country",
];

/** Best-effort country of the person whose resume we are rewriting. */
export function detectCountry(): string | null {
  try {
    const m = /(?:^|;\s*)gtest_country=([A-Za-z]{2})/.exec(getRequest().headers.get("cookie") || "");
    if (m) return m[1].toUpperCase();
  } catch {
    /* no request */
  }
  for (const name of GEO_HEADERS) {
    let value: string | undefined;
    try {
      value = getRequest().headers.get(name) ?? undefined;
    } catch {
      value = undefined;
    }
    if (value && /^[A-Za-z]{2}$/.test(value) && value.toUpperCase() !== "XX") {
      return value.toUpperCase();
    }
  }
  return null;
}

const COMMON_NO_PHOTO = [
  "Do not include a photo, date of birth, age, gender, marital status, nationality or religion. Recruiters discard resumes carrying them.",
];

/**
 * Currency is a hard fact. Converting "₹90" into "AUD 90" (or any other
 * currency) silently rewrites the candidate's history, so market currency
 * guidance only applies to figures the source resume already states in that
 * currency.
 */
const CURRENCY_TRUTH = [
  "NEVER convert, re-denominate or relabel a money figure. Reproduce every budget, salary, revenue and valuation in the exact currency and symbol the source resume uses (₹, INR, Rs, $, £, €). Writing an Indian rupee figure as AUD/USD is a factual error.",
];


/** Gulf CVs expect a personal block and a plainly stated visa position. */
const GULF_RULES = (currency: string): string[] => [
  "A4, two-page CV, formal tone, full month names in every date (January 2024, not Jan 2024).",
  "Include a short Personal Information block (date of birth, nationality, marital status) ONLY where the source resume already states those details. Never invent them.",
  `Quantify in ${currency} or USD, whichever the source resume uses. Never convert a figure to make it look larger.`,
  "Add a one-line context or scale note for home-country employers a Gulf reader may not recognise.",
  "Include a short Personal Attributes section (work ethic, reliability, cultural adaptability, long-term commitment) only when the source resume supports those claims.",
  "State visa status or relocation intent plainly in the header when the source resume mentions it.",
  "Name regional (GCC/MENA) exposure wherever the source supports it.",
];

/** SEA resumes run longer and denser than a US resume. */
const SEA_RULES = (currency: string): string[] => [
  ...COMMON_NO_PHOTO,
  `A4, formal and comprehensive structure. More detail is acceptable than a US resume. Amounts in ${currency} or USD, exactly as the source states them.`,
  "Keep skills and keyword density high; parsers in this region lean hard on keyword matching.",
  "State relocation willingness and target cities plainly when the source resume mentions them; never invent work-pass status.",
];

const MARKETS: Record<string, { label: string; rules: string[] }> = {
  US: {
    label: "United States",
    rules: [
      ...COMMON_NO_PHOTO,
      'Call the document a "Resume". Keep it to one page for under 10 years of experience, two pages at most.',
      "Contact items (each its own line): full name, city and state (no street address), phone in +1 (XXX) XXX-XXXX form, professional email, LinkedIn.",
      "Use US spelling (organize, analyze, program) and Mon YYYY - Mon YYYY date ranges (month as 3 letters, so every ATS reads tenure).",
      "Use US units. Keep every money figure in the currency the source resume states; never restate it in another currency.",
      "Lead with impact and metrics. No objective statement, no references line, no personal details.",
      "Translate non-US credentials into their US equivalent in plain wording (for example, \"B.Tech (equivalent to BS in Computer Science)\"). Do not list marks/percentages; add GPA only if the source resume has one.",
    ],
  },
  CA: {
    label: "Canada",
    rules: [
      ...COMMON_NO_PHOTO,
      "One to two pages. Contact items (each its own line): name, city and province, phone, email, LinkedIn.",
      "Canadian spelling (organize, but centre, labour). Quantify in CAD ($).",
      "Note Canadian work authorization only if the source resume states it.",
    ],
  },
  GB: {
    label: "United Kingdom",
    rules: [
      ...COMMON_NO_PHOTO,
      'Call the document a "CV". Two pages is standard.',
      "Open with a short personal statement instead of a US-style summary.",
      "British spelling (organise, analyse, programme) and DD/MM/YYYY or Mon YYYY dates. Quantify in GBP (£).",
      "Keep degree classifications as written (for example, 2:1) and use UK job-title conventions.",
    ],
  },
  IE: { label: "Ireland", rules: [...COMMON_NO_PHOTO, "CV format, up to two pages, British/Irish spelling, amounts in EUR (€)."] },
  IN: {
    label: "India",
    rules: [
      "One to two pages. Contact items (each its own line): name, city, phone with +91, email, LinkedIn.",
      "Include education prominently with institution and year; keep percentage/CGPA only if the source resume has it.",
      "Keep notice period, current CTC or expected CTC only when the source resume states them. Never invent them. When the source states a notice period, state it explicitly in the header or Additional section.",
      "Indian English spelling is fine. Quantify in INR using lakh/crore where the source does (for example, ₹1.2 Cr revenue).",
      "Do not add photo, date of birth, father's name or marital status unless the source resume already has them.",
    ],
  },
  AE: { label: "United Arab Emirates", rules: [...GULF_RULES("AED")] },
  SA: { label: "Saudi Arabia", rules: [...GULF_RULES("SAR")] },
  QA: { label: "Qatar", rules: [...GULF_RULES("QAR")] },
  KW: { label: "Kuwait", rules: [...GULF_RULES("KWD")] },
  BH: { label: "Bahrain", rules: [...GULF_RULES("BHD")] },
  OM: { label: "Oman", rules: [...GULF_RULES("OMR")] },
  TH: { label: "Thailand", rules: [...SEA_RULES("THB")] },
  MY: { label: "Malaysia", rules: [...SEA_RULES("MYR")] },
  VN: { label: "Vietnam", rules: [...SEA_RULES("VND")] },
  ID: { label: "Indonesia", rules: [...SEA_RULES("IDR")] },
  PH: { label: "Philippines", rules: [...SEA_RULES("PHP")] },
  AU: {
    label: "Australia",
    rules: [
      ...COMMON_NO_PHOTO,
      "Two to three pages is normal. Australian spelling (organise, specialise). Amounts in AUD ($).",
      "Include a short key-skills block up top; note visa/work rights only if the source resume states them.",
      "Warmer, more conversational tone than a US or UK resume: confident and plain-spoken, never aggressive self-promotion.",
      'Add a short "What I Bring" block (3-4 plain lines about working style and strengths) only when the source resume supports those claims.',
      "State visa or sponsorship status plainly and by its specific name (for example, Subclass 482) when the source resume states it.",
    ],
  },
  NZ: {
    label: "New Zealand",
    rules: [
      ...COMMON_NO_PHOTO,
      "Two-page CV, Australian/NZ spelling, amounts in NZD ($).",
      "Warm, conversational and confident tone rather than aggressive self-promotion.",
      'Add a short "What I Bring" block only when the source resume supports it, and name visa/work-rights status specifically when stated.',
    ],
  },

  DE: {
    label: "Germany",
    rules: [
      "German CVs (Lebenslauf) are factual and reverse-chronological with complete, gap-free date ranges (MM/YYYY - MM/YYYY).",
      "Keep degree titles in their original form (Diplom, M.Sc., Ausbildung). Amounts in EUR (€).",
      "Plain, precise wording over salesy phrasing. Include language levels (for example, German B2) when the source lists them.",
      "Do not add a photo or personal data unless the source resume already includes them.",
    ],
  },
  FR: { label: "France", rules: ["One-page CV for most candidates, two for senior profiles. Amounts in EUR (€).", "Keep French qualification names as written, list language levels, and use factual, restrained wording."] },
  NL: { label: "Netherlands", rules: [...COMMON_NO_PHOTO, "Two-page CV, direct and factual tone, amounts in EUR (€), include language levels."] },
  SG: { label: "Singapore", rules: ["Two-page resume. Amounts in SGD ($). Note work-pass status only if the source resume states it.", "Highlight regional (APAC/SEA) scope where the source supports it."] },
  ZA: { label: "South Africa", rules: ["Two to three page CV, British spelling, amounts in ZAR (R). Keep qualification names as written."] },
};

/** Prompt-ready market rules for a country code. */
export function resumeMarket(country: string | null): ResumeMarket {
  const code = country?.toUpperCase() ?? null;
  const match = code ? MARKETS[code] : undefined;
  if (match) return { country: code, label: match.label, rules: [...match.rules, ...CURRENCY_TRUTH] };
  return {
    country: code,
    label: code ? `the candidate's market (${code})` : "the country of the job (read it from the job description)",
    rules: [
      ...COMMON_NO_PHOTO,
      "The resume format follows the country of the JOB, never the country where the applicant lives. Work out the job's country from the job description (city, state, currency, company address, legal terms) and use that country's resume conventions: contact details, date format, spelling, page length, which personal details are normal. Only if the ad gives no clue at all, follow the source resume's own conventions.",
      "Use a clean, internationally readable one to two page format with Mon YYYY date ranges.",
      "Keep currency, spelling and qualification names exactly as the source resume and the job description use them.",
      ...CURRENCY_TRUTH,
    ],
  };
}

/** Cover-letter conventions per market (greeting, length, tone, sign-off). */
const LETTER_RULES: Record<string, string[]> = {
  US: [
    'Call it a "cover letter". Keep it to 250-300 words, three or four short paragraphs.',
    'Greeting: "Dear Hiring Manager," (or the named manager). Sign off with "Sincerely," then the full name.',
    "US spelling, USD ($) figures, MM/DD/YYYY dates. Confident and direct, results first. No personal details, no salary talk unless the job asks.",
  ],
  CA: [
    'Greeting: "Dear Hiring Manager,". Sign off "Sincerely,". 250-300 words.',
    "Canadian spelling, CAD ($) figures. Polite and understated confidence; mention Canadian work eligibility only if the source resume states it.",
  ],
  GB: [
    'Call it a "covering letter". British spelling, GBP (£) figures, DD/MM/YYYY dates.',
    'Greeting: "Dear Hiring Manager," or "Dear Ms/Mr <name>,". Close with "Yours sincerely," when named, "Yours faithfully," when not.',
    "Understated, evidence-led tone. Avoid US-style superlatives and self-promotion.",
  ],
  IN: [
    'Greeting: "Dear Hiring Manager," or "Respected Sir/Madam," only if the job posting is formal. Sign off "Sincerely," or "Best regards,".',
    "Indian English spelling, INR (₹, lakh/crore) where the source uses it, DD/MM/YYYY dates.",
    "Mention notice period, current location and willingness to relocate only if the source resume states them. Polite, formal, specific.",
  ],
  AE: [
    'Greeting: "Dear Hiring Manager,". 250-300 words, formal and respectful tone.',
    "AED figures, DD/MM/YYYY dates. Mention visa status, nationality or availability only if the source resume already states them; regional (GCC) experience is a plus worth naming.",
  ],
  AU: [
    'Greeting: "Dear Hiring Manager,". Sign off "Kind regards,". Australian spelling, AUD ($) figures, DD/MM/YYYY dates.',
    "Friendly but professional, plain-spoken, no corporate posturing. Address the selection criteria in the ad directly when it lists them.",
  ],
  DE: [
    'German market (Anschreiben): one page, formal. Greeting "Sehr geehrte Damen und Herren," only if writing in German; otherwise "Dear Hiring Manager,".',
    "Factual, structured, no salesy adjectives. EUR (€) figures, DD.MM.YYYY dates. State earliest possible start date if the source resume mentions availability.",
  ],
  FR: [
    "One page, formal and courteous. EUR (€) figures, DD/MM/YYYY dates.",
    'Greeting "Madame, Monsieur," if written in French; otherwise "Dear Hiring Manager,". Close formally. Structure: why them, why you, what you bring.',
  ],
  NL: [
    'Greeting: "Dear Hiring Manager,". Very direct and concise, 200-250 words. EUR (€) figures, DD-MM-YYYY dates. No flattery.',
  ],
  SG: [
    'Greeting: "Dear Hiring Manager,". Concise 250 words, SGD ($) figures. Mention work-pass status only if the source resume states it. Note APAC/regional scope where relevant.',
  ],
  ZA: [
    'Greeting: "Dear Hiring Manager,". British spelling, ZAR (R) figures, DD/MM/YYYY dates. Formal, qualification-led opening.',
  ],
};

/** Prompt-ready cover-letter conventions for a country code. */
export function coverLetterRules(country: string | null): string[] {
  const code = country?.toUpperCase() ?? null;
  return (
    (code ? LETTER_RULES[code] : undefined) ?? [
      'Greeting: "Dear Hiring Manager,". Three or four short paragraphs, 250-300 words, closing with "Sincerely," and the full name.',
      "Match the spelling, currency and date format used by the source resume and the job description.",
      "Keep the tone professional and specific; leave out personal details (age, marital status, photo) unless the market clearly expects them.",
    ]
  );
}

/* ------------------------------------------------------------------ *
 * Cross-border applications
 * ------------------------------------------------------------------ */

/** Country hints we look for in a job description (city / country / demonym). */
const JOB_COUNTRY_HINTS: Array<{ code: string; patterns: RegExp[] }> = [
  { code: "AU", patterns: [/\baustralia(n)?\b/i, /\bsydney\b/i, /\bmelbourne\b/i, /\bbrisbane\b/i, /\bperth\b/i, /\badelaide\b/i, /\bcanberra\b/i, /\bnsw\b/i, /\bvictoria,\s*au/i, /\bAUD\b/, /\bsuperannuation\b/i] },
  { code: "NZ", patterns: [/\bnew zealand\b/i, /\bauckland\b/i, /\bwellington\b/i, /\bchristchurch\b/i, /\bNZD\b/] },
  { code: "US", patterns: [/\bunited states\b/i, /\bU\.?S\.?A\.?\b/, /\bnew york\b/i, /\bsan francisco\b/i, /\bchicago\b/i, /\baustin\b/i, /\b(dallas|houston|atlanta|denver|miami|los angeles|san diego|san jose|phoenix|philadelphia|washington,?\s*d\.?c)\b/i, /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|IL|IN|MA|MD|MI|MN|MO|NC|NJ|NY|OH|OR|PA|TX|VA|WA|WI)\s+\d{5}\b/, /,\s*(TX|NY|WA|MA|IL|GA|FL|NC|NJ|VA|CO|AZ|OH|PA)\b(?!\w)/, /\bseattle\b/i, /\bboston\b/i, /\b401\(k\)\b/i, /\bUSD\b/] },
  { code: "CA", patterns: [/\bcanada\b/i, /\btoronto\b/i, /\bvancouver\b/i, /\bmontreal\b/i, /\bottawa\b/i, /\bCAD\b/] },
  { code: "GB", patterns: [/\bunited kingdom\b/i, /\bengland\b/i, /\bscotland\b/i, /\blondon\b/i, /\bmanchester\b/i, /\bbirmingham\b/i, /\bGBP\b/, /£/] },
  { code: "IE", patterns: [/\bireland\b/i, /\bdublin\b/i, /\bcork,\s*ie/i] },
  { code: "DE", patterns: [/\bgermany\b/i, /\bberlin\b/i, /\bmunich\b/i, /\bmünchen\b/i, /\bhamburg\b/i, /\bfrankfurt\b/i] },
  { code: "FR", patterns: [/\bfrance\b/i, /\bparis\b/i, /\blyon\b/i, /\bmarseille\b/i] },
  { code: "NL", patterns: [/\bnetherlands\b/i, /\bamsterdam\b/i, /\brotterdam\b/i, /\butrecht\b/i] },
  { code: "SG", patterns: [/\bsingapore\b/i, /\bSGD\b/] },
  { code: "AE", patterns: [/\bunited arab emirates\b/i, /\bdubai\b/i, /\babu dhabi\b/i, /\bsharjah\b/i, /\bAED\b/] },
  { code: "ZA", patterns: [/\bsouth africa\b/i, /\bjohannesburg\b/i, /\bcape town\b/i, /\bZAR\b/] },
  { code: "IN", patterns: [/\bindia\b/i, /\bbengaluru\b/i, /\bbangalore\b/i, /\bmumbai\b/i, /\bdelhi\b/i, /\bgurgaon\b/i, /\bgurugram\b/i, /\bnoida\b/i, /\bhyderabad\b/i, /\bpune\b/i, /\bchennai\b/i, /\bINR\b/, /\blakh\b/i, /\bcrore\b/i, /₹/] },
];

/**
 * Best-effort country of the JOB (not the candidate), read from the job
 * description and company name. Cross-border applications must follow the
 * hiring country's resume conventions, not the applicant's.
 */
export function detectJobCountry(jobDescription: string, company?: string | null): string | null {
  const text = `${company ?? ""}\n${jobDescription ?? ""}`;
  if (!text.trim()) return null;
  let best: { code: string; score: number } | null = null;
  for (const { code, patterns } of JOB_COUNTRY_HINTS) {
    let score = 0;
    for (const re of patterns) {
      const matches = text.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`));
      if (matches) score += matches.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { code, score };
  }
  return best?.code ?? null;
}

/** Currency symbol/label used by each market, for approximate conversions. */
const MARKET_CURRENCY: Record<string, { code: string; symbol: string }> = {
  US: { code: "USD", symbol: "$" },
  CA: { code: "CAD", symbol: "C$" },
  GB: { code: "GBP", symbol: "£" },
  IE: { code: "EUR", symbol: "€" },
  DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" },
  NL: { code: "EUR", symbol: "€" },
  AU: { code: "AUD", symbol: "A$" },
  NZ: { code: "NZD", symbol: "NZ$" },
  SG: { code: "SGD", symbol: "S$" },
  AE: { code: "AED", symbol: "AED " },
  ZA: { code: "ZAR", symbol: "R" },
  IN: { code: "INR", symbol: "₹" },
};

/**
 * Rules for an application that crosses borders (for example an India-based
 * candidate applying to an Australian employer). The source currency is still
 * a hard fact, but a recruiter in the hiring market needs a readable
 * equivalent, so we allow an explicitly approximate conversion in brackets.
 */
export function crossBorderRules(sourceCountry: string | null, jobCountry: string | null): string[] {
  const src = sourceCountry?.toUpperCase() ?? null;
  const dst = jobCountry?.toUpperCase() ?? null;
  if (!dst || !src || src === dst) return [];

  const srcLabel = MARKETS[src]?.label ?? src;
  const dstLabel = MARKETS[dst]?.label ?? dst;
  const dstCurrency = MARKET_CURRENCY[dst];
  const srcCurrency = MARKET_CURRENCY[src];

  const rules = [
    `CROSS-BORDER APPLICATION: the candidate's history is from ${srcLabel}, but the job is in ${dstLabel}. Write the resume and cover letter for a ${dstLabel} recruiter and a ${dstLabel} ATS.`,
    `Use ${dstLabel} spelling, ${dstLabel} date conventions and ${dstLabel} resume length/format rules. Do not use ${srcLabel} formatting habits that look odd in ${dstLabel}.`,
    "Location line: write the candidate's city and country (for example \"New Delhi, India\"), never a street address. Phone numbers must carry the international dialling code.",
    `Explain unfamiliar employers in experience[].context with one plain line a ${dstLabel} reader understands (sector, size, what the organisation does). Never assume the reader knows the brand.`,
    `Spell out ${srcLabel}-specific acronyms, government schemes, exam names and certifications once in full, and add a short plain-English gloss where the name alone means nothing in ${dstLabel}.`,
    `Qualifications: keep the official degree name exactly as awarded, then add the ${dstLabel} equivalent in brackets when it helps (for example "B.Com (three-year undergraduate degree)"). Never replace or invent a qualification.`,
    "Work rights: never claim an existing visa, PR or work authorisation unless the source resume states it.",
    `RELOCATION LINE (required for this cross-border application): add a short, plainly worded availability line stating relocation intent and sponsorship openness, for example "Willing to relocate to ${dstLabel} | Open to employer-sponsored visa". Put it in the contact/header block (or as the first line of the Additional section if the header is full). Keep it to one line, no promises about eligibility, and do not repeat it elsewhere.`,
    `If the source resume already states a visa, work permit or PR status for ${dstLabel}, state that instead by its specific name and drop the sponsorship wording.`,
  ];

  if (srcCurrency && dstCurrency) {
    rules.push(
      `MONEY, CROSS-BORDER RULE: keep the original figure in the source currency exactly as written (${srcCurrency.symbol}${srcCurrency.code === "INR" ? ", including lakh/crore" : ""}), then add an approximate ${dstCurrency.code} equivalent in brackets so a ${dstLabel} recruiter can read the scale, marked as approximate. Format: "₹25 lakh annual budget (approx. ${dstCurrency.symbol}45K)". Round hard to one or two significant figures and never present the converted number as exact.`,
      `Never REPLACE the source figure with a converted one, never relabel a ${srcCurrency.code} number as ${dstCurrency.code}, and never attach a currency to a number the source left unlabelled. If you are unsure of the rate, omit the bracketed equivalent and keep only the original figure.`,
      `${srcCurrency.code === "INR" ? "Where a figure uses lakh or crore, keep it and add the plain number too if it helps (for example \"₹1.2 crore (₹12,000,000)\")." : ""}`.trim(),
    );
  }

  return rules.filter(Boolean);
}

/**
 * Same-country application (India -> India, US -> US). Nothing needs
 * translating, so the rules exist to STOP the model doing cross-border work:
 * no converted currencies, no re-labelled degrees, no explanatory glosses for
 * employers every local recruiter already knows.
 */
export function domesticRules(sourceCountry: string | null, jobCountry: string | null): string[] {
  const src = sourceCountry?.toUpperCase() ?? null;
  const dst = jobCountry?.toUpperCase() ?? null;
  const code = dst ?? src;
  if (!code || (src && dst && src !== dst)) return [];

  const label = MARKETS[code]?.label ?? code;
  const currency = MARKET_CURRENCY[code];

  return [
    `DOMESTIC APPLICATION: the candidate and the employer are both in ${label}. Write entirely to ${label} conventions with no international hedging.`,
    `Money: keep every figure exactly as the source resume writes it${currency ? ` (${currency.symbol}/${currency.code}${code === "IN" ? ", including lakh and crore" : ""})` : ""}. Do NOT add a bracketed foreign-currency equivalent, and do not convert anything.`,
    `Do NOT add explanatory glosses for employers, universities, schemes or certifications that any ${label} recruiter already recognises. A gloss is only allowed for a genuinely obscure organisation, and then it stays one short factual line.`,
    `Keep degree and certification names exactly as awarded in ${label}. Do NOT add "equivalent to ..." translations.`,
    `Use ${label} spelling, ${label} date conventions and local job-title vocabulary that the job description itself uses.`,
    "Location line: city (and state/region where local resumes do that), never a street address. Local phone format is fine.",
  ];
}

/**
 * Parsing rules that every resume must satisfy regardless of market, because
 * Greenhouse, Workday, Lever, Taleo, iCIMS, SmartRecruiters and Ashby all read
 * the PDF into structured fields before any human sees it.
 */
export const ATS_PARSE_RULES: string[] = [
  "One column, top to bottom, no tables, text boxes, columns, headers, footers, icons, emoji, symbols or graphics in any field.",
  "Standard section headings only: Summary, Skills, Key Achievements, Experience, Education, Certifications, Projects. No creative headings such as \"Where I've Made Impact\".",
  "Every experience entry needs all four fields filled: role (job title only), company (full legal/trading name), location, dates. A missing field becomes a blank column in the parser's database row.",
  "Dates as \"Mon YYYY – Mon YYYY\" or \"Mon YYYY – Present\". No seasons, no \"til date\", no bare years, no overlapping-looking shorthand.",
  "Never put two jobs under one heading and never merge employer and title into one string; each role is its own entry.",
  "Keywords must appear in the same word form the job description uses (if the ad says \"stakeholder management\", write that phrase, not \"managing stakeholders\"). Use the exact tool names too (Google Analytics 4, HubSpot, Figma).",
  "Spell an acronym out once with the short form in brackets, then use the short form after that, so both index.",
  "Skills must be a plain comma-free list of individual competencies, each parseable on its own; no skill ratings, star bars or percentages.",
  "If a country rule above names a more specific contact format (for example US city and state), the country rule wins over this general one. Contact block at the very top as plain text lines: name, city and country, phone with dialling code, email, LinkedIn URL, portfolio URL. Never inside a header, never as an icon row.",
  "No hyperlinks whose visible text hides the URL, no footnotes, no abbreviations of month names beyond three letters.",
  "Do not repeat the same sentence in two sections; repeated blocks are scored as keyword stuffing and can down-rank the application.",
];


/** Today's date as a cover-letter header line: "October 5, 2026" (US style) or "5 October 2026". */
export function letterDateLine(country: string | null, now: Date = new Date()): string {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = now.getUTCDate(), m = months[now.getUTCMonth()], y = now.getUTCFullYear();
  const code = country?.toUpperCase() ?? "";
  return ["US", "CA", "PH"].includes(code) ? `${m} ${d}, ${y}` : `${d} ${m} ${y}`;
}
