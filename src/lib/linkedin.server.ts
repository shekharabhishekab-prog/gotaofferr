import { generateText, Output } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

import {
  linkedinFreeReviewSchema,
  linkedinProReviewSchema,
  type LinkedInFreeReview,
  type LinkedInInput,
  type LinkedInProReview,
} from "./linkedin-schema";

const VOICE_RULES = `Writing rules you must follow:
- Never invent an employer, title, date, tool, client, metric or number that is not in the profile text.
- Plain professional English. No "Spearheaded", "Leveraged", "Passionate", "Dynamic", "Seasoned", no em dashes, no buzzwords, no emojis.
- Anything you rewrite must read like the person wrote it themselves, not like AI output.
- Be specific and blunt in the feedback. Generic advice ("add more keywords") is useless — name the exact line and the exact change.`;

function profileText(data: LinkedInInput): string {
  return `PROFILE URL: ${data.profileUrl || "Not given"}

--- HEADLINE ---
${data.headline || "Not given"}

--- ABOUT ---
${data.about || "Not given"}

--- EXPERIENCE ---
${data.experience || "Not given"}

--- SKILLS ---
${data.skills || "Not given"}`;
}

/** Free report: overall score plus headline, About and skills feedback. */
export async function reviewProfileFree(data: LinkedInInput): Promise<LinkedInFreeReview> {
  const key = (process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined));
  if (!key) throw new Error("AI is not available right now. Please try again later.");
  const gateway = createLovableAiGatewayProvider(key);

  const prompt = `You are a LinkedIn profile reviewer who has screened thousands of candidates as a recruiter.

Score this LinkedIn profile out of 100 on how well it would perform in recruiter search and in a recruiter's first ten seconds of reading. Judge: headline clarity and searchability, About-section positioning and proof, and whether the skills list matches how jobs are actually advertised.

Scoring guide: 0-40 unfinished or vague, 41-60 readable but generic, 61-80 solid with clear gaps, 81-100 recruiter-ready.

For the headline and About sections give a verdict sentence, 2-4 concrete strengths, 2-5 specific fixes, and one rewritten version using only facts already in the profile.
For skills, list which listed skills to keep, which ones to add based on the person's actual experience, and the fixes.

${VOICE_RULES}

${profileText(data)}`;

  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) => generateText({
      model: createLovableAiGatewayProvider(key, modelId)(modelId),
      output: Output.object({ schema: linkedinFreeReviewSchema }),
      prompt,
      maxOutputTokens: 6000,
    }));
    return output;
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

/** Paid report: keyword alignment for a target role, industry advice, and rewrites. */
export async function reviewProfilePro(data: LinkedInInput): Promise<LinkedInProReview> {
  const key = (process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined));
  if (!key) throw new Error("AI is not available right now. Please try again later.");
  const gateway = createLovableAiGatewayProvider(key);

  const prompt = `You are a LinkedIn profile strategist working with a candidate targeting this role: ${data.targetRole || "the role their experience points to"}.

Produce:
1. keywordAlignment — score out of 100 for how well this profile matches recruiter searches for that target role, the role keywords already present in the profile verbatim, the important ones missing, and short notes on where each missing keyword should honestly go.
2. industrySuggestions — 4 to 7 suggestions specific to that role's industry (what that industry's recruiters look for, what proof matters, what to drop).
3. aboutRewrite — a full rewritten About section, first person, 3 short paragraphs, positioned for the target role.
4. experienceRewrite — a rewritten experience section: one entry per role found in the profile, each with a heading (role and company as written) and 3 to 5 bullets that lead with outcome.

${VOICE_RULES}

TARGET ROLE: ${data.targetRole || "Not specified"}

${profileText(data)}`;

  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain("career_pro", (modelId) => generateText({
      model: createLovableAiGatewayProvider(key, modelId)(modelId),
      output: Output.object({ schema: linkedinProReviewSchema }),
      prompt,
      maxOutputTokens: 10000,
    }));
    return output;
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

