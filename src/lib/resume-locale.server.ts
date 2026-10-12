import { getRequest } from "@tanstack/react-start/server";
import { regionForCountry } from "./region";
import { COUNTRY_INFO } from "./region-detect";

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
  "Do not include a photo, date of birth, age, gender, marital status, nationality or religion. Employers in this market do not expect them.",
];

/**
 * Currency is a hard fact. Converting "₹90" into "AUD 90" (or any other
 * currency) silently rewrites the candidate's history, so market currency
 * guidance only applies to figures the source resume already states in that
 * currency.
 */
const CURRENCY_TRUTH = [
  "MONEY: never change the number itself, never invent a figure, and never attach a currency to a number the source left unlabelled. Keep every figure in the source resume's own currency unless a CROSS-COUNTRY MONEY rule further down tells you to convert. On a same-country application never convert anything. Any rule above that says amounts are \"in AUD/CAD/EUR\" only describes local custom; it is not an instruction to convert.",
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
  "Keep a photo, date of birth, nationality or marital status ONLY if the source resume already states them. Never add or invent them. Leave out ID numbers (IC, KTP, CCCD) and religion.",
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
  IL: {
    label: "Israel",
    rules: [
      ...COMMON_NO_PHOTO,
      'US-style resume, called a "Resume". One page for under 10 years of experience, two pages at most.',
      "Contact items (each its own line): full name, city, phone with +972, professional email, LinkedIn.",
      "Mon YYYY - Mon YYYY date ranges. Lead with impact and metrics. No objective statement, no references line.",
      "Military or national service goes under Experience or a short line only if the source resume already lists it. Never invent it.",
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
  JP: {
    label: "Japan",
    rules: [
      "If the employer supplies its own form or portal (a rirekisho, the standard personal-history form, or an entry form), that form is separate and is filled in by the applicant. Here write the work-history document (shokumu keirekisho): reverse-chronological, each employer with role, period, duties and measurable results.",
      "Keep a photo, gender, date of birth or age ONLY if the source resume already states them. Never add or invent them.",
      "Keep qualification and company names exactly as the source writes them. Amounts in JPY (¥) only where the source states them.",
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
      'Referees: keep a final "Referees" section only if the source resume already lists referees, exactly as given. If it lists none, do not add a Referees section or an "available on request" line. Never invent names, titles or contact details.',
    ],
  },
  NZ: {
    label: "New Zealand",
    rules: [
      ...COMMON_NO_PHOTO,
      "Two-page CV, Australian/NZ spelling, amounts in NZD ($).",
      "Warm, conversational and confident tone rather than aggressive self-promotion.",
      'Add a short "What I Bring" block only when the source resume supports it, and name visa/work-rights status specifically when stated.',
      'Referees: keep a final "Referees" section only if the source resume already lists referees, exactly as given. If it lists none, do not add a Referees section or an "available on request" line. Never invent names, titles or contact details.',
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

/** Region defaults: used when a country has no rules of its own. Country entries above override these. */
const REGION_RULES: Record<string, string[]> = {
  Europe: ["Two-page CV at most, factual and restrained wording, DD/MM/YYYY or Mon YYYY dates.", "Keep qualification names as written and list language levels when the source has them.", "Do not add a photo or personal data unless the source resume already includes them."],
  "North America": [...COMMON_NO_PHOTO, "One page for most candidates, two for senior ones. Results first, no personal details."],
  "South America": ["Two-page CV, clear and factual. Keep qualification names as written and list language levels (Spanish, Portuguese, English) when the source has them.", "Do not add a photo or personal data unless the source resume already includes them."],
  Africa: ["Two to three page CV, British-style spelling, clear and factual. Keep qualification names as written.", "Do not add a photo or personal data unless the source resume already includes them."],
  Asia: ["Two-page resume, clear and keyword-rich. Keep qualification names as written.", "Do not add a photo or personal data unless the source resume already includes them."],
  Australia: [...COMMON_NO_PHOTO, "Two to three pages, Australian/NZ spelling, warm confident tone.", 'Referees: keep a final "Referees" section only if the source resume already lists referees, exactly as given. If it lists none, do not add a Referees section or an "available on request" line. Never invent names, titles or contact details.'],
};

/**
 * Resume conventions follow the hiring culture, not strict geography. The shared
 * region table (admin stats) stays geographic; these overrides only apply here.
 */
const RESUME_REGION_OVERRIDE: Record<string, string> = {
  CY: "Europe", // EU member, Europass-style CVs
  TR: "Europe", GE: "Europe", AM: "Europe", AZ: "Europe", // European-style CVs
  KZ: "Europe", // Russian-style CV conventions
  GL: "Europe", // Danish/European conventions
  MT: "Europe", XK: "Europe",
};

/** Egypt and the Levant read CVs the Gulf way: personal block, formal tone. Value is the currency. */
const MENA_GULF_STYLE: Record<string, string> = { EG: "EGP", JO: "JOD", LB: "LBP", IQ: "IQD" };

/** Prompt-ready market rules for a country code. */
export function resumeMarket(country: string | null): ResumeMarket {
  const code = country?.toUpperCase() ?? null;
  const match = code ? MARKETS[code] : undefined;
  if (match) return { country: code, label: match.label, rules: [...match.rules, ...CURRENCY_TRUTH] };
  const mena = code ? MENA_GULF_STYLE[code] : undefined;
  if (code && mena) return { country: code, label: COUNTRY_INFO[code]?.name ?? code, rules: [...GULF_RULES(mena), ...CURRENCY_TRUTH] };
  const resumeRegion = code ? (RESUME_REGION_OVERRIDE[code] ?? regionForCountry(code)) : null;
  const regionRules = resumeRegion ? REGION_RULES[resumeRegion] : undefined;
  if (regionRules) return { country: code, label: `the hiring market (${COUNTRY_INFO[code!]?.name ?? code})`, rules: [...regionRules, ...CURRENCY_TRUTH] };
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

// Pure job-country detection lives in a client-safe module shared with the ATS checker.
export { detectJobCountry } from "./region-detect";

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
  SA: { code: "SAR", symbol: "SAR " },
  QA: { code: "QAR", symbol: "QAR " },
  KW: { code: "KWD", symbol: "KWD " },
  BH: { code: "BHD", symbol: "BHD " },
  OM: { code: "OMR", symbol: "OMR " },
  TH: { code: "THB", symbol: "THB " },
  MY: { code: "MYR", symbol: "RM" },
  VN: { code: "VND", symbol: "VND " },
  ID: { code: "IDR", symbol: "IDR " },
  PH: { code: "PHP", symbol: "₱" },
};

/** Currency of a country: the market table first, then every country the detector knows. */
function currencyFor(code: string | null): { code: string; symbol: string } | undefined {
  if (!code) return undefined;
  const hit = MARKET_CURRENCY[code];
  if (hit) return hit;
  const info = COUNTRY_INFO[code];
  return info ? { code: info.currency, symbol: info.symbol } : undefined;
}

/** Readable country name for any country the detector can return. */
function countryName(code: string): string {
  return MARKETS[code]?.label ?? COUNTRY_INFO[code]?.name ?? code;
}

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

  const srcLabel = countryName(src);
  const dstLabel = countryName(dst);
  const dstCurrency = currencyFor(dst);
  const srcCurrency = currencyFor(src);

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

  if (srcCurrency && dstCurrency && srcCurrency.code !== dstCurrency.code) {
    rules.push(
      `CROSS-COUNTRY MONEY RULE: this application crosses countries, so convert every money figure the source resume writes in ${srcCurrency.code} into ${dstCurrency.code} at a sensible current approximate rate, and write ONLY the converted value, always marked as approximate (for example "approx. ${dstCurrency.symbol}7.2K" or "~${dstCurrency.symbol}7.2K"). Do NOT keep the original figure next to it: the source currency name or symbol (${srcCurrency.code}, ${srcCurrency.symbol.trim()}${srcCurrency.code === "INR" ? ", lakh, crore" : ""}) must NOT remain on any converted figure, and the same amount must not appear twice in two currencies. Example of the right shape: a source line "budget of ${srcCurrency.code} 400,000" becomes "budget of approx. ${dstCurrency.symbol}X" with only the converted value.`,
      `${srcCurrency.code === "INR" ? `Where the source uses lakh or crore, convert the full amount and write it in the normal ${dstLabel} style (thousands or millions). ` : ""}Leave alone: numbers that are not money (percentages, team sizes, counts), figures with no currency stated, and figures already in ${dstCurrency.code}. If you cannot give a sensible approximate rate, keep the original figure exactly as written instead of guessing.`,
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
  if (!dst || (src && src !== dst)) return [];
  const code = dst;

  const label = countryName(code);
  const currency = currencyFor(code);

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
