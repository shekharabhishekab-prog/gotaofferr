/**
 * Fact-preservation guard for resume tailoring.
 *
 * The tailoring model is allowed to rewrite wording, but it must never drop a
 * hard fact from the candidate's default resume: employers, institutions,
 * named partners and clients, tools, links, contact details and metrics.
 * These helpers extract those facts from the source text and report which ones
 * are missing from a generated draft, so the caller can ask for a repair pass.
 */

/** Words that look like proper nouns but carry no resume-specific meaning. */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "into", "over", "under", "across", "within",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december", "present", "current", "ongoing",
  "experience", "education", "skills", "summary", "profile", "projects", "objective",
  "certifications", "certification", "achievements", "languages", "interests",
  "references", "contact", "work", "professional", "personal", "details", "resume",
  "curriculum", "vitae", "responsibilities", "key", "core", "additional", "india",
  "manager", "executive", "assistant", "intern", "internship", "senior", "junior",
  "lead", "head", "officer", "coordinator", "specialist", "associate", "consultant",
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9%.@/+&]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Pull the hard facts out of the candidate's source resume.
 * Deliberately conservative: it only keeps tokens that are unlikely to be
 * reworded away (emails, links, numbers with units, multi-word proper nouns).
 */
export function extractSourceFacts(resume: string): string[] {
  const facts = new Set<string>();

  const emails = resume.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [];
  const links = resume.match(/(?:https?:\/\/|www\.)[^\s,)]+|(?:linkedin|github|behance|dribbble|medium)\.com\/[^\s,)]+/gi) ?? [];
  for (const item of [...emails, ...links]) facts.add(item.replace(/[.,;]$/, ""));

  // Metrics: percentages, multipliers, currency amounts, follower/view counts.
  const metrics =
    resume.match(/\b(?:[₹$€£]\s?\d[\d,.]*\s?[kmb]?|\d[\d,.]*\s?(?:%|x|k|m|mn|bn|million|billion|lakh|crore)\b)/gi) ?? [];
  for (const metric of metrics) facts.add(metric.trim());

  // Plain counts with a noun ("12 influencer campaigns", "team of 5 engineers", "30+ clients").
  const counts =
    resume.match(/\b\d{1,4}\+?\s(?:[A-Za-z]+\s)?(?:campaigns|clients|projects|members|people|employees|products|stores|markets|countries|accounts|events|brands|launches|dashboards|hires|customers|users|engineers|reports|releases|workshops|webinars|articles)\b/gi) ?? [];
  for (const c of counts) facts.add(c.trim());

  // Multi-word proper nouns: employers, partners, clients, tools, institutions.
  const properNouns =
    resume.match(/\b([A-Z][A-Za-z&.'-]+(?:\s+(?:of|and|for|the|de|&)?\s*[A-Z][A-Za-z&.'-]+){1,4})\b/g) ?? [];
  for (const phrase of properNouns) {
    const words = phrase.split(/\s+/).filter((word) => !STOPWORDS.has(word.toLowerCase()));
    if (words.length < 2) continue;
    if (phrase.length < 6 || phrase.length > 60) continue;
    facts.add(phrase.trim());
  }

  // Acronym organisations and tools (AIACA, HCL, IGNOU, SEO).
  const acronyms = resume.match(/\b[A-Z]{3,6}\b/g) ?? [];
  for (const acronym of acronyms) {
    if (!STOPWORDS.has(acronym.toLowerCase())) facts.add(acronym);
  }

  return [...facts];
}

/**
 * Facts present in the source resume but absent from the generated draft.
 * Matching is normalised so casing and punctuation differences do not count as
 * a loss; only genuinely dropped information is reported.
 */
export function findMissingFacts(resume: string, draft: unknown, limit = 40): string[] {
  // Only the resume itself counts as keeping a fact. A fact that appears only in the
  // cover letter or the insights is still missing from the resume.
  const resumeOnly: any = draft && typeof draft === "object" ? { ...(draft as any) } : draft;
  if (resumeOnly && typeof resumeOnly === "object") {
    for (const k of ["coverLetter", "tips", "matchedKeywords", "missingKeywords", "scoreBreakdown", "consistencyFlags", "regionAdaptations", "fitWarning"]) delete resumeOnly[k];
  }
  const haystack = normalize(JSON.stringify(resumeOnly ?? ""));
  const missing: string[] = [];
  for (const fact of extractSourceFacts(resume)) {
    const needle = normalize(fact);
    if (!needle || needle.length < 3) continue;
    if (!haystack.includes(needle)) missing.push(fact);
    if (missing.length >= limit) break;
  }
  return missing;
}

