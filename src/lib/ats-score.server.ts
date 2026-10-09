// ATS readiness: a number counted from the finished resume, not guessed by the AI.
// Same formula for every plan and model. 30 keyword coverage, 15 keyword placement,
// 20 structure and headings, 20 parse hygiene, 15 title and content signals.
// Hard cap 60 when there is no email or no experience section.
import type { TailoredResume } from "@/lib/tailor-schema";

const STOP = new Set(
  (
    "the and for with that this from will have has are you your our their they them who whom what when where which while into onto over under about " +
    "within across per via etc able ability strong proven required requirements preferred plus minimum years year experience experienced work working " +
    "team teams role roles job position candidate candidates company looking seeking join responsible responsibilities including include includes " +
    "good great excellent best new use using used well skills skill knowledge understanding understand must should can may also other more most " +
    "such any all each both either not only own high level senior junior full time part day days month months salary benefits apply ideal " +
    "environment fast paced passion passionate drive driven results result based help support ensure make making take taking get getting need needs " +
    "hiring location office email resume contact application process offer offers competitive growth opportunity opportunities hungry young aggressive"
  ).split(/\s+/),
);

function stem(w: string): string {
  return w.replace(/(ing|ed|es|s)$/i, (m) => (w.length - m.length >= 4 ? "" : m));
}
function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.]*[a-z0-9+#]|[a-z]/g) ?? [])
    .filter((t) => t.length >= 3 && !STOP.has(t))
    .map(stem);
}

export type AtsReadiness = { score: number; parts: Record<string, number>; topFix: string };

export function computeAtsReadiness(r: TailoredResume, jobDescription: string): AtsReadiness {
  const bullets = [
    ...r.experience.flatMap((e) => e.bullets),
    ...r.projects.flatMap((p) => p.bullets),
  ];
  const skillsText = [...r.skills, ...r.skillGroups.flatMap((g) => g.items)].join(" ");
  const proseText = [r.headline, r.summary, ...bullets, ...r.keyAchievements].join(" ");
  const allText = `${skillsText} ${proseText}`;

  // Job terms: unique stems, weighted by how often the posting repeats them.
  const jdTokens = tokens(jobDescription);
  const freq = new Map<string, number>();
  for (const t of jdTokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  const terms = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t);
  const have = new Set(tokens(allText));
  const haveSkills = new Set(tokens(skillsText));
  const haveProse = new Set(tokens(proseText));
  const matched = terms.filter((t) => have.has(t));

  // 30: coverage, full marks at 70% of the posting's main terms. Very short postings
  // (under 12 usable terms) are scaled gently so a one-line ad cannot decide the score.
  const cov = terms.length ? matched.length / terms.length : 0.7;
  const coverageRaw = Math.min(1, cov / 0.7);
  const shortAd = terms.length < 12 ? 0.5 + 0.5 * (terms.length / 12) : 1;
  const kc = Math.round(30 * (1 - (1 - coverageRaw) * shortAd));

  // 15: placement. A matched term counts fully when it sits in Skills AND in a bullet or the summary.
  const both = matched.filter((t) => haveSkills.has(t) && haveProse.has(t)).length;
  const kp = matched.length ? Math.round(15 * Math.min(1, both / Math.max(1, matched.length * 0.6))) : 8;

  // 20: structure and headings. 4 points each for contacts, summary, skills, experience, education.
  const sections = [r.contacts.length > 0, r.summary.trim().length > 0, r.skills.length > 0, r.experience.length > 0, r.education.length > 0];
  const st = sections.filter(Boolean).length * 4;

  // 20: parse hygiene.
  const contactText = r.contacts.join(" ");
  const hasEmail = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(contactText);
  const hasPhone = /\+?\d[\d\s().-]{7,}/.test(contactText);
  const datesOk = r.experience.length > 0 && r.experience.every((e) => !!e.dates && /(19|20)\d{2}/.test(e.dates));
  const shortBullets = bullets.length > 0 && bullets.filter((b) => b.trim().split(/\s+/).length <= 35).length / bullets.length >= 0.9;
  const noOddChars = !/[\u2022\u25cf\u25a0\u2756\u27a4\u2192\uf0b7]/.test(allText) && !/\t|\|{2,}/.test(allText);
  const ph = (hasEmail ? 6 : 0) + (hasPhone ? 3 : 0) + (datesOk ? 5 : 0) + (shortBullets ? 3 : 0) + (noOddChars ? 3 : 0);

  // 15: title and content signals.
  const jdTop = new Set([...terms].slice(0, 15));
  const titleTokens = tokens(`${r.headline} ${r.experience[0]?.role ?? ""}`);
  const titleHit = titleTokens.some((t) => jdTop.has(t)) ? 8 : titleTokens.some((t) => freq.has(t)) ? 5 : 0;
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const numShare = bullets.length ? withNumbers / bullets.length : 0;
  const tc = titleHit + Math.round(7 * Math.min(1, numShare / 0.5));

  let score = kc + kp + st + ph + tc;
  const hasExperience = r.experience.length > 0 && r.experience.some((e) => e.bullets.length > 0);
  if (!hasEmail || !hasExperience) score = Math.min(score, 60);
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Top fix: the part furthest below its maximum, in plain words.
  const gaps: Array<[number, string]> = [
    [(30 - kc) / 30, "Add more of the job ad's own words you can honestly claim, in your Skills and in a bullet."],
    [(15 - kp) / 15, "Put the key skills from the job ad in both your Skills list and an experience bullet."],
    [(20 - st) / 20, "Add the missing standard section (summary, skills, experience or education) so ATS can read it."],
    [hasEmail ? (20 - ph) / 20 : 1, hasEmail ? "Check dates, phone and plain formatting: ATS needs a phone, clear date ranges and short bullets." : "Add an email address to your contact line, or ATS may reject the resume."],
    [(15 - tc) / 15, "Match your headline to the job title and add numbers (results, volumes, percentages) to more bullets."],
  ];
  gaps.sort((a, b) => b[0] - a[0]);
  const topFix = gaps[0][0] > 0.15 ? gaps[0][1] : "";
  return { score, parts: { keywordCoverage: kc, keywordPlacement: kp, structure: st, parseHygiene: ph, titleContent: tc }, topFix };
}
