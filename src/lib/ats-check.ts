/**
 * Built-in ATS checker (Phase 1.8 engine). Pure functions, no imports, no network.
 * Scores plain resume text 0-100 with transparent heuristic checks and fix hints.
 * This is not a parser test, an ATS vendor score, or a promise of hiring success.
 * It never adds or invents skills: keyword hints only list words that are in the
 * job description and missing from the resume, as a suggestion to the owner.
 */
export type AtsCheck = { id: string; label: string; points: number; max: number; hint: string | null };
export type AtsResult = {
  score: number;
  band: "strong" | "good" | "needs work" | "weak";
  checks: AtsCheck[];
  missingKeywords: string[];
  hints: string[];
};

const ACTION_VERBS = new Set(
  ("led managed built created designed developed delivered improved increased reduced launched owned drove grew " +
    "implemented analysed analyzed optimised optimized automated coordinated negotiated mentored trained wrote " +
    "organised organized streamlined migrated resolved shipped scaled saved generated planned executed supported " +
    "established maintained achieved won closed handled produced introduced rebuilt redesigned cut boosted " +
    "formulated presented reviewed tested deployed configured monitored collaborated initiated spearheaded").split(" "),
);
const STOP = new Set(
  ("the a an and or of to in for with on at by from as is are be will you your we our this that it their they " +
    "have has had not but if can able work working experience years year role team strong good excellent " +
    "required requirements responsibilities job position candidate looking join company must plus also " +
    "ability skills knowledge using use etc including such other more than into across within about").split(" "),
);

const SECTION_ALIASES: Record<string, string[]> = {
  experience: ["experience", "work experience", "professional experience", "employment", "work history", "internships"],
  education: ["education", "academic background", "qualifications", "academics"],
  skills: ["skills", "core skills", "technical skills", "key skills", "skills and tools"],
  summary: ["summary", "professional summary", "profile", "objective", "career objective", "about me"],
};

function words(s: string): string[] {
  return s.toLowerCase().match(/[a-z]+(?:[+#]+|[.\-][a-z]+)*/g) ?? [];
}

function sectionsFound(lines: string[]): Set<string> {
  const found = new Set<string>();
  for (const raw of lines) {
    const l = raw.trim().replace(/[:\-–—_*#]+$/g, "").replace(/^[#*\s]+/, "").toLowerCase();
    if (!l || l.length > 40) continue;
    for (const [key, names] of Object.entries(SECTION_ALIASES)) if (names.includes(l)) found.add(key);
  }
  return found;
}

export function checkAts(resumeText: string, jobDescription?: string): AtsResult {
  const text = (resumeText ?? "").replace(/\r/g, "");
  const lines = text.split("\n");
  const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);
  const wc = words(text).length;
  const checks: AtsCheck[] = [];
  const add = (id: string, label: string, max: number, got: number, hint: string | null) =>
    checks.push({ id, label, max, points: Math.max(0, Math.min(max, Math.round(got * 10) / 10)), hint });

  // 1. Contact (10)
  const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const phone = nonEmpty.some((line) => {
    // Scan one line at a time: separate employment dates are not a phone number.
    const candidates = line.match(/\+?\d[\d ().-]{7,}\d/g) ?? [];
    return candidates.some((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15 && !/\b(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}\b/.test(value);
    });
  });
  add("contact", "Email and phone are present", 10, (email ? 5 : 0) + (phone ? 5 : 0),
    !email && !phone ? "Add an email address and a phone number at the top." : !email ? "Add an email address at the top." : !phone ? "Add a phone number at the top." : null);

  // 2. Sections (20)
  const found = sectionsFound(nonEmpty);
  const need = ["experience", "education", "skills"] as const;
  const have = need.filter((k) => found.has(k)).length;
  const secPts = (have / 3) * 15 + (found.has("summary") ? 5 : 0);
  const missing = need.filter((k) => !found.has(k));
  add("sections", "Standard section headings", 20, secPts,
    missing.length ? `Add clear headings ATS can read: ${missing.map((m) => m[0].toUpperCase() + m.slice(1)).join(", ")}.` : !found.has("summary") ? "Add a short Summary section at the top." : null);

  // 3. Bullets (10)
  const bullets = nonEmpty.filter((l) => /^[•·▪●◦*\-–]\s+\S/.test(l));
  const longBullets = bullets.filter((b) => words(b).length > 35).length;
  const bPts = bullets.length >= 4 ? (longBullets === 0 ? 10 : 6) : bullets.length >= 1 ? 5 : 0;
  add("bullets", "Experience written as short bullets", 10, bPts,
    bullets.length < 4 ? "Write your experience as short bullet points (3 to 5 per role)." : longBullets ? "Shorten bullets longer than about 35 words." : null);

  // 4. Numbers (15)
  const numBullets = bullets.filter((b) => /\d/.test(b)).length;
  const ratio = bullets.length ? numBullets / bullets.length : 0;
  add("numbers", "Results with numbers", 15, Math.min(1, ratio / 0.4) * 15,
    ratio < 0.4 ? "Add real numbers to more bullets (percent, amount, team size, time saved). Only use figures that are true." : null);

  // 5. Action verbs (10)
  const verbBullets = bullets.filter((b) => ACTION_VERBS.has(words(b.replace(/^[•·▪●◦*\-–]\s+/, ""))[0] ?? "")).length;
  const vr = bullets.length ? verbBullets / bullets.length : 0;
  add("verbs", "Bullets start with action verbs", 10, Math.min(1, vr / 0.6) * 10,
    vr < 0.6 ? "Start bullets with action verbs such as Led, Built, Improved, Delivered." : null);

  // 6. Length (10)
  let lenPts = 10;
  let lenHint: string | null = null;
  if (wc < 150) { lenPts = 2; lenHint = "The resume is very short. Add more detail on roles and results."; }
  else if (wc < 300) { lenPts = 6; lenHint = "The resume is a bit short. Aim for 300 to 900 words."; }
  else if (wc > 1100) { lenPts = 0; lenHint = "The resume is long. Trim it to the most relevant 900 words or less."; }
  else if (wc > 900) { lenPts = 4; lenHint = "The resume is slightly long. Trim older or less relevant details."; }
  add("length", "Sensible length", 10, lenPts, lenHint);

  // 7. Formatting hazards (10)
  let fmt = 10;
  const issues: string[] = [];
  const tableLines = nonEmpty.filter((line) => (line.match(/\|/g) ?? []).length >= 2 && !/@|https?:|\+?\d[\d ()-]{8,}/i.test(line));
  const hasTable = tableLines.length >= 2 || nonEmpty.some((line) => /\t.*\t/.test(line));
  if (hasTable) { fmt -= 8; issues.push("tables or columns"); }
  if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(text)) { fmt -= 3; issues.push("emoji or icons"); }
  if (/\[(image|photo|logo|graphic)\]/i.test(text)) { fmt -= 3; issues.push("images"); }
  add("format", "Plain, ATS-safe formatting", 10, fmt,
    issues.length ? `Remove ${issues.join(", ")}. Use a simple text layout for easier parsing.` : null);

  // 8. Dates (10)
  const dates = text.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(?:19|20)\d{2}\b|\b(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:19|20)\d{2}|present|current|now)\b/gi) ?? [];
  add("dates", "Dates on roles", 10, dates.length >= 2 ? 10 : dates.length === 1 ? 5 : 0,
    dates.length < 2 ? "Add start and end dates (for example Jan 2022 - Present) for your roles." : null);

  // 9. Keyword overlap with the job post (optional, 15 points). Not semantic fit.
  let missingKeywords: string[] = [];
    if (jobDescription && jobDescription.trim().length > 40) {
    const resumeSet = new Set(words(text));
    const freq = new Map<string, number>();
    for (const w of words(jobDescription)) if (w.length > 2 && !STOP.has(w)) freq.set(w, (freq.get(w) ?? 0) + 1);
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 20).map((e) => e[0]);
    missingKeywords = top.filter((w) => !resumeSet.has(w)).slice(0, 8);
    const hit = top.length ? (top.length - top.filter((w) => !resumeSet.has(w)).length) / top.length : 1;
    const kwMax = 15;
    add("keywords", "Matches the job description", kwMax, hit * kwMax,
      missingKeywords.length ? `Words from the job post that your resume does not use: ${missingKeywords.join(", ")}. Add only the ones that are true for you.` : null);
  }

  const max = checks.reduce((s, c) => s + c.max, 0);
  const got = checks.reduce((s, c) => s + c.points, 0);
  // Conservative caps keep a serious text warning from being hidden by other points.
  // These caps are product heuristics, not measured rules from an ATS vendor.
  let score = Math.round((got / max) * 100);
  if (hasTable) score = Math.min(score, 79);
  if (wc > 1100) score = Math.min(score, 79);
  else if (wc > 900) score = Math.min(score, 84);
  if (found.has("experience") && dates.length === 0) score = Math.min(score, 79);
  if (!email || !phone) score = Math.min(score, 84);
  if (wc === 0) score = 0;
  const band = score >= 85 ? "strong" : score >= 70 ? "good" : score >= 50 ? "needs work" : "weak";
  return { score, band, checks, missingKeywords, hints: checks.map((c) => c.hint).filter((h): h is string => !!h) };
}
