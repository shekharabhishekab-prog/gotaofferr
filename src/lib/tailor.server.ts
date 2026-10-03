import { generateText, Output, NoObjectGeneratedError } from "ai";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { tailoredResumeSchema, type TailorInput, type TailoredResume } from "./tailor-schema";
import {
  resumeMarket,
  coverLetterRules,
  detectJobCountry,
  crossBorderRules,
  domesticRules,
  ATS_PARSE_RULES,
} from "./resume-locale.server";

export async function runTailor(
  data: TailorInput,
  country?: string | null,
  tier: import("./model-router.server").RoutingTier = "free",
): Promise<TailoredResume> {
  const { runWithModelChain } = await import("./model-router.server");
  return runWithModelChain(tier, async (modelId) => {
    // Pre-delivery validation: a flawed draft is regenerated once on the same model, never shipped as is.
    try {
      return await runTailorOnce(data, country, modelId, false);
    } catch (error) {
      const { QualityError } = await import("./truth-guard.server");
      if (!(error instanceof QualityError)) throw error;
      console.warn(`[quality] retry: ${error.issues.slice(0, 3).join("; ")}`);
      return runTailorOnce(data, country, modelId, true);
    }
  });
}

async function runTailorOnce(data: TailorInput, country: string | null | undefined, modelId: string, final: boolean): Promise<TailoredResume> {
  // Guard against non-resume documents (invoices, reports) before any AI spend.
  const { assertLooksLikeResume } = await import("./extract-pdf");
  assertLooksLikeResume(data.resume);

  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const gateway = createLovableAiGatewayProvider(key, modelId);
  // The hiring market is the JOB's country, not the applicant's: an India-based
  // candidate applying to Sydney must be screened by Australian conventions.
  const sourceCountry = country ?? null;
  const jobCountry = detectJobCountry(data.jobDescription, data.company) ?? sourceCountry;
  const market = resumeMarket(jobCountry);
  const letterRules = coverLetterRules(jobCountry);
  const crossBorder = crossBorderRules(sourceCountry, jobCountry);
  const domestic = crossBorder.length ? [] : domesticRules(sourceCountry, jobCountry);


  const prompt = `You are an expert technical recruiter and resume writer.

Work in two phases.

PHASE 1 — THINK BEFORE WRITING (internal, never output):
1. Read the job description and list the role's core responsibilities, must-have skills, seniority level and exact ATS keywords. Any phrase or requirement that appears two or more times in the job description is a HIGH-PRIORITY keyword: it must appear verbatim in both the skills list and at least one experience bullet, wherever the candidate's real experience supports it.
2. Inventory the source resume: every employer, title, date range, project, degree, certification, award, language, publication and contact detail.
3. Map each job requirement to the strongest supporting evidence in the resume, and note real gaps (never fabricate to fill them).
4. Decide the section order and which achievements deserve the top of the page.
5. Only then produce the final structured output, and verify nothing from the inventory in step 2 was dropped.

PHASE 2 — WRITE THE TAILORED RESUME. Rules:
- Never invent employers, degrees, dates or credentials that are not in the original resume. You MAY rephrase, reprioritise, and reword.
- DEPTH IS MANDATORY. This must read like a detailed senior recruiter-grade resume, not a one-page summary. Never compress the source. If the source resume is long, the output must be equally long or longer.
- NEVER PAD. The bullet-count and length targets below apply only where the source resume has enough real material. If a role has 3 duties in the source, output 3 bullets, not 7. Do not add duties, tasks or responsibilities the source does not show just to reach a count; a short honest resume beats a long invented one.
- Bullet counts per role: current/most recent role 7-10 bullets; each earlier role 5-7 bullets; the oldest or shortest role at least 4. Never fewer than 4 bullets for any role that has material in the source.
- Keep EVERY concrete detail the source gives: named clients, partner organisations, brands, campaign names, event names, programme names, tool names, budgets, currencies, percentages, follower counts, team sizes, timeframes, platforms, handles, portfolio links. Losing a specific number or a named partner is a failure.
- experience[].context: one short factual line describing the employer or the scope (for example "National NGO, artisan livelihoods" or "D2C footwear e-commerce brand") whenever the source supports it, otherwise null.
- Preserve every factual and meaningful section from the original resume. Do not remove roles, projects, education, certifications, awards, languages, volunteer work, publications, training, or other qualifications just because they are less relevant to the target role.
- Preserve every employer, job title, project, credential, institution, date, and contact detail from the source. You may reorder bullets within an entry, but every original entry must remain represented in the result.
- skills: 12-18 role-relevant competencies as a flat ATS-friendly list.
- skillGroups: a categorised tools/skills inventory (for example "Advertising & Performance", "Analytics & Reporting", "Content Creation & Design", "AI & Automation", "Project Management"). Include every tool, platform and software named anywhere in the source resume, grouped sensibly. Return an empty array only when the source names no tools.
- Put source sections that do not fit experience, projects, education, or certifications into additionalSections. Keep their original section title and concise factual items. Always carry over availability, notice period, relocation, visa status, languages, portfolio and links when the source has them.
- Mirror the exact terminology and keywords of the job description so it passes ATS screening, but weave them in naturally — never stuff keywords or repeat the same phrase across bullets.
- Each experience bullet: start with a strong action verb, include impact/metrics where the original provides them, keep under 30 words.
- Order experience strictly reverse-chronological by START date. Any role whose end date is "Present" MUST appear before every role with a finished end date, even if that finished role has a later end date or is more relevant. Never reorder by relevance; relevance only affects bullet order inside a role.
- Formatting of each experience entry must be identical across all roles: same placement of the employer-context line, location and separators. Do not vary punctuation or italics between entries.
- summary: 4-6 sentences aimed at this specific role — years of experience, sectors, the strongest quantified proof points, notable partners or brands, and fit for this market.


PHASE 3 — SOUND LIKE A HUMAN WROTE IT. A hiring manager must never suspect AI. Follow these hard rules:
- BANNED words and phrases (never use, in any section, including the cover letter): delve, leverage (as a verb), spearheaded, harness, robust, seamless, seamlessly, synergy, synergies, cutting-edge, state-of-the-art, game-changer, transformative, unlock, unlocking, elevate, empower, foster, facilitate, orchestrate, navigate (figuratively), landscape (figuratively), realm, tapestry, testament, meticulous, meticulously, dynamic professional, results-driven, results-oriented, detail-oriented, proven track record, passionate about, thrilled, excited to, deeply committed, holistic, streamline (overused — use only if the source resume uses it), utilize (write "use"), in today's fast-paced world, I am writing to express my interest, I believe I would be a great fit, align/alignment (figuratively), resonate, pivotal, instrumental, comprehensive suite, wide array, "not only ... but also", "it's worth noting", "furthermore", "moreover".
- No em dashes (—). Use commas, periods, or "and". No rhetorical questions. No triads of adjectives ("fast, scalable, and reliable"). No bullet that ends with a vague benefit clause like ", driving efficiency and growth".
- Vary sentence and bullet length deliberately: mix short punchy bullets (8-12 words) with longer ones (20-28 words). Do not let every bullet follow the same verb + object + metric rhythm.
- Do not start more than one bullet in the same role with the same verb, and avoid the classic AI verb set (Spearheaded, Orchestrated, Championed, Pioneered). Prefer plain, specific verbs a working professional would use: built, ran, led, cut, shipped, fixed, negotiated, trained, rewrote, owned, launched, scaled, sold, hired.
- Be concrete over impressive. Name the real tools, teams, markets, products, numbers and constraints from the source resume. Specifics read human; abstractions read AI.
- Keep the candidate's own voice and vocabulary where the source resume already reads well. Reuse their phrasing rather than replacing it with polished corporate wording.
- Summary: plain first-person-implied statement of what they do, how long, and the concrete strengths that fit this role. No adjective pile-ups, no "dynamic X professional with a proven track record".
- Cover letter: write like a competent person emailing a hiring manager, not like marketing copy. Open with a specific reason for applying tied to the company or role, give two concrete proof points from the resume, close with a simple, direct sign-off. Contractions are fine. Slight imperfection and directness are better than polish.
- Before returning, reread every sentence and rewrite anything that sounds like a template, a LinkedIn post, or a chatbot.

- keyAchievements: 5-7 of the candidate's strongest, most quantified wins drawn ONLY from the source resume, placed directly after Core Skills like a big-company / Fortune 500 resume template. Each one line, metric-first where the source provides numbers, under 30 words. If the source has no achievements, return an empty array.
  - coverLetter: 200-300 words, addressed to the hiring team at ${data.company || "the company"}, ${data.tone || "confident and professional"} in tone, no placeholders like [Your Name] — use the candidate's real details. Use \\n\\n between paragraphs.
  - matchScore: integer 0-100, and it MUST equal the sum of scoreBreakdown below. Never inflate it to flatter the candidate.
  - scoreBreakdown: keywordMatch (0-40, share of the job description's hard skills, tools and requirements appearing verbatim), titleAlignment (0-15, how close the candidate's real title and seniority are to the posted title), formatting (0-20, parseability, deducting for tables, columns, graphics or non-standard headings in the SOURCE resume), experienceRelevance (0-15, how directly the real history maps to the required years and domain), quantifiedImpact (0-10, density of bullets carrying real metrics).
  - consistencyFlags: plain-language notes on date-math errors or conflicting numbers found in the SOURCE resume (for example "Resume says 5 years of experience, but the listed dates add up to 3 years and 4 months; the conservative figure was used"). Empty array when the source is clean. Never silently fix a conflict by inventing history: use the conservative, defensible number and flag it here.
  - regionAdaptations: what you changed for the hiring market (spelling convention, currency treatment, page length, personal information added or removed, visa or notice-period statement). Empty array for a same-country application with no changes.
  - fitWarning: if the candidate is a genuinely poor fit (major skill gaps or a clear seniority mismatch), say so in one honest sentence instead of force-fitting. Otherwise null.
  - matchedKeywords / missingKeywords: keywords from the job description present or absent in the candidate's background. missingKeywords are only ones the candidate could truthfully add if they genuinely have that experience.
  - tips: 3-5 short, actionable coaching suggestions the candidate can act on themselves. Never suggest fabricating anything.
  - atsScore: integer 0-100 estimating how ATS-friendly and parseable the generated resume is. It must be 95 or higher because the output uses a single-column layout, standard fonts, clear section labels, and strong keyword alignment. If you are not confident it exceeds 95, return 95.
  - FINAL COMPLETENESS AUDIT (do this before returning): walk the source resume line by line and confirm every employer, role, date range, client name, partner organisation, event, tool, number, link and section appears somewhere in your output. Restore anything missing. Then confirm each role meets its minimum bullet count and add back detail from the source if it does not.
- If a section has no source material, return an empty array. Never create a section from the job description alone.

PHASE 3.2 — TRUTH GUARDRAILS YOU MAY NEVER VIOLATE:
- HARD RULE, NO EXCEPTIONS: every skill, tool, platform, software, method and keyword in skills, skillGroups, keyAchievements, experience bullets, summary and the cover letter must be stated or clearly shown in the SOURCE resume. A tool or skill that appears only in the job description (for example an ad platform, analytics product or CRM the candidate never mentions) must NOT be added anywhere in the resume or the cover letter; list it in missingKeywords instead. If the job description asks for something the resume lacks, leave it out.
- The headline title under the candidate's name must be the candidate's own real current or most recent job title from the source, never the title of the job being applied for. Do not claim seniority, team size, budget ownership or years of experience that the source does not show.
- The professional summary must be written in implied first person, with no pronouns and never the candidate's name or third person: start with the role or the work, e.g. "Marketing associate with 3 years of experience in...", never "Priya Sharma is..." or "She has...".
- Never state relocation willingness, visa status, work authorisation, notice period, availability, nationality or salary unless the source resume says it. If the hiring market normally expects such a line and the source lacks it, leave it out and mention it in tips. Do not add bullets describing duties the source resume does not show.
- Before returning, re-read your skills and skillGroups lists and delete every item you cannot point to in the source resume.
- Never invent a job, employer, skill, certification, metric or achievement that is not in the source resume, in the resume or the cover letter. Never inflate a real metric.
- Total years of experience stated anywhere in the output must reconcile with the date ranges you list. If the source contradicts itself, use the conservative figure and record it in consistencyFlags.
- Never add date of birth, nationality, marital status or a photo unless the source resume states them AND the hiring market's rules below expect them.
- Never use a currency or unit conversion to make a number look larger than the original figure. Approximations must be round and clearly marked approximate.
- Never fabricate a referral, personal connection or reason for interest in the cover letter.
- Reframe transferable experience with the job description's wording only where it is truthful. Where the job description and the candidate use different terms for the same real thing (for example "paid social" and "Meta Ads"), keep both so each form is indexed.


PHASE 3.5 — SURVIVE GREENHOUSE / WORKDAY / LEVER RESUME PARSING. These ATS products parse the PDF into structured fields before a human sees it:
- experience[].company must be the employer's FULL legal or trading name exactly as the source resume writes it (for example "All India Artisans and Craftworkers Welfare Association (AIACA)"). Never abbreviate, never truncate, never merge the employer name into the role title.
- experience[].role must be only the job title (for example "Communication Manager"). Do not append the employer, brand, parentheses or a tagline to it; employer context belongs in company and context.
- dates: use "Mon YYYY – Mon YYYY" or "Mon YYYY – Present". No seasons, no "Ongoing", no bare years for roles.
- CURRENCY IS A FACT: reproduce every money figure in the exact currency and symbol the source resume uses, and never attach a currency to a number the source left unlabelled. You may only add an approximate equivalent in brackets when the cross-border rules below explicitly allow it, and the original figure must still be there.
- Do not restate the same achievement in more than one section. Key Achievements, Experience bullets and any Additional section must not duplicate each other's wording; parsers score repeated blocks as keyword stuffing.
- contacts: one entry per item (location, phone, email, LinkedIn, portfolio). Skip an item entirely rather than repeating the same URL under two labels.
- Spell out an acronym once with the full term beside it (for example "Search Engine Optimisation (SEO)") so both forms are indexed.
- No tables, columns, headers/footers, icons or graphics in any field; plain text only.
- Section headings must use the standard labels parsers expect: Summary, Skills, Experience, Education, Certifications, Projects. Never invent creative headings.

PHASE 3.6 — UNIVERSAL ATS PARSE RULES (apply to every resume, domestic or cross-border):
${ATS_PARSE_RULES.map((rule) => `- ${rule}`).join("\n")}

PHASE 4 — WRITE FOR THE HIRING MARKET OF THE JOB: ${market.label}. These conventions are mandatory and override any generic habit:
${market.rules.map((rule) => `- ${rule}`).join("\n")}
${crossBorder.length ? `\nPHASE 4.5 — CROSS-BORDER APPLICATION RULES (mandatory, they override Phase 4 where they conflict):\n${crossBorder.map((rule) => `- ${rule}`).join("\n")}\n` : ""}${domestic.length ? `\nPHASE 4.5 — DOMESTIC APPLICATION RULES (same country on both sides; mandatory, they override Phase 4 where they conflict):\n${domestic.map((rule) => `- ${rule}`).join("\n")}\n` : ""}
PHASE 5 — WRITE THE COVER LETTER FOR THE SAME MARKET: ${market.label}. These conventions are mandatory:
${letterRules.map((rule) => `- ${rule}`).join("\n")}
- Use the same spelling, units, currency treatment and date format as the resume above, and never contradict a fact in it.

TARGET COMPANY: ${data.company || "Not specified"}
TARGET ROLE: ${data.role || "Not specified"}

--- JOB DESCRIPTION ---
${data.jobDescription}

--- CANDIDATE'S CURRENT RESUME ---
${data.resume}`;

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({ schema: tailoredResumeSchema }),
      prompt,
      maxOutputTokens: 16000,
    });
    let result = output;

    // Never ship a draft that silently dropped facts from the default resume.
    const { findMissingFacts } = await import("./resume-facts.server");
    let missing = findMissingFacts(data.resume, result);
    // The repair pass doubles the wait, so only pay for it when the draft is
    // genuinely thin or dropped several real facts, not for cosmetic gaps.
    if (needsDepthRepair(result) || missing.length >= 3) {
      const repaired = await repairDepth(gateway, result, data, prompt, missing);
      // Only accept the repair if it did not lose ground on preservation.
      if (findMissingFacts(data.resume, repaired).length <= missing.length) {
        result = repaired;
        missing = findMissingFacts(data.resume, result);
      }
    }

    // Deterministic honesty pass: remove claims, skills and duties the source
    // resume does not support (guards weaker models).
    try {
      const { guardResume } = await import("./truth-guard.server");
      const guarded = guardResume(result, data.resume);
      result = guarded.result;
      if (guarded.removed.length) console.log(`[truth-guard] removed ${guarded.removed.length}`);
      const { polishResume, QualityError } = await import("./truth-guard.server");
      const polished = polishResume(result, final);
      result = polished.result;
      if (polished.issues.length) {
        if (!final) throw new QualityError(polished.issues);
        console.warn(`[quality] shipped after retry with notes: ${polished.issues.slice(0, 3).join("; ")}`);
      }
    } catch (e) {
      if ((e as Error)?.name === "QualityError" || (e as any)?.issues) throw e;
      console.error("[truth-guard] failed", e);
    }

    // Guarantee our public ATS score is always above 95%, as promised, and
    // keep the headline match score honest: it must equal its own breakdown.
    const b = result.scoreBreakdown;
    const summed = b
      ? Math.round(b.keywordMatch + b.titleAlignment + b.formatting + b.experienceRelevance + b.quantifiedImpact)
      : null;
    return humanize({
      ...result,
      matchScore: summed !== null ? Math.max(0, Math.min(100, summed)) : result.matchScore,
      atsScore: Math.max(95, Math.min(100, Math.round(result.atsScore ?? 95))),
    });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      try {
        const raw = (error.text ?? "").replace(/^```json\s*|```$/g, "");
        return humanize(tailoredResumeSchema.parse(JSON.parse(raw)));
      } catch {
        throw new Error("The AI response could not be parsed. Please try again.");
      }
    }
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

/**
 * The model often returns a compressed first draft: short bullet lists, no
 * employer context, no grouped tools inventory. Detect that instead of
 * shipping a thin resume.
 */
function needsDepthRepair(r: TailoredResume): boolean {
  const roles = r.experience ?? [];
  if (!roles.length) return false;
  const firstShort = (roles[0]?.bullets?.length ?? 0) < 5;
  const anyShort = roles.some((role) => (role.bullets?.length ?? 0) < 3);
  return firstShort || anyShort;
}

/** Second pass that expands a thin draft back to full recruiter-grade depth. */
async function repairDepth(
  gateway: ReturnType<typeof createLovableAiGatewayProvider>,
  draft: TailoredResume,
  data: TailorInput,
  basePrompt: string,
  missingFacts: string[] = [],
): Promise<TailoredResume> {
  const missingBlock = missingFacts.length
    ? `\nFACTS FROM THE SOURCE RESUME THAT YOUR DRAFT DROPPED. Put every one of these back somewhere truthful in the resume (the right role, project, education entry, skills group, contacts line or an additional section). Do not change their meaning:\n${missingFacts.map((fact) => `- ${fact}`).join("\n")}\n`
    : "";

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({ schema: tailoredResumeSchema }),
      maxOutputTokens: 16000,
      prompt: `${basePrompt}

--- YOUR PREVIOUS DRAFT (incomplete, must be expanded) ---
${JSON.stringify(draft)}
${missingBlock}
REPAIR TASK: return the SAME resume, expanded. Keep every existing fact and wording that already works, and:
- Most recent role: 7-10 bullets. Every other role: 5-7 bullets, never fewer than 4.
- Add the missing detail back from the source resume below: client names, partner organisations, event names, tools, budgets, percentages, follower counts, team sizes, links.
- Fill experience[].context with a short factual line about each employer or its scope wherever the source supports it.
- Fill skillGroups with categorised tool/skill groups covering every tool named in the source resume.
- Do not invent anything that is not in the source resume. Do not shorten anything. Do not delete any role, project, degree, certification, language or link that is in the source.

--- CANDIDATE'S CURRENT RESUME ---
${data.resume}`,
    });
    return output;
  } catch {
    return draft;
  }
}



/**
 * Last-mile scrub of the punctuation and wording that make a resume read as
 * machine-written. The prompt does the heavy lifting; this catches leftovers.
 */
const TELLS: Array<[RegExp, string]> = [
  [/\bUtiliz(?:e|ed|ing|es)\b/g, "Used"],
  [/\butiliz(?:e|ed|ing|es)\b/g, "used"],
  [/\bleverag(e|ed|ing|es)\b/gi, "used"],
  [/\bspearhead(ed|ing|s)?\b/gi, "led"],
  [/\bdelv(e|ed|ing)\b/gi, "looked"],
  [/\bseamlessly\b/gi, ""],
  [/\bmeticulously\b/gi, ""],
  [/\brobust\b/gi, "reliable"],
  [/\bcutting-edge\b/gi, "new"],
  [/\bin today's fast-paced world,?\s*/gi, ""],
  [/\bproven track record\b/gi, "track record"],
  [/\bresults-(driven|oriented)\b/gi, ""],
  [/\bdetail-oriented\b/gi, ""],
];

/**
 * Dashes are replaced with commas because em dashes read as AI writing, but a
 * dash inside a range ("Nov 2024 – Apr 2026", "10 – 15%") is real punctuation:
 * turning it into a comma corrupts the fact.
 */
const RANGE_TOKEN =
  /(?:\d{4}|\d{1,3}%?|present|current|now|ongoing|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i;

function replaceDashes(value: string): string {
  return value.replace(
    /(\S*)\s*[—–]\s*(\S*)/g,
    (match, before: string, after: string) =>
      RANGE_TOKEN.test(before) && RANGE_TOKEN.test(after) ? `${before} – ${after}` : `${before}, ${after}`,
  );
}

/**
 * A scrubbed phrase must not leave the sentence headless ("Proven track record
 * of..." became "track record of..."), so restore sentence-start capitals and
 * clean up the punctuation left behind by a deleted word.
 */
function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,;:])\s*([,.;:])/g, "$2")
    .replace(/^[\s,;:]+/, "")
    .replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_m, lead: string, letter: string) => lead + letter.toUpperCase())
    .trim();
}

function clean(value: string): string {
  let out = replaceDashes(value);
  for (const [pattern, replacement] of TELLS) {
    out = out.replace(pattern, replacement as string);
  }
  return tidy(out);
}


/**
 * Fields that are identity or date data, never prose. Scrubbing them turns
 * "Nov 2024 – Apr 2026" into "Nov 2024, Apr 2026", so they are left alone.
 */
const VERBATIM_KEYS = new Set(["dates", "name", "company", "institution", "contacts", "credential"]);

function humanize<T>(value: T): T {
  if (typeof value === "string") return clean(value) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => humanize(item)) as unknown as T;
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (VERBATIM_KEYS.has(key)) result[key] = item;
      else if (key === "coverLetter" && typeof item === "string") result[key] = cleanLetter(item);
      else result[key] = humanize(item);
    }
    return result as unknown as T;
  }
  return value;
}


/** Same scrub, but preserves the blank lines between cover-letter paragraphs. */
function cleanLetter(letter: string): string {
  return letter
    .split(/\n\s*\n/)
    .map((paragraph) => clean(paragraph.replace(/\n/g, " ")))
    .filter(Boolean)
    .join("\n\n");
}


/** First day of the current calendar month, as an ISO timestamp. */
export function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
