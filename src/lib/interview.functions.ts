import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// AI Interview. Login required. The server keeps nothing: no resume, no job
// description, no questions, no answers, no feedback. The only thing written to
// the database is one row (user id + time) per interview, so plans can count attempts.

const setupSchema = z.object({
  company: z.string().trim().max(120).default(""),
  role: z.string().trim().min(2, "Add the job role.").max(120),
  jd: z.string().trim().min(40, "Paste the job description (at least a few lines).").max(8000),
  resume: z.string().trim().min(80, "We could not read enough text from your resume.").max(12000),
});

const finishSchema = setupSchema.extend({
  qa: z
    .array(z.object({ q: z.string().trim().max(200), a: z.string().trim().max(3000).default("") }))
    .min(1)
    .max(10),
});

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setupSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const { makeQuestions } = await import("./interview.server");
    const ctx = context as { userId: string };
    await enforcePolicy("interview_global", "site");
    await enforcePolicy("interview", ctx.userId);
    const questions = await makeQuestions(data);
    try {
      const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
      await admin.from("interview_log").insert({ user_id: ctx.userId });
    } catch {
      // Counting is best effort.
    }
    return { questions };
  });

export const finishInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => finishSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const { makeFeedback } = await import("./interview.server");
    const ctx = context as { userId: string };
    await enforcePolicy("interview", ctx.userId);
    const { qa, ...setup } = data;
    return { feedback: await makeFeedback(setup, qa) };
  });
