import { z } from "zod";

/** What the visitor pastes in. Everything is optional individually, but the
 *  profile as a whole must contain enough text to review. */
export const linkedinInputSchema = z
  .object({
    profileUrl: z.string().trim().max(300).default(""),
    headline: z.string().trim().max(600).default(""),
    about: z.string().trim().max(6000).default(""),
    experience: z.string().trim().max(12000).default(""),
    skills: z.string().trim().max(2000).default(""),
    /** Only used by the paid report. */
    targetRole: z.string().trim().max(160).default(""),
    turnstileToken: z.string().trim().max(4000).optional(),
  })
  .strict()
  .refine(
    (v) => `${v.headline} ${v.about} ${v.experience} ${v.skills}`.trim().length >= 60,
    "Paste a bit more of your profile — headline, About and a few experience bullets.",
  );

export type LinkedInInput = z.infer<typeof linkedinInputSchema>;

const sectionFeedback = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string(),
  strengths: z.array(z.string()),
  fixes: z.array(z.string()),
  rewrite: z.string(),
});

/** Free tier: score plus headline, About and skills feedback. */
export const linkedinFreeReviewSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  headline: sectionFeedback,
  about: sectionFeedback,
  skills: z.object({
    score: z.number().min(0).max(100),
    verdict: z.string(),
    keep: z.array(z.string()),
    add: z.array(z.string()),
    fixes: z.array(z.string()),
  }),
});

export type LinkedInFreeReview = z.infer<typeof linkedinFreeReviewSchema>;

/** Paid tier: keyword alignment, industry advice and a rewritten experience section. */
export const linkedinProReviewSchema = z.object({
  keywordAlignment: z.object({
    score: z.number().min(0).max(100),
    present: z.array(z.string()),
    missing: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  industrySuggestions: z.array(z.string()),
  aboutRewrite: z.string(),
  experienceRewrite: z.array(
    z.object({
      heading: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

export type LinkedInProReview = z.infer<typeof linkedinProReviewSchema>;
