import { buildResumePdf } from "./resume-pdf";
import {
  splitLines,
  splitList,
  type PolishedResume,
  type ResumeDraft,
} from "./resume-builder-schema";
import type { TailoredResume } from "./tailor-schema";

/**
 * Maps the builder's draft plus (optional) AI-polished copy onto the same
 * ATS-safe PDF renderer the tailoring flow uses, so both outputs parse
 * identically. The template only changes which extra sections appear.
 */
export function toResumeShape(draft: ResumeDraft, polished: PolishedResume | null): TailoredResume {
  const base = polished;

  const contacts = [
    draft.location,
    draft.phone,
    draft.email,
    draft.linkedin,
    draft.portfolio,
  ].filter(Boolean);

  const experience = (
    base?.experience?.length
      ? base.experience
      : draft.experience
          .filter((item) => item.role || item.company)
          .map((item) => ({
            role: item.role,
            company: item.company,
            location: item.location,
            dates: item.dates,
            bullets: splitLines(item.details),
          }))
  ).map((item) => ({
    role: item.role,
    company: item.company,
    context: null,
    location: item.location || null,
    dates: item.dates || null,
    bullets: item.bullets ?? [],
  }));

  const projects = (
    base?.projects?.length
      ? base.projects
      : draft.projects
          .filter((item) => item.name)
          .map((item) => ({ name: item.name, description: "", bullets: splitLines(item.details) }))
  ).map((item) => ({
    name: item.name,
    description: item.description ?? "",
    bullets: item.bullets ?? [],
  }));

  const additionalSections: TailoredResume["additionalSections"] = [];

  if (draft.languages) {
    additionalSections.push({ title: "Languages", items: splitList(draft.languages) });
  }

  if (draft.template === "india") {
    const personal = [
      draft.dateOfBirth ? `Date of birth: ${draft.dateOfBirth}` : null,
      draft.fatherName ? `Father's name: ${draft.fatherName}` : null,
    ].filter(Boolean) as string[];
    if (personal.length) additionalSections.push({ title: "Personal Details", items: personal });
  } else if (draft.workAuthorization) {
    additionalSections.push({
      title: "Work Authorisation",
      items: [draft.workAuthorization],
    });
  }

  return {
    name: draft.fullName || "Resume",
    headline: base?.headline || draft.targetRole || "",
    contacts,
    summary: base?.summary || draft.summary || "",
    skills: base?.skills?.length ? base.skills : splitList(draft.skills),
    skillGroups: [],
    keyAchievements: base?.keyAchievements ?? [],
    experience,
    projects,
    education: draft.education
      .filter((item) => item.credential || item.institution)
      .map((item) => ({
        credential: [item.credential, item.score].filter(Boolean).join(" — "),
        institution: item.institution,
        dates: item.dates || null,
      })),
    certifications: splitLines(draft.certifications),
    additionalSections,
    coverLetter: "",
    matchedKeywords: [],
    missingKeywords: [],
    matchScore: 0,
    scoreBreakdown: null,
    consistencyFlags: [],
    regionAdaptations: [],
    fitWarning: null,
    atsScore: 95,
    tips: base?.tips ?? [],
  };
}

export async function buildBuilderResumePdf(draft: ResumeDraft, polished: PolishedResume | null) {
  return buildResumePdf(toResumeShape(draft, polished));
}
