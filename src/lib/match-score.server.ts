// One match-score formula for every plan and every model. The AI only writes the
// resume text; the number is counted here, so no plan scores lower just because
// a smaller model happened to estimate it lower.
import type { TailoredResume } from "@/lib/tailor-schema";

const STOP = new Set(
  (
    "the and for with that this from will have has are you your our their they them who whom what when where which while into onto over under about " +
    "within across per via etc able ability strong proven required requirements preferred plus minimum years year experience experienced work working " +
    "team teams role roles job position candidate candidates company looking seeking join responsible responsibilities including include includes " +
    "good great excellent best new use using used well skills skill knowledge understanding understand must should can may also other more most " +
    "such any all each both either not only own high level senior junior full time part day days month months salary benefits apply ideal " +
    "environment fast paced passion passionate drive driven results result based help support ensure manage managing develop developing build building " +
    "across cross make making take taking get getting need needs one two three four five six seven eight nine ten"
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

function termSet(text: string): Set<string> {
  return new Set(tokens(text));
}

function coverage(terms: Set<string>, text: string): number {
  if (!terms.size) return 0;
  const have = termSet(text);
  let hit = 0;
  for (const t of terms) if (have.has(t)) hit++;
  return hit / terms.size;
}

// Full coverage is never expected: a normal posting has filler words. 70% of the
// posting's own terms counts as a full keyword score.
const FULL_COVERAGE = 1.0;

export function computeMatchScore(
  input: { jobDescription: string; role?: string; resume: string },
  r: TailoredResume,
): { score: number; breakdown: NonNullable<TailoredResume["scoreBreakdown"]> } {
  const jd = termSet(input.jobDescription);
  const bullets = (r.experience ?? []).flatMap((e) => e.bullets ?? []);
  const finalText = [
    r.headline,
    r.summary,
    (r.skills ?? []).join(" "),
    (r.keyAchievements ?? []).join(" "),
    bullets.join(" "),
    (r.projects ?? []).map((p) => `${p.name} ${p.description} ${(p.bullets ?? []).join(" ")}`).join(" "),
    (r.certifications ?? []).join(" "),
  ].join(" ");

  const kw = Math.min(1, coverage(jd, finalText) / FULL_COVERAGE);
  const keywordMatch = Math.round(40 * kw);

  // No role typed: the posting itself usually opens with the job title.
  const roleText =
    input.role?.trim() || input.jobDescription.split(/\n| - | – | \| /)[0].slice(0, 80);
  const roleTerms = termSet(roleText);
  let titleAlignment = 10;
  if (roleTerms.size) {
    const own = termSet(`${r.headline} ${(r.experience ?? []).slice(0, 2).map((e) => e.role).join(" ")}`);
    let hit = 0;
    for (const t of roleTerms) if (own.has(t)) hit++;
    titleAlignment = Math.round(15 * (hit / roleTerms.size));
  }

  // The output is always one column with standard headings. Deduct only when the
  // SOURCE resume is table-like (lots of tabs or pipe-separated cells).
  const tableLines = input.resume.split("\n").filter((l) => !/@|https?:|linkedin|github/i.test(l) && (l.match(/\||\t/g) ?? []).length >= 3).length;
  const formatting = Math.max(12, 20 - Math.min(8, tableLines * 2));

  const rel = Math.min(1, coverage(jd, `${bullets.join(" ")} ${r.summary} ${(r.skills ?? []).join(" ")}`) / FULL_COVERAGE);
  const experienceRelevance = Math.round(15 * rel);

  const withNum = bullets.filter((b) => /\d/.test(b)).length;
  const quantifiedImpact = Math.round(10 * Math.min(1, bullets.length ? withNum / bullets.length / 0.6 : 0));

  const breakdown = { keywordMatch, titleAlignment, formatting, experienceRelevance, quantifiedImpact };
  const score = Math.max(
    0,
    Math.min(100, keywordMatch + titleAlignment + formatting + experienceRelevance + quantifiedImpact),
  );
  return { score, breakdown };
}
