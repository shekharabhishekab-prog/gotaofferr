import { z } from "zod";

import { resumeTemplates } from "./resume-builder-schema";

/** Which field the inline "Improve with AI" button was pressed on. */
export const assistKinds = [
  "summary",
  "skills",
  "experience",
  "project",
  "certifications",
] as const;

export type AssistKind = (typeof assistKinds)[number];

export const assistInputSchema = z
  .object({
    kind: z.enum(assistKinds),
    template: z.enum(resumeTemplates).default("international"),
    /** The user's rough text for this one field. */
    text: z.string().trim().min(3).max(3000),
    /** Light context so the rewrite stays on-role. */
    targetRole: z.string().trim().max(120).default(""),
    role: z.string().trim().max(120).default(""),
    company: z.string().trim().max(120).default(""),
    turnstileToken: z.string().trim().max(4000).optional(),
  })
  .strict();

export type AssistInput = z.infer<typeof assistInputSchema>;

export const assistResultSchema = z.object({
  /** Rewritten text, already formatted the way the field expects. */
  text: z.string(),
});

export type AssistResult = z.infer<typeof assistResultSchema>;
