import type { LinkedInFreeReview, LinkedInProReview } from "./linkedin-schema";

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
  return out.replace(/[^\x00-\xFF\u2022\u20AC]/g, "");
}

const M = 48;
const W = 595.28;
const H = 841.89;

/** Builds the downloadable LinkedIn report PDF (free sections, plus paid ones when present). */
export async function buildLinkedInReportPdf(
  review: LinkedInFreeReview,
  pro: LinkedInProReview | null,
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = M;

  function write(
    value: string,
    opts: { size?: number; style?: "normal" | "bold"; color?: [number, number, number]; indent?: number; gap?: number } = {},
  ) {
    const { size = 10, style = "normal", color = [30, 35, 45], indent = 0, gap = 2 } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines: string[] = doc.splitTextToSize(safe(value), W - M * 2 - indent);
    const lh = size * 1.3;
    for (const line of lines) {
      if (y + lh > H - M) {
        doc.addPage();
        y = M;
      }
      doc.text(line, M + indent, y);
      y += lh;
    }
    y += gap;
  }

  function heading(label: string) {
    y += 8;
    write(label.toUpperCase(), { size: 11, style: "bold", color: [17, 51, 92], gap: 4 });
  }

  function bullets(items: string[]) {
    for (const item of items) write(`• ${item}`, { size: 9.8, indent: 8, gap: 1 });
  }

  write("LinkedIn Profile Report", { size: 20, style: "bold", color: [17, 51, 92] });
  write(`Overall score: ${Math.round(review.overallScore)}/100`, { size: 12, style: "bold" });
  write(review.summary, { size: 10, color: [80, 90, 105], gap: 6 });

  for (const [label, section] of [
    ["Headline", review.headline],
    ["About section", review.about],
  ] as const) {
    heading(`${label} — ${Math.round(section.score)}/100`);
    write(section.verdict, { size: 9.8 });
    if (section.strengths.length) {
      write("What works", { size: 9.5, style: "bold", gap: 1 });
      bullets(section.strengths);
    }
    if (section.fixes.length) {
      write("Fix these", { size: 9.5, style: "bold", gap: 1 });
      bullets(section.fixes);
    }
    if (section.rewrite) {
      write("Suggested rewrite", { size: 9.5, style: "bold", gap: 1 });
      write(section.rewrite, { size: 9.8, indent: 8 });
    }
  }

  heading(`Skills — ${Math.round(review.skills.score)}/100`);
  write(review.skills.verdict, { size: 9.8 });
  if (review.skills.keep.length) write(`Keep: ${review.skills.keep.join(", ")}`, { size: 9.8 });
  if (review.skills.add.length) write(`Add: ${review.skills.add.join(", ")}`, { size: 9.8 });
  bullets(review.skills.fixes);

  if (pro) {
    heading(`Keyword alignment — ${Math.round(pro.keywordAlignment.score)}/100`);
    if (pro.keywordAlignment.present.length)
      write(`Already present: ${pro.keywordAlignment.present.join(", ")}`, { size: 9.8 });
    if (pro.keywordAlignment.missing.length)
      write(`Missing: ${pro.keywordAlignment.missing.join(", ")}`, { size: 9.8 });
    bullets(pro.keywordAlignment.notes);

    if (pro.industrySuggestions.length) {
      heading("Industry suggestions");
      bullets(pro.industrySuggestions);
    }

    if (pro.aboutRewrite) {
      heading("Rewritten About section");
      write(pro.aboutRewrite, { size: 9.8 });
    }

    if (pro.experienceRewrite.length) {
      heading("Rewritten experience section");
      for (const entry of pro.experienceRewrite) {
        write(entry.heading, { size: 10, style: "bold", gap: 1 });
        bullets(entry.bullets);
      }
    }
  }

  return doc;
}
