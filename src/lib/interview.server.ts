import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { PROMPT_GUARD } from "./prompt-guard";

/**
 * AI Interview. Nothing here is stored. The resume, job description, questions,
 * answers and feedback only live in the request and the response.
 * Every plan uses the small (lite) models, never the strong ones.
 */

export type InterviewSetup = { company: string; role: string; jd: string; resume: string };
export type InterviewQa = { q: string; a: string };

const questionsSchema = z.object({
  questions: z.array(z.string().min(5).max(160)).length(10),
});

const feedbackSchema = z.object({
  overall: z.number().int().min(0).max(100),
  parts: z.object({
    relevance: z.number().int().min(0).max(100),
    clarity: z.number().int().min(0).max(100),
    examples: z.number().int().min(0).max(100),
    jdMatch: z.number().int().min(0).max(100),
  }),
  summary: z.string().max(300),
  strengths: z.array(z.string().max(220)).min(1).max(4),
  fixes: z.array(z.string().max(220)).min(1).max(4),
  perQuestion: z.array(z.object({ n: z.number().int().min(1).max(10), tip: z.string().max(260) })).max(10),
});
export type InterviewFeedback = z.infer<typeof feedbackSchema>;

function key(): string {
  const k = process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined);
  if (!k) throw new Error("AI is not available right now. Please try again later.");
  return k;
}

const RULES = `Rules you must follow:
- Plain, simple English. Short sentences. No jargon, no emojis, no em dashes.
- Never invent an employer, title, tool, number or achievement that is not in the resume or job description.
- You are a friendly but honest interviewer named Coco.`;

function setupText(s: InterviewSetup): string {
  return `COMPANY: ${s.company || "Not given"}
ROLE: ${s.role}

--- JOB DESCRIPTION ---
${s.jd}

--- CANDIDATE RESUME ---
${s.resume}`;
}

export async function makeQuestions(s: InterviewSetup): Promise<string[]> {
  const k = key();
  const prompt = `${PROMPT_GUARD}

You are Coco, a friendly interviewer. Write exactly 10 interview questions for this candidate and role.

Mix, in this order:
1. One short warm-up (tell me about yourself in relation to this role).
2. Five questions about specific things in the candidate's RESUME (a real project, job, tool or result they list). Name the thing.
3. Three questions that test the fit between the RESUME and the JOB DESCRIPTION (a skill or tool the job asks for).
4. One short situational question for this role.

Hard rules:
- Every question is SHORT: 18 words or fewer, one sentence, ONE question only. No two-part questions.
- Easy to say out loud and answer in about a minute.
- No question may ask for personal data (age, religion, family, health).
${RULES}

${setupText(s)}`;
  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) =>
      generateText({
        model: createLovableAiGatewayProvider(k, modelId)(modelId),
        output: Output.object({ schema: questionsSchema }),
        prompt,
        maxOutputTokens: 1500,
        abortSignal: AbortSignal.timeout(40_000),
        maxRetries: 0,
      }),
      { cerebrasFirst: true },
    );
    return output.questions.map((q) => q.trim());
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

export async function makeFeedback(s: InterviewSetup, qa: InterviewQa[]): Promise<InterviewFeedback> {
  const k = key();
  const answers = qa.map((x, i) => `Q${i + 1}: ${x.q}\nA${i + 1}: ${x.a.trim() || "(no answer given)"}`).join("\n\n");
  const prompt = `${PROMPT_GUARD}

You are Coco, a friendly but honest interview coach. Review this practice interview. The answers were spoken and turned into text, so ignore small speech-to-text mistakes.

Score out of 100: relevance (did the answer address the question), clarity (easy to follow), examples (real specific examples, results, numbers that are in the candidate's own words), jdMatch (how well the answers connect to the job description). Overall is a fair mix of these four. Unanswered questions lower the scores. Be honest: do not give high scores to weak or empty answers.

Give: a one-sentence summary, 2 to 4 strengths, 2 to 4 things to fix, and for each question number a one-line tip on how to say that answer better (max 30 words). Tips must use only facts the candidate already gave or that are in the resume. Never invent experience for them.
${RULES}

${setupText(s)}

--- PRACTICE INTERVIEW ---
${answers}`;
  try {
    const { output } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) =>
      generateText({
        model: createLovableAiGatewayProvider(k, modelId)(modelId),
        output: Output.object({ schema: feedbackSchema }),
        prompt,
        maxOutputTokens: 3500,
        abortSignal: AbortSignal.timeout(40_000),
        maxRetries: 0,
      }),
      { cerebrasFirst: true },
    );
    return output;
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}
