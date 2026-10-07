import { z } from "zod";

const experienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  context: z.string().nullable().default(null),
  location: z.string().nullable(),
  dates: z.string().nullable(),
  bullets: z.array(z.string()),
});

export const tailoredResumeSchema = z.object({
  name: z.string(),
  headline: z.string(),
  contacts: z.array(z.string()),
  summary: z.string(),
  skills: z.array(z.string()),
  skillGroups: z
    .array(z.object({ label: z.string(), items: z.array(z.string()) }))
    .default([]),
  keyAchievements: z.array(z.string()),
  experience: z.array(experienceSchema),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      credential: z.string(),
      institution: z.string(),
      dates: z.string().nullable(),
    }),
  ),
  certifications: z.array(z.string()),
  additionalSections: z.array(
    z.object({
      title: z.string(),
      items: z.array(z.string()),
    }),
  ),
  coverLetter: z.string(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  matchScore: z.number(),
  /**
   * Weighted breakdown behind matchScore so the score is auditable instead of
   * a black-box number: keywords 40, title 15, formatting 20, relevance 15,
   * quantified impact 10.
   */
  scoreBreakdown: z
    .object({
      keywordMatch: z.number().min(0).max(40).default(0),
      titleAlignment: z.number().min(0).max(15).default(0),
      formatting: z.number().min(0).max(20).default(0),
      experienceRelevance: z.number().min(0).max(15).default(0),
      quantifiedImpact: z.number().min(0).max(10).default(0),
    })
    .nullable()
    .default(null),
  /** Date-math or conflicting-number problems found in the source resume. */
  consistencyFlags: z.array(z.string()).default([]),
  /** What was changed for the hiring market (currency, spelling, personal info). */
  regionAdaptations: z.array(z.string()).default([]),
  /** Honest verdict when the candidate is a genuinely poor fit for the role. */
  fitWarning: z.string().nullable().default(null),
  atsScore: z.number().min(0).max(100).default(95),
  tips: z.array(z.string()),
});

export type TailoredResume = z.infer<typeof tailoredResumeSchema>;

export const tailorInputSchema = z
  .object({
    resume: z.string().trim().min(30).max(30000),
    jobDescription: z.string().trim().min(20).max(30000),
    company: z.string().trim().max(120).optional(),
    role: z.string().trim().max(120).optional(),
    tone: z.enum(["professional", "confident", "friendly", "concise", "impact"]).optional(),
  })
  .strict();


export type TailorInput = z.infer<typeof tailorInputSchema>;

/** Free plan allowance per calendar month. */
export const FREE_MONTHLY_LIMIT = 5;

/** Starter paid plan allowance per calendar month. */
export const STARTER_MONTHLY_LIMIT = 20;

/** Job Hunt paid plan allowance per calendar month. */
export const JOB_HUNT_MONTHLY_LIMIT = 129;

/** Career Pro paid plan allowance per calendar month. */
export const CAREER_PRO_MONTHLY_LIMIT = 199;
