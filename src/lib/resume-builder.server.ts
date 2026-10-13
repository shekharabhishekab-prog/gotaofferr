import { PROMPT_GUARD } from "./prompt-guard";
import { generateText, NoObjectGeneratedError, Output } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

import {
  polishedResumeSchema,
  splitLines,
  splitList,
  type PolishedResume,
  type ResumeDraft,
} from "./resume-builder-schema";

const TEMPLATE_RULES: Record<ResumeDraft["template"], string[]> = {
  india: [
    "Audience: Indian recruiters and Indian ATS portals (Naukri, Workday, Taleo).",
    "Indian English spelling. Use lakh/crore only when the source already used it; otherwise plain numbers with the Rs. prefix.",
    "Two pages are acceptable for 3+ years of experience; freshers stay on one page.",
    "Education carries weight: keep degree, institution and score prominent, especially for freshers.",
    "Notice period, CTC and personal details stay out of the bullets — they belong in the Additional section only if the user supplied them.",
  ],
  international: [
    "Audience: US, EU, UK, Canada, Australia and Gulf employers screening through Greenhouse, Lever, Workday.",
    "Never mention age, date of birth, marital status, religion, photo or parents' names anywhere.",
    "One page for under 8 years of experience, two pages maximum after that.",
    "Use international units and spell out any India-specific term (for example 'Rs. 4 crore (approx. USD 480K)').",
    "Lead every bullet with a measurable business outcome, not a responsibility.",
  ],
};

function draftToText(draft: ResumeDraft): string {
  const parts: string[] = [];
  parts.push(`NAME: ${draft.fullName}`);
  if (draft.targetRole) parts.push(`TARGET ROLE: ${draft.targetRole}`);
  if (draft.summary) parts.push(`ABOUT ME (rough): ${draft.summary}`);
  if (draft.skills) parts.push(`SKILLS: ${draft.skills}`);

  draft.experience
    .filter((item) => item.role || item.company || item.details)
    .forEach((item) => {
      parts.push(
        [
          `EXPERIENCE: ${item.role || "Role not given"} at ${item.company || "Company not given"}`,
          item.dates ? `Dates: ${item.dates}` : null,
          item.location ? `Location: ${item.location}` : null,
          item.details ? `What they did (rough notes):\n${item.details}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    });

  draft.projects
    .filter((item) => item.name || item.details)
    .forEach((item) => parts.push(`PROJECT: ${item.name}\n${item.details}`));

  draft.education
    .filter((item) => item.credential || item.institution)
    .forEach((item) =>
      parts.push(
        `EDUCATION: ${item.credential} — ${item.institution} ${item.dates} ${item.score}`.trim(),
      ),
    );

  if (draft.certifications) parts.push(`CERTIFICATIONS: ${draft.certifications}`);
  return parts.join("\n\n");
}

/** Deterministic fallback so the builder still works if the AI call fails. */
export function fallbackPolish(draft: ResumeDraft): PolishedResume {
  return {
    headline: draft.targetRole,
    summary: draft.summary,
    skills: splitList(draft.skills),
    keyAchievements: [],
    experience: draft.experience
      .filter((item) => item.role || item.company)
      .map((item) => ({
        role: item.role,
        company: item.company,
        location: item.location,
        dates: item.dates,
        bullets: splitLines(item.details),
      })),
    projects: draft.projects
      .filter((item) => item.name)
      .map((item) => ({ name: item.name, description: "", bullets: splitLines(item.details) })),
    tips: [],
  };
}

/**
 * Rewrites the user's rough notes into recruiter-grade resume copy without
 * inventing employers, dates, tools or metrics that were not supplied.
 */
export async function polishDraft(
  draft: ResumeDraft,
  tier: import("./model-router.server").RoutingTier = "free",
): Promise<PolishedResume> {
  const key = (process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined));
  if (!key) throw new Error("AI is not configured right now. Please try again later.");
  const gateway = createLovableAiGatewayProvider(key);

  // No job description here, so the format follows where the user is (IP country).
  // If the country is unknown, fall back to the template the user picked.
  const { detectCountry, resumeMarket } = await import("./resume-locale.server");
  // The visible country field wins. Otherwise IP, then the India template means India.
  const country = draft.country?.toUpperCase() || detectCountry() || (draft.template === "india" ? "IN" : null);
  const market = country ? resumeMarket(country) : null;
  const formatLabel = market ? market.label : draft.template === "india" ? "Indian national" : "international";
  const formatRules = market ? market.rules : TEMPLATE_RULES[draft.template];

  const prompt = `${PROMPT_GUARD}

You are a senior resume writer. Turn the candidate's rough notes into a clean, ATS-safe resume in the ${formatLabel} format.

FORMAT RULES (mandatory):
${formatRules.map((rule) => `- ${rule}`).join("\n")}

WRITING RULES (mandatory):
- Never invent an employer, job title, date, degree, tool, client or number that is not in the notes. If a metric is missing, write the outcome without a number rather than making one up.
- If a field was left blank, return an empty string for it. Never write placeholder text such as "Not Specified", "N/A" or "Company Name".
- Do not state any result or effect the notes do not state. Banned unless the notes explicitly give that result (in any form, including -ing endings such as improving, increasing, boosting, enhancing, driving): increased, improved, boosted, grew, drove, enhanced, reduced, saved, optimized for results, "organic traffic" gains. Describe scope and action instead (e.g. "Handled SEO for 6 client websites"). Never imply an outcome.
- Keep every fact the candidate gave, including exact company names and dates.
- Each experience gets 3-5 bullets. Start with a strong past-tense verb; no "Responsible for", no "Spearheaded", no "Leveraged", no "Utilized", no "Passionate", no "Dynamic", no em dashes.
- Write like an experienced professional wrote it by hand: direct, specific, plain. It must not read as AI-generated.
- Summary: no outcome or effect wording either (never "driving", "improving", "optimizing", "boosting" visibility, traffic or results). Use scope and skill phrasing, for example "SEO specialist across 6 client websites". 2-3 sentences, first person implied (no "I"), naming the candidate's actual domain and years of experience only if the notes support it.
- skills: only skills, tools or methods that the notes name or clearly describe doing. Do NOT add related skills the notes do not mention (no "Keyword Research", "On-page Optimization", "Email Marketing" or similar unless the notes say so). Fewer than 8 is fine. Write them the way a job posting writes them.
- keyAchievements: at most 4, only where the notes contain a real, standout result. Return an empty array otherwise, and never repeat an experience bullet.
- tips: 2-4 short, specific suggestions on what the candidate should still add (missing metrics, thin sections).

--- CANDIDATE NOTES ---
${draftToText(draft)}`;

  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain(tier, (modelId) => generateText({
      model: createLovableAiGatewayProvider(key, modelId)(modelId),
      output: Output.object({ schema: polishedResumeSchema }),
      prompt,
      maxOutputTokens: 8000,
      abortSignal: AbortSignal.timeout(40_000),
      maxRetries: 0,
    }), { cerebrasFirst: true });
    const __r = stripPlaceholders(output, draft);
    try { (__r as any).tips = [...((__r as any).tips ?? []), `[DEBUG model: ${(globalThis as any).__cbModel}]`]; } catch {} // TEMP DEBUG
    return __r;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      try {
        const raw = (error.text ?? "").replace(/^```json\s*|```$/g, "");
        return polishedResumeSchema.parse(JSON.parse(raw));
      } catch {
        throw new Error("The AI response could not be parsed. Please try again.");
      }
    }
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

const PLACEHOLDER = /^(n\/?a|not specified|not provided|not given|unknown|company( name)?|employer|organi[sz]ation|your company|xyz|none)$/i;

/** The model sometimes fills blank fields with "Not Specified"; drop those. */
const BUILDER_CLAIMS = /return on (ad )?spend|\broas\b|\broi\b|return on investment|conversion rates?|revenue growth|\brevenue\b/i;
const stemW = (w: string) => w.toLowerCase().replace(/(ing|ed|es|s)$/, "");

/** Cuts invented tails ("... through audience segmentation") and unsupported result claims. */
function trimInvented(text: string, notes: string): string {
  const src = new Set((notes.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stemW));
  const has = (w: string) => src.has(stemW(w));
  const claimsOk = (t: string) => !BUILDER_CLAIMS.test(t) || BUILDER_CLAIMS.test(notes);
  let out = text;
  const m = /^(.*\S)\s+(?:through|via|using|by|to|while)\s+(.+)$/i.exec(out);
  if (m) {
    const tail = (m[2].toLowerCase().match(/[a-z]{4,}/g) ?? []);
    const absent = tail.filter((w) => !has(w));
    if (tail.length >= 2 && absent.length >= 2 && absent.length / tail.length >= 0.6) out = m[1];
    else if (!claimsOk(m[2])) out = m[1];
  }
  if (!claimsOk(out)) {
    const parts = out.split(/(?<=[.!?])\s+/);
    const kept = parts.filter(claimsOk);
    out = kept.length ? kept.join(" ") : out;
  }
  return out;
}

function stripPlaceholders(result: PolishedResume, draft: ResumeDraft): PolishedResume {
  const notes = draftToText(draft);
  const hadExperience = draft.experience.some((item) => item.role || item.company || item.details);
  const clean = (value: string) => (PLACEHOLDER.test((value ?? "").trim()) ? "" : value);
  return {
    ...result,
    headline: clean(result.headline),
    summary: trimInvented(result.summary, notes),
    keyAchievements: result.keyAchievements.map((k) => trimInvented(k, notes)),
    experience: (hadExperience ? result.experience : []).map((item) => ({
      ...item,
      bullets: item.bullets.map((b) => trimInvented(b, notes)),
      role: clean(item.role),
      company: clean(item.company),
      location: clean(item.location),
      dates: clean(item.dates),
    })),
  };
}

