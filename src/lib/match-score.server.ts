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
    "across cross make making take taking get getting need needs one two three four five six seven eight nine ten " +
    "linkedin indeed naukri seek glassdoor easy applicants applicant applied promoted sponsored reposted ago week weeks remote hybrid onsite employment type seniority " +
    "industries function show more less hiring urgently immediate joiner joiners vacancy vacancies openings opening location locations office"
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
const FULL_COVERAGE = 0.7;

// A short or thin ad has few terms, so one missed word swings the score a lot. Pull the
// coverage gently toward a neutral 0.75 when the ad has fewer than 40 usable terms.
function shrinkShort(value: number, terms: number): number {
  const FULL = 40;
  if (terms >= FULL) return value;
  return (value * terms + 0.75 * (FULL - terms)) / FULL;
}

export function computeMatchScore(
  input: { jobDescription: string; role?: string; resume: string },
  r: TailoredResume,
): { score: number; breakdown: NonNullable<TailoredResume["scoreBreakdown"]> } {
  const jd = termSet(cleanJobDescription(input.jobDescription));
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

  const kw = shrinkShort(Math.min(1, coverage(jd, finalText) / FULL_COVERAGE), jd.size);
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

  const rel = shrinkShort(Math.min(1, coverage(jd, `${bullets.join(" ")} ${r.summary} ${(r.skills ?? []).join(" ")}`) / FULL_COVERAGE), jd.size);
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

// ---- Job ad cleaner ----
// Cleans a pasted job ad before its terms are counted. Real postings (LinkedIn, Naukri,
// Seek, Indeed) carry a company blurb, benefits, apply-now text and site chrome that are
// not requirements. Dropping them stops the score from rewarding or punishing the
// candidate for words the job itself never asks for. Falls back to the raw text when the
// cleaned version would be too short to judge.

const SKIP_HEADER =
  /^\s*(?:[#*\-•✅✔️]*\s*)?(about\s+(?:us|the\s+company|our\s+company|\w+(?:\s+\w+){0,3})|who\s+we\s+are|company\s+overview|our\s+(?:mission|story|culture|values)|why\s+(?:join|work)[^:]*|what\s+we\s+offer|we\s+offer|benefits?(?:\s+and\s+perks)?|perks(?:\s+and\s+benefits)?|compensation(?:\s+and\s+benefits)?|how\s+to\s+apply|application\s+process|apply\s+now|equal\s+opportunity[^:]*|diversity[^:]*|about\s+the\s+team|life\s+at\s+\w+|what\s+we\s+do|office\s+location|location)\s*:?\s*$/i;
const KEEP_HEADER =
  /^\s*(?:[#*\-•✅✔️]*\s*)?(requirements?|qualifications?|key\s+responsibilit\w+|responsibilit\w+|your\s+role|the\s+role|what\s+you(?:'|’)?ll\s+do|what\s+you\s+will\s+do|what\s+you(?:'|’)?ll\s+bring|who\s+should\s+apply\??|skills?(?:\s+required)?|key\s+skills|must[-\s]have[^:]*|nice\s+to\s+have|preferred[^:]*|minimum\s+qualifications|your\s+profile|about\s+you|you\s+have|duties|job\s+description|the\s+opportunity|kpis?[^:]*)\s*:?\s*$/i;
const NOISE_LINE =
  /(apply\s+now|easy\s+apply|send\s+(?:your\s+)?(?:resume|cv)|share\s+(?:your\s+)?(?:updated\s+)?(?:resume|cv)|email\s+(?:your\s+)?(?:resume|cv)|interested\s+candidates|equal\s+opportunity|we\s+are\s+an?\s+equal|salary|ctc|lpa|per\s+annum|\bcompetitive\s+(?:salary|pay|package)|show\s+(?:more|less)|report\s+this\s+job|\d+\s+applicants?|promoted|actively\s+recruiting|seniority\s+level|employment\s+type|job\s+function|industries|posted\s+\d+|\d+\s+(?:day|week|month)s?\s+ago|^\s*(?:full|part)[-\s]time\s*$|^\s*(?:remote|hybrid|on-?site|in-office)\s*$|https?:\/\/|\[email)/i;

export function cleanJobDescription(raw: string): string {
  const lines = raw.split(/\r?\n/);
  let skipping = false;
  const kept: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (KEEP_HEADER.test(t)) {
      skipping = false;
      kept.push(t);
      continue;
    }
    if ((SKIP_HEADER.test(t) && t.length < 60) || (/^\s*[#*\-•✅✔️]*\s*about\s+(?:us|the\s+company|our\s+company)\b/i.test(t) && t.length < 90)) {
      skipping = true;
      continue;
    }
    if (skipping) continue;
    if (NOISE_LINE.test(t) && t.length < 140) continue;
    kept.push(t);
  }
  const cleaned = kept.join("\n");
  // Too little left (a very short or unusual ad): trust the raw text instead.
  return cleaned.split(/\s+/).filter(Boolean).length >= 25 ? cleaned : raw;
}
