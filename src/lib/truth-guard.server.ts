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
  return { text, stems, numbers, raw: source.toLowerCase(), segments };
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
  const best = [...bullets].map((b) => ({ b, sc: lineScore(b, src) })).filter((x) => x.sc >= 0.3).sort((a, c) => c.sc - a.sc).slice(0, 2).map((x) => x.b);
  bullets.filter((b) => !best.includes(b)).forEach((b) => note("duty", b));
  return bests(best, bullets);
}
function bests(best: string[], original: string[]): string[] {
  return original.filter((b) => best.includes(b));
}

function lineSupported(line: string, src: Src): boolean {
  if (!numbersOk(line, src)) return false;
  const ws = [...new Set(words(line).map(stem))];
  if (!ws.length) return true;
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
];

function claimUnsupported(text: string, src: Src): boolean {
  return CLAIM_WORDS.some(([inOut, inSrc]) => inOut.test(text) && !inSrc.test(src.raw));
}

function dropClaimParts(entry: string, src: Src): string {
  const parts = entry.split(/\s*[|•]\s*/);
  const kept = parts.filter((p) => !claimUnsupported(p, src));
  return kept.join(" | ");
}

function dropClaimSentences(text: string, src: Src): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => !claimUnsupported(s, src)).join(" ");
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

  const summary = dropClaimSentences(result.summary, src);
  if (summary !== result.summary) note("claim", "summary sentence");
  const coverLetter = dropClaimSentences(result.coverLetter, src);
  if (coverLetter !== result.coverLetter) note("claim", "cover letter sentence");

  const skills = result.skills.filter((s) => skillSupported(s, src) || (note("skill", s), false));
  const skillGroups = (result.skillGroups ?? [])
    .map((g) => ({ ...g, items: g.items.filter((s) => skillSupported(s, src) || (note("skill", s), false)) }))
    .filter((g) => g.items.length > 0);

  const keyAchievements = result.keyAchievements.filter((a) => lineSupported(a, src) || (note("achievement", a), false));

  const experience = result.experience.map((e) => ({
    ...e,
    bullets: keepBullets(e.bullets, src, note),
  }));
  const projects = result.projects.map((p) => ({
    ...p,
    bullets: p.bullets.filter((b) => lineSupported(b, src) || (note("duty", b), false)),
  }));
  const additionalSections = result.additionalSections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => !claimUnsupported(i, src) || (note("claim", i), false)),
    }))
    .filter((s) => s.items.length > 0);

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
    return credential && credential !== ed.credential ? { ...ed, credential } : ed;
  });

  // The headline must not claim a title the source never held.
  let headline = result.headline;
  const srcRoles = result.experience.map((e) => e.role);
  if (headline && !skillSupported(headline, src) && srcRoles.length) {
    note("headline", headline);
    headline = srcRoles[0];
  }

  return {
    result: { ...result, contacts, summary, coverLetter, skills, skillGroups, keyAchievements, experience, projects, additionalSections, headline, education },
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

