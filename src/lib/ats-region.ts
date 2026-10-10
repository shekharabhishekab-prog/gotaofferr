/**
 * Region soft notes and hard-gap tag for the browser-only ATS checker.
 * Pure functions, no network, nothing stored. Both are heuristics and say so.
 * They never change the score number and never suggest adding skills.
 */
import { detectJobCountry } from "./region-detect";

export type RegionNote = { country: string; label: string; notes: string[] };

type Market = { label: string; pages: number; notes: string[] };

const NO_PHOTO = "Leave out photo, date of birth, age, marital status and nationality. Recruiters here discard resumes that carry them.";

// Kept in line with the tailor's market rules (resume-locale.server.ts).
const MARKETS: Record<string, Market> = {
  US: { label: "United States", pages: 2, notes: [NO_PHOTO, "One page is the norm under 10 years of experience, two at most. Use Mon YYYY dates."] },
  CA: { label: "Canada", pages: 2, notes: [NO_PHOTO, "One to two pages. City and province are enough for the address."] },
  GB: { label: "United Kingdom", pages: 2, notes: [NO_PHOTO, "Called a CV here. Two pages is standard. Open with a short personal statement."] },
  IE: { label: "Ireland", pages: 2, notes: [NO_PHOTO, "CV format, up to two pages."] },
  AU: { label: "Australia", pages: 3, notes: [NO_PHOTO, "Two to three pages is normal. Name visa or work rights plainly if you have them."] },
  NZ: { label: "New Zealand", pages: 2, notes: [NO_PHOTO, "Two-page CV. Name visa or work rights plainly if you have them."] },
  NL: { label: "Netherlands", pages: 2, notes: [NO_PHOTO, "Two-page CV, direct and factual."] },
  DE: { label: "Germany", pages: 2, notes: ["Use complete, gap-free dates (MM/YYYY - MM/YYYY). Add a photo or personal data only if you already include them; they are not required.", "Factual wording and language levels (for example German B2) help."] },
  FR: { label: "France", pages: 2, notes: ["One page for most people, two for senior profiles. List language levels."] },
  IN: { label: "India", pages: 2, notes: ["One to two pages. Put education up front with institution and year.", "Skip photo, date of birth and father's name unless the employer asks. State notice period only if it is true."] },
  SG: { label: "Singapore", pages: 2, notes: ["Two pages is fine. Say your work-pass status plainly if it applies."] },
  ZA: { label: "South Africa", pages: 3, notes: ["Two to three page CV. Keep qualification names as written."] },
};
const GULF = ["AE", "SA", "QA", "KW", "BH", "OM"];
for (const c of GULF) MARKETS[c] = { label: c === "AE" ? "United Arab Emirates" : c, pages: 2, notes: ["Two-page CV, formal tone, full month names in dates.", "A short personal details block (nationality, visa status) is normal here, but only add what is true."] };

/** Soft, JD-driven notes. Returns null when the job post gives no country clue. */
export function regionNotes(jobDescription: string, company: string, wordCount: number): RegionNote | null {
  const code = detectJobCountry(jobDescription, company);
  if (!code) return null;
  const m = MARKETS[code];
  if (!m) return null;
  const notes = [...m.notes];
  // About 500 words per page. Soft hint only: we cannot count pages from text.
  if (wordCount > m.pages * 600) notes.push(`Your resume is about ${wordCount} words. In ${m.label} that is usually more than ${m.pages} pages. Check the page count before you apply.`);
  return { country: code, label: m.label, notes };
}

// ---- Hard gap -------------------------------------------------------------

const SECTORS: Record<string, { label: string; words: string[] }> = {
  tech: { label: "software and IT", words: "software developer developers programming code coding api apis backend frontend fullstack devops cloud aws azure docker kubernetes python java javascript typescript react node sql database microservices git agile scrum".split(" ") },
  health: { label: "healthcare", words: "patient patients clinical clinic nurse nursing hospital medical healthcare treatment diagnosis pharmacy physician surgical therapy care".split(" ") },
  finance: { label: "finance and accounting", words: "accounting accountant audit auditing tax financial finance bank banking investment ledger reconciliation treasury equity gaap budgeting payables receivables".split(" ") },
  marketing: { label: "marketing and sales", words: "sales marketing seo campaign campaigns brand leads crm advertising social media conversion funnel prospecting quota revenue".split(" ") },
  education: { label: "teaching and education", words: "teacher teaching curriculum students student classroom lecturer school lesson pedagogy tutoring syllabus".split(" ") },
  legal: { label: "legal", words: "legal attorney litigation contracts paralegal counsel lawyer statutes court compliance arbitration".split(" ") },
  hospitality: { label: "hospitality and food", words: "restaurant chef kitchen hotel guests menu catering hospitality bartender barista culinary housekeeping".split(" ") },
  operations: { label: "operations and logistics", words: "warehouse logistics inventory manufacturing procurement shipping fleet dispatch forklift assembly supply chain".split(" ") },
  construction: { label: "construction and engineering", words: "construction civil structural site contractor mechanical electrical plumbing hvac blueprint surveying welding".split(" ") },
};

function hits(text: string, list: string[]): number {
  const set = new Set(text.toLowerCase().match(/[a-z]+/g) ?? []);
  let n = 0;
  for (const w of list) if (set.has(w)) n++;
  return n;
}

const LINES = [
  "Swapping {a} for {b}? Bold move. The robot noticed, and so will the recruiter.",
  "The robot reads {a} on your side and {b} on theirs. Different planets.",
  "{a} resume, {b} job. Even the best formatting cannot bridge that.",
  "No keyword trick turns {a} into {b}. Good news: honest framing still can.",
];

export type HardGap = { bad: string; fix: string };

/** Warns when resume and job post clearly sit in different sectors. Heuristic, warn only. */
export function hardGap(resumeText: string, jobDescription: string): HardGap | null {
  if (!jobDescription || jobDescription.trim().length < 150) return null;
  const rows = Object.entries(SECTORS).map(([k, s]) => ({ k, label: s.label, r: hits(resumeText, s.words), j: hits(jobDescription, s.words) }));
  const job = [...rows].sort((a, b) => b.j - a.j)[0];
  const res = [...rows].sort((a, b) => b.r - a.r)[0];
  if (!job || !res || job.j < 4 || res.r < 4 || job.k === res.k) return null;
  const jobSideInResume = rows.find((x) => x.k === job.k)!.r;
  if (jobSideInResume > 1) return null;
  // A mixed job post (it also uses the resume's own sector words) is not a clear gap.
  const resSideInJob = rows.find((x) => x.k === res.k)!.j;
  if (resSideInJob >= 2) return null;
  const second = [...rows].filter((x) => x.k !== job.k).sort((a, b) => b.j - a.j)[0];
  if (second && job.j - second.j < 2) return null;
  const pick = (job.k.length + res.k.length + job.j + res.r) % LINES.length;
  return {
    bad: `Your resume reads as ${res.label}. The job reads as ${job.label}.`,
    fix: `${LINES[pick].replace("{a}", res.label).replace("{b}", job.label)} This is a real gap, not a wording problem. We will not fake it. If you still want the job, lead with the skills that carry over and be honest about the switch. (Heuristic check.)`,
  };
}
