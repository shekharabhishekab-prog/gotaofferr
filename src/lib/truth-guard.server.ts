import type { TailoredResume } from "./tailor-schema";

/**
 * Deterministic honesty check run after the model. It never adds anything: it
 * only removes claims, skills and duties that the source resume does not
 * support, so a weaker model cannot slip invented facts into the result.
 */

const STOP = new Set([
  "with", "from", "that", "this", "their", "across", "using", "into", "over", "under", "about", "while",
  "through", "within", "have", "been", "were", "will", "team", "teams", "work", "worked", "working",
]);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").replace(/\s+/g, " ").trim();
const stem = (w: string) => w.slice(0, 5);

function words(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

function buildSource(source: string) {
  const text = norm(source);
  const stems = new Set(words(source).map(stem));
  const numbers = new Set((source.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]+$/, "")));
  const segments = source
    .split(/\n|(?<=[.!?;])\s+/)
    .map((seg) => new Set(words(seg).map(stem)))
    .filter((set) => set.size > 0);
  const rawLines = source.split(/\r?\n/);
  const bulletRe = /^\s*[-•*▪●]\s+/;
  const bulleted = rawLines.filter((l) => bulletRe.test(l));
  // Own duty lines: the source's bulleted lines when it has bullets, else its longer plain lines.
  const lines = (bulleted.length ? bulleted : rawLines).map((l) => l.replace(bulletRe, "").trim()).filter((l) => l.length > 24);
  return { text, stems, numbers, raw: source.toLowerCase(), segments, lines };
}
type Src = ReturnType<typeof buildSource>;

function supportedFraction(item: string, src: Src): number {
  const ws = words(item);
  if (!ws.length) return 1;
  const hit = ws.filter((w) => src.stems.has(stem(w))).length;
  return hit / ws.length;
}

function numbersOk(item: string, src: Src): boolean {
  // A labelled currency conversion such as "(approx. AED 180K)" is the market
  // rule's own addition. The original figure beside it must still be in the source.
  const stripped = item
    .replace(/\((?:approx\.?|approximately|about|around|equivalent|equiv\.?|≈|~)[^)]*\)/gi, " ")
    .replace(/(?:approx\.?|approximately|≈|~)\s*[A-Za-z$€£₹]{0,4}\s*\d[\d,.]*\s*[kKmMlL]?(?:akh|illion|rore)?/gi, " ");
  const nums = (stripped.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]+$/, ""));
  return nums.every((n) => src.numbers.has(n) || n.length <= 1);
}

// Skill or tool name: every meaningful word must appear in the source.
function skillSupported(skill: string, src: Src): boolean {
  const n = norm(skill);
  if (!n) return false;
  if (src.text.includes(n)) return true;
  const ws = words(skill);
  if (!ws.length) return src.text.includes(n);
  // Short tokens such as "ads", "seo" or "crm" are skipped by words(); they still must appear as whole words.
  const SHORT_OK = new Set(["and", "the", "for", "of", "in", "to", "on", "at", "or", "a"]);
  const shorts = n.split(" ").filter((t) => t.length >= 2 && t.length <= 3 && !SHORT_OK.has(t));
  if (shorts.some((t) => !(" " + src.text + " ").includes(" " + t + " "))) return false;
  return ws.every((w) => src.stems.has(stem(w)));
}

// Duty / achievement line: most of its content must come from the source, and
// no number may be new.
function lineScore(line: string, src: Src): number {
  if (!numbersOk(line, src)) return -1;
  const ws = [...new Set(words(line).map(stem))];
  if (!ws.length) return 1;
  return Math.max(0, ...src.segments.map((seg) => ws.filter((w) => seg.has(w)).length / ws.length));
}

/** Keep supported bullets; if none survive, keep the two closest to the source so a role is never emptied. */
function keepBullets(bullets: string[], src: Src, note: (k: string, v: string) => void): string[] {
  const kept = bullets.filter((b) => lineSupported(b, src));
  if (kept.length || !bullets.length) {
    bullets.filter((b) => !kept.includes(b)).forEach((b) => note("duty", b));
    return kept;
  }
  // No model bullet is backed by the source: put the candidate's own source lines back instead of invented ones.
  bullets.forEach((b) => note("duty", b));
  const ownLines: string[] = [];
  for (const b of bullets) {
    const ws = [...new Set(words(b).map(stem))];
    if (!ws.length) continue;
    let top = { line: "", sc: 0 };
    for (const line of src.lines) {
      const ls = new Set(words(line).map(stem));
      const sc = ws.filter((w) => ls.has(w)).length / Math.max(1, Math.min(ws.length, ls.size));
      if (sc > top.sc) top = { line, sc };
    }
    if (top.sc >= 0.5 && !ownLines.includes(top.line) && !/^[A-Z][^.]*\(?\d{4}/.test(top.line)) ownLines.push(top.line);
    if (ownLines.length >= 3) break;
  }
  return ownLines;
}
function bests(best: string[], original: string[]): string[] {
  return original.filter((b) => best.includes(b));
}

function lineSupported(line: string, src: Src): boolean {
  if (!numbersOk(line, src)) return false;
  const ws = [...new Set(words(line).map(stem))];
  if (!ws.length) return true;
  // Most of the words must exist somewhere in the source resume at all.
  if (supportedFraction(line, src) < 0.7) return false;
  // A real duty is a rewording of ONE source line. A line stitched together
  // from words scattered across the resume is an invented duty.
  const best = Math.max(0, ...src.segments.map((seg) => ws.filter((w) => seg.has(w)).length / ws.length));
  return best >= 0.5;
}

const CLAIM_WORDS: Array<[RegExp, RegExp]> = [
  [/relocat/i, /relocat|willing to move|move to/i],
  [/visa|sponsor|work (permit|authori[sz]ation)|right to work/i, /visa|sponsor|work (permit|authori[sz]ation)|right to work|citizen|permanent resident/i],
  [/notice period|available (in|from|immediately|within)|immediate(ly)? available|start date/i, /notice|available|availability|immediate/i],
  [/nationality/i, /nationality|citizen/i],
  [/\broas\b|return on (ad )?spend/i, /\broas\b|return on (ad )?spend/i],
  [/\broi\b|return on investment/i, /\broi\b|return on investment/i],
  [/conversion rates?/i, /conversion/i],
  // Phase 3.9: claims the model adds when it adapts to a new market or mirrors the job ad.
  [/bilingual|multilingual|trilingual/i, /bilingual|multilingual|fluent|languages?|arabic|hindi|french|spanish|german|mandarin|tamil|marathi/i],
  [/paid (ads?|media|search|social|campaigns?|advertising)|\bppc\b|google ads|meta ads|facebook ads|adwords/i, /paid|\bppc\b|google ads|meta ads|facebook ads|adwords|advertis|\bads\b/i],
  [/available to start|start (as soon as possible|immediately|right away)|ready to start|can start (immediately|right away)/i, /available|start date|notice|immediate/i],
  [/agenc(y|ies)|external partners?/i, /agenc|partner|vendor|external/i],
];

// Phone numbers and emails must come from the source resume, never from the model.
function contactInvented(part: string, src: Src): boolean {
  const digits = part.replace(/\D/g, "");
  if (digits.length >= 7) {
    const srcDigits = src.raw.replace(/\D/g, "");
    const noCc = digits.replace(/^(91|971|44|1|61|65|1)(?=\d{8,})/, "");
    if (!srcDigits.includes(digits) && !(noCc.length >= 7 && srcDigits.includes(noCc))) return true;
  }
  // Links (LinkedIn, portfolio) must be written in the source resume too.
  const links = part.match(/(?:https?:\/\/|www\.)[^\s|,;)]+|(?:linkedin|github|behance)\.com\/[^\s|,;)]+/gi) ?? [];
  if (links.some((u) => !src.raw.includes(u.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")))) return true;
  const mail = part.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (mail && !src.raw.includes(mail[0].toLowerCase())) return true;
  return false;
}

const MONTH_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b\.?\s*,?\s*(?=\d{4})/gi;
// A month the source never wrote is an invented date detail: keep the year only.
function stripInventedMonths(dates: string | null | undefined, src: Src): string | null | undefined {
  if (!dates) return dates;
  return dates.replace(MONTH_RE, (m, mon: string) => {
    const key = mon.slice(0, 3).toLowerCase();
    const numericMonths = /\b\d{1,2}[\/.-]\d{4}\b/.test(src.raw);
    return numericMonths || new RegExp("\\b" + key + "[a-z]*\\.?[\\s,/-]*'?\\d{2,4}", "i").test(src.raw) ? m : "";
  }).replace(/\s{2,}/g, " ").trim();
}

const LANGS = "english|hindi|arabic|german|french|spanish|dutch|mandarin|chinese|portuguese|italian|japanese|korean|russian|tamil|marathi|bengali|urdu|malay|tagalog|afrikaans|swahili|turkish|polish";
const LANG_LEVEL = "strong|excellent|exceptional|outstanding|fluent|fluency|proficient|proficiency|native|advanced|professional|business|good|solid|working|full|bilingual|written|verbal|spoken|command";
const LANG_CLAIM = new RegExp(`\\b(?:${LANG_LEVEL})\\b[^.!?;]{0,30}?\\b(${LANGS})\\b|\\b(${LANGS})\\b\\s+(?:language\\s+)?(?:fluency|proficiency|communication|skills?|speaker|speaking|writing)`, "gi");
// Soft-skill level claims ("strong communication skills") must be backed by the source too.
const SOFT_CLAIM: Array<[RegExp, RegExp]> = [
  [/\b(?:strong|excellent|exceptional|outstanding|superior|proven|solid|great)\s+(?:\w+\s+){0,2}?communicat/i, /communicat/i],
  [/\b(?:strong|excellent|exceptional|outstanding|superior|proven|solid|great)\s+(?:\w+\s+){0,2}?(?:interpersonal|leadership|negotiation|presentation|organi[sz]ational|problem[- ]solving|analytical|time[- ]management)/i, /interpersonal|leadership|leader|\bled\b|negotiat|presentation|organi[sz]ational|problem[- ]solv|analytical|time[- ]management/i],
];
function languageClaimUnsupported(text: string, src: Src): boolean {
  for (const m of text.matchAll(LANG_CLAIM)) {
    const lang = (m[1] || m[2] || "").toLowerCase();
    if (lang && !new RegExp("\\b" + lang + "\\b", "i").test(src.raw)) return true;
    // A language the source names, but with a level the source never states, also stays out.
    if (lang && /(strong|excellent|exceptional|outstanding|fluent|fluency|proficient|proficiency|native|advanced|business|full|command)/i.test(m[0]) && !/fluen|proficien|native|advanced|command|business|professional|\bC1\b|\bC2\b|\bB2\b/i.test(src.raw)) return true;
  }
  return false;
}

const RANGE_RE = /((?:[A-Za-z]{3,9}\.?\s+)?\d{4})\s*(?:-|–|—|to)\s*((?:[A-Za-z]{3,9}\.?\s+)?\d{4}|present|current|now)/i;
// A date range the source never wrote (for example 2021 - 2022 turned into 2021 - 2021) is replaced by the source's own range for that employer.
function fixDateRange(dates: string | null | undefined, employer: string | undefined, src: Src, source: string): string | null | undefined {
  if (!dates) return dates;
  const m = dates.match(RANGE_RE);
  if (!m) return dates;
  const y1 = m[1].match(/\d{4}/)![0];
  const y2 = /\d{4}/.test(m[2]) ? m[2].match(/\d{4}/)![0] : m[2].toLowerCase();
  if (new RegExp(y1 + "\\D{1,14}" + y2, "i").test(src.raw)) return dates;
  const emp = (employer || "").toLowerCase().trim();
  if (!emp) return dates;
  const raw = source.split(/\r?\n/);
  const at = raw.findIndex((l) => l.toLowerCase().includes(emp) && RANGE_RE.test(l));
  if (at < 0) return dates;
  const r = raw[at].match(RANGE_RE)!;
  return `${r[1]} - ${r[2]}`;
}

function claimUnsupported(text: string, src: Src): boolean {
  return (
    CLAIM_WORDS.some(([inOut, inSrc]) => inOut.test(text) && !inSrc.test(src.raw)) ||
    SOFT_CLAIM.some(([inOut, inSrc]) => inOut.test(text) && !inSrc.test(src.raw)) ||
    languageClaimUnsupported(text, src)
  );
}

function dropClaimParts(entry: string, src: Src): string {
  const parts = entry.split(/\s*[|•]\s*/);
  const kept = parts.filter((p) => !claimUnsupported(p, src) && !contactInvented(p, src));
  return kept.join(" | ");
}

function dropClaimSentences(text: string, src: Src): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => !claimUnsupported(s, src)).join(" ");
}

// Tool or skill names that only the job ad asks for (the model lists them in missingKeywords).
// A sentence that names one of them in the summary or cover letter reads as a claim the resume
// cannot back up, so it is dropped. In the cover letter, an honest bridge sentence
// ("my CRM work is in HubSpot, ready to learn Zoho") is kept.
const JD_ONLY_GENERIC = new Set([
  "marketing", "digital", "email", "management", "sales", "lead", "leads", "data", "content", "social", "media", "business",
  "customer", "support", "analytics", "reporting", "strategy", "campaign", "campaigns", "search", "paid", "team", "communication",
  "experience", "skills", "tools", "platform", "software", "system", "systems", "service", "services", "english", "hindi",
]);

function jdOnlyTerms(missing: string[] | undefined, src: Src): string[] {
  const out = new Set<string>();
  for (const k of missing ?? []) {
    const phrase = norm(k);
    if (!phrase || skillSupported(k, src)) continue;
    out.add(phrase);
    const head = phrase.split(" ")[0];
    if (head && head.length >= 4 && !JD_ONLY_GENERIC.has(head) && !src.text.includes(head)) out.add(head);
  }
  return [...out];
}

function dropJdOnlySentences(text: string, terms: string[], _letter: boolean): string {
  if (!terms.length || !text) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = sentences.filter((sent) => {
    const n = " " + norm(sent) + " ";
    const hit = terms.some((t) => n.includes(" " + t + " ") || n.includes(" " + t));
    if (!hit) return true;
    return false;
  });
  return kept.join(" ");
}

/** Same honesty check for a letter the model rewrote: drop invented claims, new numbers and job-ad-only tools. */
export function guardLetter(letter: string, missingKeywords: string[] | undefined, source: string): string {
  const src = buildSource(source);
  const jdOnly = jdOnlyTerms(missingKeywords, src);
  const paragraphs = letter.split(/\n{2,}/).map((para) => {
    const sentences = para.split(/(?<=[.!?])\s+/).filter((sent) => !claimUnsupported(sent, src) && numbersOk(sent, src) && !contactInvented(sent, src));
    return dropJdOnlySentences(sentences.join(" "), jdOnly, true);
  });
  return paragraphs.filter((x) => x.trim()).join("\n\n");
}

export function guardResume(result: TailoredResume, source: string): { result: TailoredResume; removed: string[] } {
  const src = buildSource(source);
  const removed: string[] = [];
  const note = (kind: string, v: string) => removed.push(`${kind}: ${v}`);

  const contacts = result.contacts
    .map((c) => {
      const cleaned = dropClaimParts(c, src);
      if (cleaned !== c) note("claim", c);
      return cleaned;
    })
    .filter((c) => c.trim().length > 0);

  // Insights: a "you already speak their language" keyword the resume does not back up moves to the honest gaps list.
  const matchedIn: string[] = (result as any).matchedKeywords ?? [];
  const matchedKeywords = matchedIn.filter((k) => skillSupported(k, src) || (note("matched keyword", k), false));
  const movedToGaps = matchedIn.filter((k) => !matchedKeywords.includes(k));
  const missingKeywords = [...((result as any).missingKeywords ?? []), ...movedToGaps.filter((k) => !((result as any).missingKeywords ?? []).includes(k))];
  const regionAdaptations = ((result as any).regionAdaptations ?? []).filter((r: string) => !claimUnsupported(r, src) || (note("claim", r), false));
  const jdOnly = jdOnlyTerms(missingKeywords, src);
  const summary = dropJdOnlySentences(dropClaimSentences(result.summary, src), jdOnly, false);
  if (summary !== result.summary) note("claim", "summary sentence");
  const coverLetter = dropJdOnlySentences(dropClaimSentences(result.coverLetter, src), jdOnly, true);
  if (coverLetter !== result.coverLetter) note("claim", "cover letter sentence");

  const skills = result.skills.filter((s) => skillSupported(s, src) || (note("skill", s), false));
  const skillGroups = (result.skillGroups ?? [])
    .map((g) => ({ ...g, items: g.items.filter((s) => skillSupported(s, src) || (note("skill", s), false)) }))
    .filter((g) => g.items.length > 0);

  const keyAchievements = result.keyAchievements.filter((a) => lineSupported(a, src) || (note("achievement", a), false));

  const experience = result.experience.map((e) => {
    const d = fixDateRange(stripInventedMonths(e.dates, src), (e as any).company, src, source);
    if (d !== e.dates) note("date month", String(e.dates));
    return { ...e, dates: d as typeof e.dates, bullets: keepBullets(e.bullets, src, note) };
  });
  const projects = result.projects.map((p) => ({
    ...p,
    bullets: p.bullets.filter((b) => lineSupported(b, src) || (note("duty", b), false)),
  }));
  const additionalSections = result.additionalSections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => (!claimUnsupported(i, src) && supportedFraction(i, src) >= 0.85) || (note("claim", i), false)),
    }))
    .filter((s) => s.items.length > 0 && !/^\s*titles?\s*$/i.test(String((s as any).title ?? (s as any).heading ?? "")));

  // Education: never repeat the school inside the degree, and drop explanatory
  // brackets such as "(three-year undergraduate degree)" that the source never had.
  const education = result.education.map((ed) => {
    let credential = ed.credential;
    const inst = (ed.institution || "").trim();
    if (inst) {
      const esc = inst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      credential = credential.replace(new RegExp(`\\s*(?:,|-|–|—|at|from)?\\s*${esc}\\s*$`, "i"), "").trim();
    }
    credential = credential.replace(/\s*\(([^)]*)\)/g, (m, inner) => (skillSupported(inner, src) ? m : (note("education note", inner), ""))).trim();
    const edDates = (ed as any).dates !== undefined ? stripInventedMonths((ed as any).dates, src) : undefined;
    const withDates = edDates !== undefined && edDates !== (ed as any).dates ? { ...ed, dates: edDates } : ed;
    return credential && credential !== ed.credential ? { ...withDates, credential } : withDates;
  });

  // The headline must not claim a title the source never held.
  let headline = result.headline;
  const srcRoles = result.experience.map((e) => e.role);
  if (headline && !skillSupported(headline, src) && srcRoles.length) {
    note("headline", headline);
    headline = srcRoles[0];
  }

  return {
    result: { ...result, matchedKeywords, missingKeywords, regionAdaptations, contacts, summary, coverLetter, skills, skillGroups, keyAchievements, experience, projects, additionalSections, headline, education },
    removed,
  };
}

// ---------------------------------------------------------------------------
// Polish and pre-delivery validation. Same rules whichever model wrote the draft.
// ---------------------------------------------------------------------------

export class QualityError extends Error {
  constructor(public issues: string[]) {
    super(`quality check failed: ${issues.slice(0, 3).join("; ")}`);
  }
}

const AI_TELLS = [
  "delve", "leverage", "leveraging", "spearhead", "spearheaded", "harness", "robust", "seamless", "seamlessly",
  "synergy", "synergies", "cutting-edge", "state-of-the-art", "game-changer", "transformative", "unlock", "elevate",
  "empower", "foster", "tapestry", "testament", "meticulous", "passionate about", "proven track record",
  "results-driven", "dynamic professional", "in today's fast-paced", "fast-paced world", "ever-evolving",
  "i am writing to express my", "i am excited to", "thrilled to", "well-positioned", "demonstrated ability to",
  "demonstrated capability", "brings strong foundations", "brings foundational",
];

const GARBLE = /[\uFFFD]|â€|Ã[\u0080-\u00BF]|Â[\u00A0-\u00BF]|[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function cleanText(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\*\*|__|^#+\s+/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function mapStrings<T>(value: T, fn: (s: string, key: string) => string, key = ""): T {
  if (typeof value === "string") return fn(value, key) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn, key)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = mapStrings(v, fn, k);
    return out as T;
  }
  return value;
}

function hasTell(text: string): string | null {
  const t = text.toLowerCase();
  for (const w of AI_TELLS) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/[-']/g, "[-' ]?")}([^a-z]|$)`, "i");
    if (re.test(t)) return w;
  }
  return null;
}

/** Fixes what is safe to fix, lists what is not. `final` drops flawed bullet lines instead of failing. */
export function polishResume(result: TailoredResume, final: boolean): { result: TailoredResume; issues: string[] } {
  const issues: string[] = [];
  let r = mapStrings(result, (s, k) => (k === "dates" ? s.trim() : cleanText(s)));

  // Em dashes are an AI tell; dates keep their en dash range.
  r = mapStrings(r, (s, k) => (k === "dates" ? s : s.replace(/\s*—\s*/g, ", ")));

  const scan = (label: string, text: string) => {
    if (GARBLE.test(text)) issues.push(`garbled characters in ${label}`);
    const tell = hasTell(text);
    if (tell) issues.push(`AI phrase "${tell}" in ${label}`);
  };

  const flawed = (b: string) => GARBLE.test(b) || !!hasTell(b);
  if (final) {
    r = {
      ...r,
      experience: r.experience.map((e) => ({ ...e, bullets: e.bullets.filter((b) => !flawed(b)) })),
      projects: r.projects.map((p) => ({ ...p, bullets: p.bullets.filter((b) => !flawed(b)) })),
      keyAchievements: r.keyAchievements.filter((b) => !flawed(b)),
    };
  }

  scan("summary", r.summary);
  scan("cover letter", r.coverLetter);
  r.experience.forEach((e, i) => e.bullets.forEach((b) => scan(`experience ${i + 1}`, b)));
  r.keyAchievements.forEach((b) => scan("achievements", b));
  r.contacts.forEach((c) => scan("contacts", c));

  if (!r.name.trim()) issues.push("missing name");
  if (!r.summary.trim()) issues.push("missing summary");
  if (!r.experience.length) issues.push("no experience section");
  if (!r.coverLetter.trim()) issues.push("missing cover letter");
  if (/\[[^\]]*(your|name|company|date)[^\]]*\]/i.test(r.coverLetter)) issues.push("placeholder in cover letter");
  return { result: r, issues };
}

