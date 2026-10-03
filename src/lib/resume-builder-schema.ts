import { z } from "zod";

/**
 * Two starting formats for building a resume from scratch:
 *  - "india"         : the format Indian recruiters and Naukri-style portals expect
 *  - "international" : the global/US-EU ATS format (no photo, no personal data)
 */
export const resumeTemplates = ["india", "international"] as const;
export type ResumeTemplate = (typeof resumeTemplates)[number];

export const templateLabels: Record<ResumeTemplate, string> = {
  india: "National (India)",
  international: "International (global ATS)",
};

const line = (max: number) => z.string().trim().max(max).default("");

export const builderExperienceSchema = z.object({
  role: line(120),
  company: line(120),
  location: line(120),
  dates: line(60),
  details: line(3000),
});

export const builderEducationSchema = z.object({
  credential: line(160),
  institution: line(160),
  dates: line(60),
  score: line(60),
});

export const builderProjectSchema = z.object({
  name: line(140),
  details: line(1200),
});

export const resumeDraftSchema = z
  .object({
    template: z.enum(resumeTemplates).default("international"),
    fullName: z.string().trim().min(2).max(120),
    targetRole: line(120),
    email: line(160),
    phone: line(40),
    location: line(120),
    linkedin: line(200),
    portfolio: line(200),
    summary: line(1500),
    skills: line(1200),
    experience: z.array(builderExperienceSchema).max(10).default([]),
    education: z.array(builderEducationSchema).max(6).default([]),
    projects: z.array(builderProjectSchema).max(6).default([]),
    certifications: line(800),
    languages: line(300),
    /** India-format only: still commonly listed on Indian resumes. */
    dateOfBirth: line(40),
    fatherName: line(120),
    /** International-format only: sponsorship / work-authorisation line. */
    workAuthorization: line(200),
  })
  .strict();

export type ResumeDraft = z.infer<typeof resumeDraftSchema>;

export const polishedResumeSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  keyAchievements: z.array(z.string()),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string().default(""),
      dates: z.string().default(""),
      bullets: z.array(z.string()),
    }),
  ),
  projects: z
    .array(z.object({ name: z.string(), description: z.string(), bullets: z.array(z.string()) }))
    .default([]),
  tips: z.array(z.string()).default([]),
});

export type PolishedResume = z.infer<typeof polishedResumeSchema>;

export function emptyDraft(template: ResumeTemplate = "international"): ResumeDraft {
  return {
    template,
    fullName: "",
    targetRole: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    skills: "",
    experience: [{ role: "", company: "", location: "", dates: "", details: "" }],
    education: [{ credential: "", institution: "", dates: "", score: "" }],
    projects: [],
    certifications: "",
    languages: "",
    dateOfBirth: "",
    fatherName: "",
    workAuthorization: "",
  };
}

export function splitLines(value: string): string[] {
  return value
    .split(/\r?\n|(?<=[.;])\s{2,}/)
    .map((item) => item.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
}

export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
