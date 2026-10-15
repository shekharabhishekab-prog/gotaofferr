import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const setupSchema = z.object({
  mode: z.enum(["questions", "feedback"]),
  company: z.string().trim().max(120).default(""),
  role: z.string().trim().min(2, "Add the job role.").max(120),
  jd: z.string().trim().min(40, "Paste the job description (at least a few lines).").max(8000),
  resume: z.string().trim().min(80, "We could not read enough text from your resume.").max(12000),
  qa: z
    .array(z.object({ q: z.string().trim().max(200), a: z.string().trim().max(3000).default("") }))
    .min(1)
    .max(10)
    .optional(),
  deviceId: z.string().trim().min(6).max(200),
});

/**
 * ProNet AI interview - terbey.com's makeQuestions / makeFeedback chains.
 * Terbey gates interviews behind login (free tier: 1/month); the ProNet
 * equivalent for a logged-out visitor: ProNet gets its own generous counter
 * (10/day, owner-approved 2026-10-15), terbey.com counters untouched.
 * One interview = questions + one feedback call, so only "questions" consumes
 * the monthly use.
 */
export const Route = createFileRoute("/api/public/pronet/interview")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson, pronetIdentity, pronetUsedRolling, pronetRecordUse } = await import("@/lib/pronet-public.server");
        try {
          const body = setupSchema.parse(await request.json());
          const { enforcePolicy } = await import("@/lib/rate-limit.server");
          const id = await pronetIdentity(request, body.deviceId);
          await enforcePolicy("interview_global", "site");
          await enforcePolicy("pronet_interview", id.ipHash);

          const { mode, qa, deviceId: _d, ...setup } = body;
          if (mode === "questions") {
            if (await pronetUsedRolling("pronet:interview:", id, 10)) {
              return pronetJson(request, {
                error: "You have used your free AI interview for this month. It resets next month - terbey.com accounts get more.",
                used: true,
              });
            }
            const { makeQuestions } = await import("@/lib/interview.server");
            const questions = await makeQuestions(setup);
            await pronetRecordUse("pronet:interview:", id);
            return pronetJson(request, { questions });
          }

          if (!qa || qa.length === 0) return pronetJson(request, { error: "Missing interview answers." }, 400);
          const { makeFeedback } = await import("@/lib/interview.server");
          const feedback = await makeFeedback(setup, qa);
          return pronetJson(request, { feedback });
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.interview", error, "Interview failed. Please try again.") });
        }
      },
    },
  },
});
