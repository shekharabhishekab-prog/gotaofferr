// Builds the interview feedback PDF in the browser. Nothing is uploaded or stored.
type Fb = {
  overall: number;
  parts: { relevance: number; clarity: number; examples: number; jdMatch: number };
  summary: string;
  strengths: string[];
  fixes: string[];
  perQuestion: { n: number; tip: string }[];
};

export async function makeInterviewPdf(fb: Fb, questions: string[], answers: string[]) {
  const { jsPDF } = await import("jspdf");
  const d = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595, M = 40, TW = W - 2 * M;
  let y = 0;
  const clean = (t: string) => String(t ?? "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
  const head = () => {
    d.setFillColor(0, 0, 0); d.rect(0, 0, W, 64, "F");
    d.setTextColor(255, 214, 0); d.setFont("helvetica", "bold"); d.setFontSize(18);
    d.text("TERBEY  INTERVIEW FEEDBACK", M, 40);
    d.setTextColor(0, 0, 0); y = 96;
  };
  const need = (h: number) => { if (y + h > 800) { d.addPage(); head(); } };
  const para = (t: string, size: number, bold: boolean, color: [number, number, number], indent = 0, gap = 4) => {
    d.setFont("helvetica", bold ? "bold" : "normal"); d.setFontSize(size); d.setTextColor(color[0], color[1], color[2]);
    const lines = d.splitTextToSize(clean(t), TW - indent) as string[];
    for (const ln of lines) { need(size + 4); d.text(ln, M + indent, y); y += size + 3; }
    y += gap;
  };
  const h3 = (t: string) => { need(34); y += 8; para(t.toUpperCase(), 12, true, [0, 0, 0], 0, 6); };
  head();
  d.setFillColor(255, 214, 0); d.rect(M, y - 6, 150, 70, "F");
  d.setTextColor(0, 0, 0); d.setFont("helvetica", "bold"); d.setFontSize(44); d.text(String(fb.overall), M + 12, y + 44);
  const sw = d.getTextWidth(String(fb.overall));
  d.setFontSize(14); d.text("/ 100", M + 12 + sw + 6, y + 44);
  d.setFont("helvetica", "normal"); d.setFontSize(9); d.setTextColor(90, 90, 90);
  d.text(new Date().toLocaleDateString("en-GB"), M + 170, y + 56);
  d.setTextColor(0, 0, 0); d.setFontSize(11);
  const sl = d.splitTextToSize(clean(fb.summary), TW - 170) as string[];
  d.text(sl.slice(0, 4), M + 170, y + 8);
  y += 90 + Math.max(0, sl.length - 4) * 0;
  if (sl.length > 4) { para(sl.slice(4).join(" "), 11, false, [0, 0, 0], 0, 6); }
  h3("Score by area");
  for (const [n, v] of [["Relevance", fb.parts.relevance], ["Clarity", fb.parts.clarity], ["Examples", fb.parts.examples], ["Job match", fb.parts.jdMatch]] as const) {
    need(24);
    const r = Math.max(0, Math.min(1, v / 100));
    d.setFont("helvetica", "bold"); d.setFontSize(10); d.setTextColor(0, 0, 0); d.text(n, M, y + 9);
    d.setFillColor(225, 225, 225); d.rect(M + 90, y, 300, 11, "F");
    if (r >= 0.8) d.setFillColor(10, 122, 47); else if (r >= 0.55) d.setFillColor(224, 168, 0); else d.setFillColor(196, 35, 15);
    d.rect(M + 90, y, Math.max(2, 300 * r), 11, "F");
    d.setFont("helvetica", "normal"); d.text(v + " / 100", M + 400, y + 9);
    y += 22;
  }
  h3("What went well");
  for (const s of fb.strengths) para("- " + s, 10, false, [0, 0, 0], 0, 3);
  h3("Work on this");
  for (const s of fb.fixes) para("- " + s, 10, false, [0, 0, 0], 0, 3);
  h3("Question by question");
  questions.forEach((q, i) => {
    need(50);
    para((i + 1) + ". " + q, 10, true, [0, 0, 0], 0, 2);
    para(answers[i]?.trim() ? answers[i] : "(no answer)", 9.5, false, [90, 90, 90], 12, 2);
    const tip = fb.perQuestion.find((p) => p.n === i + 1)?.tip;
    if (tip) para("Tip: " + tip, 9.5, false, [0, 0, 0], 12, 8);
  });
  y += 6;
  para("AI coaching, not a verdict. Made in your browser by terbey.com. Nothing was stored.", 9, false, [90, 90, 90], 0, 0);
  d.save("terbey-interview-feedback.pdf");
}
