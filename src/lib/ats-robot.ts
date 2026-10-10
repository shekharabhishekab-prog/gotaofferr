/**
 * Robot view (Phase 1.9 step 3). Pure functions, no imports, no network.
 * Shows what a simple ATS parser would pull out of the resume text:
 * the text itself plus guessed fields. It is a heuristic, not a vendor parser.
 * It never adds or invents anything: a field it cannot find stays empty.
 */
export type RobotView = {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  links: string[];
  sections: { label: string; found: boolean }[];
  roles: string[];
  education: string[];
  skills: string[];
  skillCount: number;
  warnings: string[];
  text: string;
  chars: number;
  truncated: boolean;
};

const SECTIONS: [string, string[]][] = [
  ["Summary", ["summary", "professional summary", "profile", "objective", "career objective", "about me"]],
  ["Experience", ["experience", "work experience", "professional experience", "employment", "work history", "internships"]],
  ["Education", ["education", "academic background", "qualifications", "academics"]],
  ["Skills", ["skills", "core skills", "technical skills", "key skills", "skills and tools"]],
  ["Projects", ["projects", "key projects", "personal projects"]],
  ["Certifications", ["certifications", "certificates", "licenses"]],
  ["Languages", ["languages"]],
];

const DATE_RANGE =
  /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}|present|current|now)\b/i;
const DEGREE = /\b(bba|bbm|bms|bachelor|master|b\.?\s?tech|m\.?\s?tech|b\.?\s?sc|m\.?\s?sc|b\.?\s?a\b|m\.?\s?a\b|b\.?\s?e\b|mba|ph\.?d|diploma|degree|b\.?\s?com|m\.?\s?com|bca|mca|associate)\b/i;

function headingKey(raw: string): string | null {
  const l = raw.trim().replace(/[:\-–—_*#]+$/g, "").replace(/^[#*\s]+/, "").toLowerCase();
  if (!l || l.length > 40) return null;
  for (const [label, names] of SECTIONS) if (names.includes(l)) return label;
  return null;
}

export function robotView(resumeText: string): RobotView {
  const text = (resumeText ?? "").replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const warnings: string[] = [];

  const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] ?? null;
  let phone: string | null = null;
  for (const line of lines) {
    const c = (line.match(/\+?\d[\d ().-]{7,}\d/g) ?? []).find((v) => {
      const d = v.replace(/\D/g, "");
      return d.length >= 10 && d.length <= 15 && !/\b(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}\b/.test(v);
    });
    if (c) { phone = c.trim(); break; }
  }

  const head = lines.slice(0, 8);
  let name: string | null = null;
  for (const l of head.slice(0, 5)) {
    if (/[@\d|]/.test(l) || headingKey(l)) continue;
    const w = l.split(/\s+/);
    if (w.length >= 2 && w.length <= 4 && w.every((x) => /^[A-Za-z][A-Za-z.'’-]*$/.test(x))) { name = l; break; }
  }
  let location: string | null = null;
  for (const l of head) {
    const m = l.match(/\b[A-Z][A-Za-z.]+(?: [A-Z][A-Za-z.]+)*,\s*(?:[A-Z]{2}\b|[A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)*)/);
    if (m && !/@/.test(m[0])) { location = m[0]; break; }
  }
  const links = [...new Set(text.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in|github\.com|behance\.net|dribbble\.com)\/[A-Za-z0-9_\-./%]+/gi) ?? [])].slice(0, 4);

  const present = new Set<string>();
  const secLines: Record<string, string[]> = {};
  let cur: string | null = null;
  for (const l of lines) {
    const k = headingKey(l);
    if (k) { present.add(k); cur = k; secLines[k] = secLines[k] ?? []; continue; }
    if (cur) secLines[cur].push(l);
  }
  const sections = SECTIONS.map(([label]) => ({ label, found: present.has(label) }));

  const roleSrc = (secLines["Experience"] ?? []).length ? secLines["Experience"] : lines;
  const roles = roleSrc.filter((l) => DATE_RANGE.test(l) && l.length < 160).map((l) => l.slice(0, 90)).slice(0, 6);
  const eduAll = secLines["Education"] ?? [];
  const eduDeg = eduAll.filter((l) => DEGREE.test(l));
  const education = (eduDeg.length ? eduDeg : eduAll.slice(0, 2)).map((l) => l.slice(0, 90)).slice(0, 3);
  const skillAll = (secLines["Skills"] ?? [])
    .flatMap((l) => l.replace(/^[•·▪●◦*\-–]\s*/, "").replace(/^[^:,;|]{2,40}:\s*/, "").split(/[,;|•·]/))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);
  const skills = skillAll.slice(0, 14);

  const avgLen = lines.length ? lines.reduce((s, l) => s + l.length, 0) / lines.length : 0;
  if (text.trim().length < 120) warnings.push("Almost no text came out. This looks like a scanned or image-only file. A robot would see an empty page.");
  if (/(?:\b[A-Za-z] ){5,}[A-Za-z]\b/.test(text)) warnings.push("Letters are spaced apart (like S k i l l s). A robot may read them as separate letters, not words.");
  if (/[\uFFFD\uE000-\uF8FF]/.test(text)) warnings.push("Some symbols did not decode and show as boxes or odd marks. A robot may drop or garble them.");
  if (/[\uFB00-\uFB06]/.test(text)) warnings.push("Special joined letters (like fi) were found. Some robots cannot match words that contain them.");
  if (lines.length > 6 && avgLen > 110) warnings.push("Very long lines. Two columns may have been read straight across, mixing the text.");
  if (!name && text.trim().length >= 120) warnings.push("The robot could not find your name at the top. Put it alone on the first line.");

  const MAX = 2400;
  const cleaned = text.split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return {
    name, email, phone, location, links, sections, roles, education, skills, skillCount: skillAll.length,
    warnings, text: cleaned.slice(0, MAX), chars: cleaned.length, truncated: cleaned.length > MAX,
  };
}
