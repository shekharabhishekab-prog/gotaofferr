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
export async function polishDraft(draft: ResumeDraft): Promise<PolishedResume> {
  const key = (process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined));
  if (!key) throw new Error("AI is not configured right now. Please try again later.");
  const gateway = createLovableAiGatewayProvider(key);

  // No job description here, so the format follows where the user is (IP country).
  // If the country is unknown, fall back to the template the user picked.
  const { detectCountry, resumeMarket } = await import("./resume-locale.server");
  const country = detectCountry();
  const market = country ? resumeMarket(country) : null;
  const formatLabel = market ? market.label : draft.template === "india" ? "Indian national" : "international";
  const formatRules = market ? market.rules : TEMPLATE_RULES[draft.template];

  const prompt = `You are a senior resume writer. Turn the candidate's rough notes into a clean, ATS-safe resume in the ${formatLabel} format.

FORMAT RULES (mandatory):
${formatRules.map((rule) => `- ${rule}`).join("\n")}

WRITING RULES (mandatory):
- Never invent an employer, job title, date, degree, tool, client or number that is not in the notes. If a metric is missing, write the outcome without a number rather than making one up.
- If a field was left blank, return an empty string for it. Never write placeholder text such as "Not Specified", "N/A" or "Company Name".
- Keep every fact the candidate gave, including exact company names and dates.
- Each experience gets 3-5 bullets. Start with a strong past-tense verb; no "Responsible for", no "Spearheaded", no "Leveraged", no "Utilized", no "Passionate", no "Dynamic", no em dashes.
- Write like an experienced professional wrote it by hand: direct, specific, plain. It must not read as AI-generated.
- Summary: 2-3 sentences, first person implied (no "I"), naming the candidate's actual domain and years of experience only if the notes support it.
- skills: 8-14 concrete skills or tools drawn from the notes, written the way a job posting writes them.
- keyAchievements: at most 4, only where the notes contain a real, standout result. Return an empty array otherwise, and never repeat an experience bullet.
- tips: 2-4 short, specific suggestions on what the candidate should still add (missing metrics, thin sections).

--- CANDIDATE NOTES ---
${draftToText(draft)}`;

  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) => generateText({
      model: createLovableAiGatewayProvider(key, modelId)(modelId),
      output: Output.object({ schema: polishedResumeSchema }),
      prompt,
      maxOutputTokens: 8000,
    }));
    return stripPlaceholders(output, draft);
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
function stripPlaceholders(result: PolishedResume, draft: ResumeDraft): PolishedResume {
  const hadExperience = draft.experience.some((item) => item.role || item.company || item.details);
  const clean = (value: string) => (PLACEHOLDER.test((value ?? "").trim()) ? "" : value);
  return {
    ...result,
    headline: clean(result.headline),
    experience: (hadExperience ? result.experience : []).map((item) => ({
      ...item,
      role: clean(item.role),
      company: clean(item.company),
      location: clean(item.location),
      dates: clean(item.dates),
    })),
  };
}

