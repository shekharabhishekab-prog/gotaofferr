import type { jsPDF as JsPdfDocument } from "jspdf";
import type { TailoredResume } from "./tailor.functions";

/**
 * jsPDF's built-in Helvetica is WinAnsi-encoded and cannot draw the rupee sign
 * or other non-Latin-1 glyphs, so they print as garbage. Swap them for safe
 * ASCII equivalents before anything reaches the page.
 */
const CHAR_FIXES: [RegExp, string][] = [
  [/\u20B9/g, "Rs."],
  [/[\u2018\u2019\u02BC]/g, "'"],
  [/[\u201C\u201D]/g, '"'],
  [/[\u2013\u2014]/g, "-"],
  [/\u2026/g, "..."],
  [/\u00A0/g, " "],
];

function safe(value: string) {
  let out = value ?? "";
  for (const [pattern, replacement] of CHAR_FIXES) out = out.replace(pattern, replacement);
  // Drop anything still outside Latin-1, which the core fonts cannot render.
  return out.replace(/[^\x00-\xFF\u2022\u20AC]/g, "");
}

const M = 48;
const W = 595.28;
const H = 841.89;
const RIGHT = W - M;
const LINE = 13;

class Doc {
  doc: JsPdfDocument;
  y = M;

  constructor(doc: JsPdfDocument) {
    this.doc = doc;
  }

  space(n: number) {
    this.y += n;
  }

  need(h: number) {
    if (this.y + h > H - M) {
      this.doc.addPage();
      this.y = M;
    }
  }

  text(
    value: string,
    opts: { size?: number; style?: "normal" | "bold" | "italic"; color?: [number, number, number]; indent?: number; gap?: number } = {},
  ) {
    const { size = 10, style = "normal", color = [30, 35, 45], indent = 0, gap = 0 } = opts;
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
    const lines: string[] = this.doc.splitTextToSize(safe(value), RIGHT - M - indent);
    const lh = size * 1.28;
    for (const line of lines) {
      this.need(lh);
      this.doc.text(line, M + indent, this.y + size * 0.85);
      this.y += lh;
    }
    this.y += gap;
  }

  heading(label: string) {
    this.need(34);
    this.space(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10.5);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(safe(label.toUpperCase()), M, this.y + 8);
    this.y += 18;
  }

  rowed(left: string, right: string, bold = true) {
    const size = 10.5;
    this.need(16);
    this.doc.setFontSize(size);
    this.doc.setTextColor(20, 25, 35);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    const safeRight = safe(right);
    const rightWidth = safeRight ? this.doc.getTextWidth(safeRight) + 8 : 0;
    // Wrap instead of clipping: a truncated title ("... Craftworkers Welfare")
    // breaks both human reading and ATS employer matching.
    const lines: string[] = this.doc.splitTextToSize(safe(left), RIGHT - M - rightWidth);
    const lh = size * 1.3;
    lines.forEach((line, i) => {
      this.need(lh);
      this.doc.setFont("helvetica", bold ? "bold" : "normal");
      this.doc.setFontSize(size);
      this.doc.setTextColor(20, 25, 35);
      this.doc.text(line, M, this.y + size * 0.85);
      if (i === 0 && safeRight) {
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9);
        this.doc.setTextColor(105, 112, 125);
        this.doc.text(safeRight, RIGHT, this.y + size * 0.85, { align: "right" });
      }
      this.y += lh;
    });
  }

  bullets(items: string[]) {
    for (const item of items) {
      const size = 9.7;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(size);
      const lines: string[] = this.doc.splitTextToSize(safe(item), RIGHT - M - 14);
      const lh = size * 1.32;
      lines.forEach((line, i) => {
        this.need(lh);
        this.doc.setTextColor(45, 52, 64);
        if (i === 0) this.doc.text("•", M + 2, this.y + size * 0.85);
        this.doc.text(line, M + 14, this.y + size * 0.85);
        this.y += lh;
      });
      this.y += 2;
    }
  }
}

async function createDoc() {
  const { jsPDF } = await import("jspdf");
  return new Doc(new jsPDF({ unit: "pt", format: "a4" }));
}

export async function buildResumePdf(r: TailoredResume) {
  const d = await createDoc();
  d.doc.setProperties({ title: `${r.name || "Resume"} - Resume`, subject: "Resume", creator: "GotaOfferr" });

  d.text(r.name || "Resume", { size: 21, style: "bold", color: [0, 0, 0] });
  if (r.headline) d.text(r.headline, { size: 11, color: [80, 90, 105] });
  r.contacts?.forEach((c) => { if (c) d.text(c, { size: 9, color: [105, 112, 125] }); });
  d.space(4);

  if (r.summary || r.keyAchievements?.length) {
    d.heading("Professional Summary");
    if (r.summary) d.text(r.summary, { size: 9.8 });
    if (r.keyAchievements?.length) d.bullets(r.keyAchievements);
  }

  const groups = (r.skillGroups ?? []).filter((g) => g.label && g.items?.length);
  if (r.skills?.length || groups.length) {
    d.heading("Skills");
    if (!groups.length) {
      d.text((r.skills ?? []).join(", "), { size: 9.8 });
    } else {
      // One merged block: the groups carry the skills; flat skills they miss are added once.
      const inGroups = new Set(groups.flatMap((g) => g.items.map((i) => i.trim().toLowerCase())));
      const extra = (r.skills ?? []).filter((x) => !inGroups.has(x.trim().toLowerCase()));
      groups.forEach((g) => d.text(`${g.label}: ${g.items.join(", ")}`, { size: 9.5 }));
      if (extra.length) d.text(`Other: ${extra.join(", ")}`, { size: 9.5 });
    }
  }

  if (r.experience?.length) {
    d.heading("Experience");
    r.experience.forEach((e, i) => {
      if (i > 0) d.space(6);
      d.rowed(`${e.role}${e.company ? " — " + e.company : ""}`, e.dates || "");
      const ctx = (e.context ?? "").trim();
      const loc = (e.location ?? "").trim();
      const locKnown = !!loc && ctx.toLowerCase().includes(loc.toLowerCase().split(",")[0].trim());
      const sub = [ctx, locKnown ? "" : loc].filter(Boolean).join("  |  ");
      if (sub) d.text(sub, { size: 9, style: "italic", color: [120, 126, 138] });
      d.bullets(e.bullets || []);
    });
  }


  if (r.projects?.length) {
    d.heading("Projects");
    r.projects.forEach((p, i) => {
      if (i > 0) d.space(5);
      d.rowed(p.name, "");
      if (p.description) d.text(p.description, { size: 9.5, color: [70, 78, 90] });
      d.bullets(p.bullets || []);
    });
  }

  if (r.education?.length) {
    d.heading("Education");
    r.education.forEach((e) => {
      d.rowed(e.credential, e.dates || "");
      if (e.institution) d.text(e.institution, { size: 9.5, color: [90, 98, 110] });
    });
  }

  if (r.certifications?.length) {
    d.heading("Certifications");
    d.bullets(r.certifications);
  }



  if (r.additionalSections?.length) {
    r.additionalSections.forEach((section) => {
      if (!section.title || !section.items.length) return;
      d.heading(section.title);
      d.bullets(section.items);
    });
  }

  return d.doc;
}

export async function buildCoverLetterPdf(r: TailoredResume, company?: string, role?: string) {
  const d = await createDoc();
  d.text(r.name || "Cover Letter", { size: 18, style: "bold", color: [17, 51, 92] });
  r.contacts?.forEach((c) => { if (c) d.text(c, { size: 9, color: [105, 112, 125] }); });
  d.space(10);
  const target = [role, company].filter(Boolean).join(" — ");
  if (target) d.text(`Re: ${target}`, { size: 10.5, style: "bold", gap: 6 });
  for (const para of (r.coverLetter || "").split(/\n\s*\n/)) {
    d.text(para.trim(), { size: 10, gap: 8 });
  }
  return d.doc;
}

/**
 * Renders a static resume example (heading + plain lines) as an ATS-safe PDF,
 * so visitors can download a sample and use it as their master template.
 */
export async function buildExampleResumePdf(example: {
  role: string;
  summaryLine: string;
  sections: { heading: string; lines: string[] }[];
}) {
  const d = await createDoc();

  d.text(`${example.role} — Resume Example`, { size: 19, style: "bold", color: [17, 51, 92] });
  d.text(example.summaryLine, { size: 10, color: [80, 90, 105] });
  d.text("Sample template from GotaOfferr — replace every line with your own detail.", {
    size: 8.5,
    color: [105, 112, 125],
  });
  d.space(4);

  for (const section of example.sections) {
    d.heading(section.heading);
    const bullets = section.lines.filter((line) => line.trim().startsWith("•"));
    const plain = section.lines.filter((line) => !line.trim().startsWith("•"));
    // Keep the original order rather than grouping, so roles stay above their bullets.
    if (bullets.length && plain.length) {
      let buffer: string[] = [];
      const flush = () => {
        if (buffer.length) {
          d.bullets(buffer.map((line) => line.replace(/^\s*•\s*/, "")));
          buffer = [];
        }
      };
      for (const line of section.lines) {
        if (line.trim().startsWith("•")) buffer.push(line);
        else {
          flush();
          d.text(line, { size: 10, style: "bold" });
        }
      }
      flush();
    } else if (bullets.length) {
      d.bullets(bullets.map((line) => line.replace(/^\s*•\s*/, "")));
    } else {
      for (const line of plain) d.text(line, { size: 9.8 });
    }
  }

  return d.doc;
}

export function slug(s: string) {
  return (s || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}


