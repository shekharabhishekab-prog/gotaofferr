import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Download, FileText, Maximize2, TriangleAlert, Upload, Wrench, X } from "lucide-react";
import { checkAts, type AtsResult } from "@/lib/ats-check";
import { assertValidResumeFile, extractPdfText, resumeSignalScore } from "@/lib/extract-pdf";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useServerFn } from "@tanstack/react-start";
import { getAtsUsage, recordAtsCheck } from "@/lib/ats-usage.functions";
import { looksLikeResume, robotView, stuffedWords } from "@/lib/ats-robot";
import { hardGap, regionNotes, type HardGap, type RegionNote } from "@/lib/ats-region";

export const Route = createFileRoute("/ats-checker")({
  head: () => ({
    meta: [
      { title: "Free ATS Score Checker: Test Your Resume | GotaOfferr" },
      { name: "description", content: "Check your resume against ATS rules in seconds. Your file is read in your browser and never uploaded. See what to fix. No fake skills." },
      { property: "og:title", content: "Free ATS Score Checker: Test Your Resume | GotaOfferr" },
      { property: "og:description", content: "Check your resume against ATS rules in seconds. Your file is read in your browser and never uploaded. See what to fix. No fake skills." },
      { property: "og:url", content: "https://gotaofferr.com/ats-checker" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/ats-checker" }],
  }),
  component: AtsDesignPreview,
});

type Fix = { tag: "AUTO-FIXED" | "NEEDS YOU" | "YOUR CALL" | "HARD GAP" | "REGION"; bad: string; fix: string };
type Sample = {
  score: number;
  meme: string[];
  verdict: string;
  parts: [string, number, number][];
  fixes: Fix[];
  missing?: string[];
};

const SAMPLES: Record<string, Sample> = {
  "38": {
    score: 38,
    meme: ["The robot", "fell asleep."],
    verdict: "Tables and two columns. The parser got lost on line 4.",
    parts: [["Layout", 6, 20], ["Headings", 8, 15], ["Contact", 5, 10], ["Dates", 6, 15], ["Bullets", 6, 20], ["Keywords", 7, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "Your experience sits inside a table", fix: "Copy it out as plain lines. Tables get read cell by cell, out of order." },
      { tag: "NEEDS YOU", bad: "Two columns found", fix: "Move the sidebar under Experience. One column reads top to bottom." },
      { tag: "AUTO-FIXED", bad: "Heading \"My Journey\"", fix: "Renamed to \"Experience\" so the robot knows where jobs start." },
      { tag: "YOUR CALL", bad: "Missing: SQL, forecasting, stakeholder reporting", fix: "Add them only if they are true. We never add skills for you." },
    ],
  },
  "72": {
    score: 72,
    meme: ["The robot can read it.", "Barely."],
    verdict: "Two things to fix and you are in the clear.",
    parts: [["Layout", 12, 20], ["Headings", 15, 15], ["Contact", 10, 10], ["Dates", 8, 15], ["Bullets", 14, 20], ["Keywords", 13, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "Two columns found", fix: "Move the skills sidebar under Experience. One column reads in order." },
      { tag: "AUTO-FIXED", bad: "Heading \"My Journey\"", fix: "Renamed to \"Experience\". Your words stay untouched." },
      { tag: "NEEDS YOU", bad: "Dates like \"2021\" have no month", fix: "Write Mar 2021 - Jun 2023. Parsers drop bare years." },
      { tag: "YOUR CALL", bad: "Missing: stakeholder management, SQL", fix: "Add them only if they are true. We never add skills for you." },
    ],
  },
  "94": {
    score: 94,
    meme: ["Robot approved.", "Go apply."],
    verdict: "Clean. One small thing left.",
    parts: [["Layout", 20, 20], ["Headings", 15, 15], ["Contact", 10, 10], ["Dates", 14, 15], ["Bullets", 19, 20], ["Keywords", 16, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "One date has no month", fix: "Write Jun 2022 instead of 2022." },
      { tag: "YOUR CALL", bad: "Missing: Tableau", fix: "Add it only if you have used it." },
    ],
  },
};

const STEPS = ["Reading the text", "Counting columns", "Checking headings", "Hunting dates", "Matching keywords"];

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-ak]"));
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("ak-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ak-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

// ---- Phase 1.8 wiring: all runs in the browser. No server call, no AI, no cost. ----
const ATS_GUEST_MONTHLY = 1; // guests get 1 free full check, then a login wall (owner decision Oct 10). Count lives only in this browser.
const MAX_JD = 20000;
const SHORT: Record<string, string> = { contact: "Contact", sections: "Headings", bullets: "Bullets", numbers: "Numbers", verbs: "Verbs", length: "Length", format: "Layout", dates: "Dates", keywords: "Keywords" };
const MEME: Record<string, [string, string]> = { strong: ["The robot", "loves it."], good: ["The robot can read it.", "Mostly."], "needs work": ["The robot can read it.", "Barely."], weak: ["The robot", "fell asleep."] };
const VERDICT: Record<string, string> = { strong: "Clean. The robot reads this without trouble.", good: "Good. A few things to tidy up.", "needs work": "Needs work. Fix the red bars first.", weak: "Weak. The robot will struggle with this." };

function plain(c: { id: string; label: string; hint: string | null }): [string, string] {
  const h = c.hint ?? "";
  switch (c.id) {
    case "contact": return ["Contact details", "Put your email and phone at the top."];
    case "sections": return h.includes("Summary") ? ["Summary", "Add a 2-line summary at the top."] : ["Section headings", "Use plain headings: Experience, Education, Skills."];
    case "bullets": return h.includes("Shorten") ? ["Long bullets", "Keep each bullet to 1 or 2 lines."] : ["Bullet points", "Write each job as 3 to 5 short bullets."];
    case "numbers": return ["Numbers", "Add real numbers where true: %, money, team size."];
    case "verbs": if (h.includes("weak phrases")) return ["Weak phrases", "Say what you did and what changed, not 'responsible for' or 'worked on'."]; return ["How bullets start", "Start bullets with Led, Built, Grew and similar."];
    case "length": return /very short|a bit short/.test(h) ? ["Length", "A little short. Add more about your roles and results."] : ["Length", "Too long. Keep the most useful 1 to 2 pages."];
    case "format": return ["Layout", "Use one plain column. No tables, icons or pictures."];
    case "dates": return ["Job dates", "Add start and end dates, like Jan 2022 - Present."];
    default: return [c.label, h];
  }
}

function toSample(r: AtsResult, hasJd: boolean, extra?: { gap?: HardGap | null; region?: RegionNote | null; stuffed?: string[] }): Sample {
  const parts: [string, number, number][] = r.checks.map((c) => [SHORT[c.id] ?? c.label, c.points, c.max]);
  const fixes: Fix[] = [];
  for (const c of r.checks) {
    if (!c.hint) continue;
    if (c.id === "keywords") {
      fixes.push({ tag: "YOUR CALL", bad: "Job words you do not use: " + r.missingKeywords.join(", "), fix: "Add only the ones that are true for you." });
    } else if (c.id === "numbers") {
      { const [b, f] = plain(c); fixes.push({ tag: "YOUR CALL", bad: b, fix: f }); }
    } else {
      { const [b, f] = plain(c); fixes.push({ tag: "NEEDS YOU", bad: b, fix: f }); }
    }
  }
  if (!hasJd) fixes.push({ tag: "YOUR CALL", bad: "No job post pasted", fix: "Paste it to see which job words you miss." });
  if (extra?.stuffed?.length) fixes.push({ tag: "NEEDS YOU", bad: "Repeated words", fix: "You repeat " + extra.stuffed.map((w) => '"' + w + '"').join(", ") + " a lot. Say it once or twice. Robots flag stuffing." });
  if (extra?.gap) fixes.push({ tag: "HARD GAP", bad: extra.gap.bad, fix: extra.gap.fix });
  if (extra?.region) fixes.push({ tag: "REGION", bad: "Job location: " + extra.region.label, fix: extra.region.notes.slice(0, 2).join(" ") });
  const rank = (t: Fix["tag"]) => (t === "HARD GAP" ? 0 : t === "NEEDS YOU" ? 1 : 2);
  fixes.sort((a, b) => rank(a.tag) - rank(b.tag));
  return { score: r.score, meme: MEME[r.band], verdict: VERDICT[r.band], parts, fixes, missing: r.missingKeywords };
}

async function docxText(f: File): Promise<string> {
  const buf = new Uint8Array(await f.arrayBuffer());
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("That DOCX looks damaged. Save it again or use a PDF.");
  const count = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nlen));
    if (name === "word/document.xml") {
      const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
      const data = buf.slice(start, start + csize);
      let xml = "";
      if (method === 0) xml = new TextDecoder().decode(data);
      else if (method === 8) {
        const DS = (globalThis as unknown as { DecompressionStream?: new (f: string) => unknown }).DecompressionStream;
        if (!DS) throw new Error("This browser can't open DOCX. Please upload a PDF.");
        const stream = new Blob([data]).stream().pipeThrough(new DS("deflate-raw") as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
        xml = await new Response(stream).text();
      } else throw new Error("That DOCX can't be read. Please upload a PDF.");
      xml = xml
        .replace(/<w:tab\/>/g, " ")
        .replace(/<w:br\/>/g, "\n")
        .replace(/<\/w:tc>/g, " | ")
        .replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (para) => (/<w:numPr>/.test(para) ? "\u2022 " : "") + para + "\n");
      return xml.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error("Couldn't find any text in that DOCX.");
}

async function readResume(f: File): Promise<string> {
  const n = f.name.toLowerCase();
  if (f.size === 0) throw new Error("That file is empty.");
  if (f.size > 8 * 1024 * 1024) throw new Error("That file is too big. Use one under 8 MB.");
  if (n.endsWith(".pdf") || f.type === "application/pdf") { await assertValidResumeFile(f); return extractPdfText(f); }
  if (n.endsWith(".docx")) return docxText(f);
  if (n.endsWith(".txt") || n.endsWith(".md")) return f.text();
  if (n.endsWith(".doc")) throw new Error("Old .doc files can't be read. Save it as PDF or DOCX and try again.");
  throw new Error("Please upload a PDF, DOCX or TXT file.");
}

function guestLeft(): number {
  if (!ATS_GUEST_MONTHLY || typeof window === "undefined") return 99;
  try {
    const k = "gf-ats-" + new Date().toISOString().slice(0, 7);
    return ATS_GUEST_MONTHLY - (parseInt(window.localStorage.getItem(k) || "0", 10) || 0);
  } catch { return 99; }
}
function guestUse() {
  if (!ATS_GUEST_MONTHLY) return;
  try {
    const k = "gf-ats-" + new Date().toISOString().slice(0, 7);
    window.localStorage.setItem(k, String((parseInt(window.localStorage.getItem(k) || "0", 10) || 0) + 1));
  } catch { /* ignore */ }
}

async function makePdf(s: Sample, title: string, sample: boolean) {
  const { jsPDF } = await import("jspdf");
  const d = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595, M = 40;
  let y = 0;
  const clean = (t: string) => t.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
  const head = () => {
    d.setFillColor(0, 0, 0); d.rect(0, 0, W, 64, "F");
    d.setTextColor(255, 214, 0); d.setFont("helvetica", "bold"); d.setFontSize(18);
    d.text("GOTAOFFERR  ATS CHECK" + (sample ? "  (SAMPLE)" : ""), M, 40);
    d.setTextColor(0, 0, 0); y = 96;
  };
  const need = (h: number) => { if (y + h > 800) { d.addPage(); head(); } };
  head();
  if (title) { d.setFont("helvetica", "bold"); d.setFontSize(12); d.text(clean(title), M, y); y += 22; }
  d.setFillColor(255, 214, 0); d.rect(M, y - 6, 150, 70, "F");
  d.setFont("helvetica", "bold"); d.setFontSize(44); d.text(String(s.score), M + 12, y + 44);
  const sw = d.getTextWidth(String(s.score));
  d.setFontSize(14); d.text("/ 100", M + 12 + sw + 6, y + 44);
  d.setFont("helvetica", "normal"); d.setFontSize(12);
  d.text(d.splitTextToSize(clean(s.verdict), W - 2 * M - 170), M + 170, y + 22);
  d.setFontSize(9); d.setTextColor(90, 90, 90);
  d.text(new Date().toLocaleDateString("en-GB"), M + 170, y + 56);
  d.setTextColor(0, 0, 0); y += 104;
  d.setFont("helvetica", "bold"); d.setFontSize(13); d.text("SCORE BY AREA", M, y); y += 18;
  for (const [n, v, m] of s.parts) {
    need(24);
    const r = m ? v / m : 0;
    d.setFont("helvetica", "bold"); d.setFontSize(10); d.text(clean(n), M, y + 9);
    d.setFillColor(225, 225, 225); d.rect(M + 90, y, 300, 11, "F");
    if (r >= 0.8) d.setFillColor(10, 122, 47); else if (r >= 0.55) d.setFillColor(224, 168, 0); else d.setFillColor(196, 35, 15);
    d.rect(M + 90, y, Math.max(2, 300 * r), 11, "F");
    d.setFont("helvetica", "normal"); d.text(v + " / " + m, M + 400, y + 9);
    y += 22;
  }
  y += 14; need(40);
  d.setFont("helvetica", "bold"); d.setFontSize(13); d.text(s.fixes.length ? "THINGS TO FIX (" + s.fixes.length + ")" : "NOTHING TO FIX", M, y); y += 20;
  for (const f of s.fixes) {
    const lines = d.splitTextToSize(clean(f.bad + ". " + f.fix), W - 2 * M - 100) as string[];
    need(lines.length * 13 + 14);
    if (f.tag === "NEEDS YOU") d.setFillColor(0, 0, 0); else d.setFillColor(255, 214, 0);
    d.roundedRect(M, y - 9, 86, 15, 7, 7, "F");
    d.setFont("helvetica", "bold"); d.setFontSize(8);
    if (f.tag === "NEEDS YOU") d.setTextColor(255, 214, 0); else d.setTextColor(0, 0, 0);
    d.text(f.tag, M + 43, y + 1.5, { align: "center" });
    d.setTextColor(0, 0, 0); d.setFont("helvetica", "normal"); d.setFontSize(10);
    d.text(lines, M + 100, y);
    y += lines.length * 13 + 12;
  }
  y += 10; need(30);
  d.setFont("helvetica", "italic"); d.setFontSize(9); d.setTextColor(90, 90, 90);
  d.text("A guide, not an official score. We never add skills or jobs for you.", M, y);
  d.save(sample ? "gotaofferr-ats-sample-report.pdf" : "gotaofferr-ats-report.pdf");
}

function AtsDesignPreview() {
  const root = useReveal();
  useEffect(() => {
    const el = root.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const px = Array.from(el.querySelectorAll<HTMLElement>("[data-px]"));
    let raf = 0;
    const vis = new Set<HTMLElement>();
    const tick = () => {
      raf = 0;
      const h = window.innerHeight || 800;
      const items = Array.from(vis);
      const rs = items.map((e) => e.getBoundingClientRect());
      items.forEach((e, n) => {
        const r = rs[n];
        const c = (r.top + r.height / 2 - h / 2) / h;
        const k = parseFloat(e.dataset.px || "0");
        e.style.translate = e.dataset.pm === "x" ? (c * k).toFixed(1) + "px 0" : "0 " + (c * k).toFixed(1) + "px";
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const pio = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => { es.forEach((x) => { if (x.isIntersecting) vis.add(x.target as HTMLElement); else vis.delete(x.target as HTMLElement); }); on(); }, { rootMargin: "150px" }) : null;
    if (pio) px.forEach((e) => pio.observe(e)); else px.forEach((e) => vis.add(e));
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    tick();
    return () => { if (pio) pio.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [root]);
  const [key, setKey] = useState("72");
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scan" | "done">("idle");
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);
  const [file, setFile] = useState("");
  const [over, setOver] = useState(false);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [comp, setComp] = useState("");
  const [pos, setPos] = useState("");
  const [err, setErr] = useState("");
  const [wall, setWall] = useState(false);
  const [dlGate, setDlGate] = useState(false);
  const { user } = useSession();
  const usageFn = useServerFn(getAtsUsage);
  const recordFn = useServerFn(recordAtsCheck);
  const [capped, setCapped] = useState(0);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  useEffect(() => {
    if (!user) { setQuota(null); return; }
    usageFn().then((u) => setQuota({ used: u.used, limit: u.limit })).catch(() => {});
  }, [user]);
  const [real, setReal] = useState<Sample | null>(null);
  const [pm, setPm] = useState(false);
  const [rawText, setRawText] = useState("");
  const [hl, setHl] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const resRef = useRef<HTMLDivElement | null>(null);
  const s = real ?? SAMPLES[key];
  const rv = pm && real && rawText ? robotView(rawText) : null;
  const title = real ? [pos.trim(), comp.trim()].filter(Boolean).join(" at ") : "";
  const pick = (f: File) => { setFile(f.name); setFileObj(f); setErr(""); };
  const showSample = () => {
    if (phase === "scan") return;
    if (phase === "done" && !real) { setPhase("idle"); setHl(false); setPm(false); return; }
    setReal(null);
    setErr("");
    setPhase("done");
    setRun((n) => n + 1);
    setHl(true);
    window.setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };
  const go = async () => {
    if (phase === "scan") return;
    setErr("");
    if (!fileObj) { setErr("Add your resume first (PDF, DOCX or TXT)."); return; }
    if (!user && guestLeft() <= 0) { setWall(true); return; }
    if (user) {
      try {
        const u = await usageFn();
        if (!u.allowed) { setCapped(u.limit); return; }
      } catch { /* counter down: allow the check */ }
    }
    setCapped(0);
    setPhase("scan");
    setHl(false);
    const t0 = Date.now();
    try {
      const text = await readResume(fileObj);
      if (text.replace(/\s+/g, "").length < 80) throw new Error(/\.pdf$/i.test(fileObj.name) ? "No text found. This looks like a scan or picture. If the robot can't read it, ATS can't either. Export a text PDF or use DOCX." : "That file has almost no text. Add your full resume.");
      if (resumeSignalScore(text) < 3 || !looksLikeResume(text)) throw new Error("This doesn't look like a resume. Upload your own resume as a PDF, DOCX or TXT.");
      let jdt = jd.slice(0, MAX_JD);
      for (const w of (comp.toLowerCase().match(/[a-z]{3,}/g) ?? [])) jdt = jdt.replace(new RegExp("\\b" + w + "\\b", "gi"), " ");
      const jdFull = jd.slice(0, MAX_JD);
      const wc = (text.match(/\S+/g) ?? []).length;
      const out = toSample(checkAts(text, jdt), jdt.trim().length > 40, { gap: hardGap(text, jdFull), region: regionNotes(jdFull, comp, wc), stuffed: stuffedWords(text) });
      setRawText(text);
      await new Promise((r) => window.setTimeout(r, Math.max(0, 1850 - (Date.now() - t0))));
      if (!user) { guestUse(); if (guestLeft() <= 0) setWall(true); }
      else { try { await recordFn(); usageFn().then((u) => setQuota({ used: u.used, limit: u.limit })).catch(() => {}); } catch { /* ignore */ } }
      setReal(out);
      setPhase("done");
      setRun((n) => n + 1);
      setHl(true);
      resRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {
      setPhase("idle");
      setErr(e instanceof Error ? e.message : "Could not read that file. Try a PDF.");
    }
  };
  const dl = async () => {
    if (phase !== "done") { setErr("Run a check first, then download the report."); return; }
    if (!user) { setDlGate(true); return; }
    try { await makePdf(s, title, !real); } catch { setErr("Could not build the report. Try again."); }
  };
  const carry = () => {
    if (!real || !rawText) return;
    try {
      window.sessionStorage.setItem("gf-ats-carry", JSON.stringify({ resume: rawText, jd: jd.slice(0, MAX_JD), company: comp.trim(), role: pos.trim(), file: file, t: Date.now() }));
    } catch { /* storage unavailable: tailor opens empty */ }
  };
  const openPv = () => {
    if (phase !== "done") { setErr("Run a check first, then open the full preview."); return; }
    setHl(false);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPm(true);
  };
  useEffect(() => {
    if (!pm) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setPm(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [pm]);

  useEffect(() => {
    if (phase !== "done") return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setShown(Math.round(s.score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s.score, run, phase]);

  useEffect(() => {
    if (phase !== "scan") return;
    setStep(0);
    const iv = window.setInterval(() => setStep((n) => (n + 1) % STEPS.length), 340);
    return () => window.clearInterval(iv);
  }, [phase]);

  const C = 2 * Math.PI * 54;
  const tone = s.score >= 85 ? "good" : s.score >= 60 ? "mid" : "bad";

  return (
    <main ref={root} className="ak">
      <style>{AK_CSS}</style>

      {/* HERO */}
      <section className="ak-hero">
        <div className="ak-wrap ak-hero-grid">
          <div>
            <span className="ak-mono ak-rise" style={{ ["--d" as string]: "0s" }}>( ats score, no ai, 20 seconds )</span>
            <h1 className="ak-h1" aria-label="The robot reads your resume first.">
              <span className="ak-ln ak-rise" style={{ ["--d" as string]: ".08s" }}>The <mark>robot</mark></span>
              <span className="ak-ln ak-rise" style={{ ["--d" as string]: ".2s" }}>reads your</span>
              <span className="ak-ln ak-cur ak-rise" style={{ ["--d" as string]: ".32s" }}>resume first.</span>
            </h1>
            <p className="ak-sub ak-rise" style={{ ["--d" as string]: ".5s" }}>
              Most resumes die in software before a person sees them. Drop yours in, see what the robot sees, fix it before you apply.
            </p>
            <div className="ak-cta ak-rise" style={{ ["--d" as string]: ".65s" }}>
              <a href="#check" className="ak-btn">Check my resume <ArrowRight className="size-4" /></a>
            </div>
          </div>

          <div className="ak-paper-wrap" aria-hidden>
            <div className="ak-paper">
              <i className="ak-pl w60" /><i className="ak-pl w35 thin" />
              <div className="ak-cols"><div><i className="ak-pl w90" /><i className="ak-pl w70" /><i className="ak-pl w80" /><i className="ak-pl w50" /></div><div><i className="ak-pl w80" /><i className="ak-pl w60" /><i className="ak-pl w90" /></div></div>
              <i className="ak-pl w45 head" /><i className="ak-pl w95" /><i className="ak-pl w85" /><i className="ak-pl w75" /><i className="ak-pl w90" />
              <i className="ak-beam" />
            </div>
            <span className="ak-pin p1"><Check className="size-3.5" /> contact found</span>
            <span className="ak-pin p2 bad"><TriangleAlert className="size-3.5" /> 2 columns</span>
            <span className="ak-pin p3"><Check className="size-3.5" /> headings ok</span>
            <span className="ak-pin p4 bad"><TriangleAlert className="size-3.5" /> date, no month</span>
          </div>
        </div>
      </section>

      <div aria-hidden className="ak-mq"><div className="ak-mq-in">{[0, 1].map((n) => (<span key={n}>SCORE 0-100 <b>*</b> FIX IN ONE CLICK <b>*</b> NO AI, NO GUESSING <b>*</b> NO FAKE SKILLS <b>*</b> SCORE 0-100 <b>*</b> FIX IN ONE CLICK <b>*</b> NO AI, NO GUESSING <b>*</b> NO FAKE SKILLS <b>*</b> </span>))}</div></div>

      {/* CHECKER */}
      <section id="check" className="ak-wrap ak-check">
        <div data-ak className="ak-rv ak-headrow">
          <h2 data-px="26" className="ak-h2 ak-h2b">
            <span className="d1">Drop it.</span>
            <span className="d3"><span className="d2">Paste the job description</span><span className="go2">Go.</span><button type="button" className={`ak-smp go ${phase === "done" ? "open" : ""}`} aria-pressed={phase === "done"} onClick={showSample}>{phase === "done" ? "hide sample" : "see a sample"} <ArrowRight className="size-4" /></button></span>
          </h2>
        </div>
        <div ref={stageRef} className="ak-stage">
        <div data-ak data-ph-no-capture="true" className="ak-rv ak-panel ph-no-capture">
          <span className="ak-pill" aria-live="polite">{!user ? "1 free check" : quota ? (quota.limit < 0 ? "Checks left: Unlimited" : `${Math.max(0, quota.limit - quota.used)} of ${quota.limit} left this month`) : "Checks left: ..."}</span>
          <label
            className={`ak-drop ${over ? "over" : ""} ${phase === "scan" ? "scan" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) pick(f); }}
          >
            <input type="file" accept=".pdf,.docx,.txt,.md" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ""; }} />
            <i className="ak-c c1" /><i className="ak-c c2" /><i className="ak-c c3" /><i className="ak-c c4" />
            <i className="ak-dbeam" />
            
            <span className="ak-dic">{file ? <FileText className="size-8" /> : <Upload className="size-8" />}</span>
            <span className="ak-dt">{phase === "scan" ? STEPS[step] + "..." : file || "Drop your resume here"}</span>
            <span className="ak-dh">{file ? "Click to change" : "PDF, DOCX or TXT. Or click to browse."}</span>
          </label>
          <p className="ak-hint">Upload only your own resume. No essays or reports.</p>

          <div className="ak-fields">
            <div className="ak-two">
              <label><span>Company</span><input placeholder="Acme Corp" value={comp} maxLength={80} onChange={(e) => setComp(e.target.value)} /></label>
              <label><span>Job position</span><input placeholder="Marketing Manager" value={pos} maxLength={80} onChange={(e) => setPos(e.target.value)} /></label>
            </div>
            <label className="ak-grow"><span>Job description</span><textarea placeholder="Paste the full job description. The robot matches keywords against it." value={jd} onChange={(e) => setJd(e.target.value)} /></label>
            {err ? <p className="ak-err" role="alert">{err}</p> : null}
          </div>

          {capped && user ? (
            <Link to="/pricing" className="ak-btn ak-go">See plans / upgrade <ArrowRight className="size-4" /></Link>
          ) : wall && !user ? (
            <Link to="/auth" search={{ redirect: "/ats-checker" }} className="ak-btn ak-go">Sign in to continue <ArrowRight className="size-4" /></Link>
          ) : (
            <button type="button" className="ak-btn ak-go" disabled={phase === "scan"} onClick={go}>
              {phase === "scan" ? "Scanning..." : <>Check my resume <ArrowRight className="size-4" /></>}
            </button>
          )}
          {!user ? <p className="ak-quota">Sign in for 10 free checks a month.</p> : null}
        </div>

        {/* RESULT */}
        <div ref={resRef} data-ph-no-capture="true" className={`ak-res ph-no-capture ${phase !== "done" ? "idle" : ""}`}>
          <div className="ak-idle">
            <div className="ak-sk"><i className="ring" /><div className="bars">{[0,1,2,3,4,5].map((n) => (<i key={n} style={{ ["--i" as string]: n, ["--w" as string]: (92 - n * 6) + "%" }} />))}</div></div>
            <div className="ak-sl">{[0,1,2].map((n) => (<i key={n} style={{ ["--i" as string]: n }} />))}</div>
            <p>{phase === "scan" ? STEPS[step] + "..." : "Waiting for your resume"}</p>
          </div>
          <div className="ak-scroll">
          <div className="ak-res-top">
            <span className="ak-tag">{real ? "YOUR RESULT" : "SAMPLE RESULT"}</span>
            <button type="button" className="ak-dl" onClick={dl} aria-label="Download sample report" title="Download sample"><Download className="size-4" /></button>
            <div className="ak-tabs" role="tablist" aria-label="Try a sample score" style={real ? { display: "none" } : undefined}>
              {Object.keys(SAMPLES).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={k === key} className={k === key ? "on" : ""} onClick={() => { setKey(k); setRun((n) => n + 1); }}>{k}</button>
              ))}
            </div>
          </div>

          <h3 key={key + run} className="ak-meme">
            <span>{s.meme[0]}</span>
            <span className="y">{s.meme[1]}</span>
          </h3>

          <div className="ak-res-grid">
            <div className={`ak-gauge ${tone}`}>
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="54" className="bg" />
                <circle key={key + run} cx="60" cy="60" r="54" className="fg" style={{ strokeDasharray: C, ["--to" as string]: C * (1 - s.score / 100) }} />
              </svg>
              <div className="ak-num"><b>{shown}<span>/100</span></b></div>
              <p>{s.verdict}</p>
            </div>

            <div className="ak-bars">
              {s.parts.map(([n, v, m], i) => (
                <div key={n + key + run} className="ak-bar" style={{ ["--i" as string]: i }}>
                  <span>{n}</span>
                  <div className="tr"><i style={{ ["--w" as string]: `${(v / m) * 100}%` }} className={v / m >= 0.8 ? "g" : v / m >= 0.55 ? "m" : "b"} /></div>
                  <em>{v}/{m}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="ak-fixes">
            <h4>{s.fixes.length} things to fix</h4>
            {s.fixes.map((f, i) => (
              <div key={f.bad + key + run} className="ak-fix" style={{ ["--i" as string]: i }}>
                <span className={`ak-ft ${f.tag === "AUTO-FIXED" ? "a" : f.tag === "YOUR CALL" || f.tag === "REGION" ? "c" : "n"}`}>{f.tag === "AUTO-FIXED" ? <Wrench className="size-3" /> : null}{f.tag}</span>
                <div><b>{f.bad}</b><p>{f.fix}</p></div>
              </div>
            ))}
          </div>

          </div>
          <div className="ak-pvbar">
            <button type="button" className={`ak-pv ${hl ? "hl" : ""}`} onClick={openPv}><Maximize2 className="size-5" /> Full preview <ArrowRight className="size-5" /></button>
            <button type="button" className="ak-dl2" onClick={dl} aria-label="Download report" title="Download report"><Download className="size-6" /><span className="ak-dl2-t">Download report</span></button>
          </div>
          <Link to="/tailor" className="ak-tail" onClick={carry}><span className="ak-tail-t">Tailor my resume <ArrowRight className="size-7" /></span><span className="ak-tail-s">Fix every red item for this job in 30 seconds. No fake skills.</span></Link>

        </div>
        </div>
      </section>

      {/* GAP */}
      <section aria-hidden className="ak-gap">
        <div className="ak-bw" data-px="-420" data-pm="x">One column <b>+</b> Real text <b>+</b> Real months <b>+</b> One column <b>+</b> Real text <b>+</b> Real months <b>+</b></div>
        <div className="ak-chips">
          <span className="ak-chip" data-px="-70">&#10003; one column</span>
          <span className="ak-chip y" data-px="60">! date, no month</span>
          <span className="ak-chip" data-px="-40">&#10003; headings ok</span>
          <span className="ak-chip y" data-px="80">! two columns</span>
        </div>
        <div className="ak-bw out" data-px="420" data-pm="x">No tables <b>+</b> No text boxes <b>+</b> No pictures <b>+</b> No tables <b>+</b> No text boxes <b>+</b> No pictures <b>+</b></div>
      </section>

      {/* HOW */}
      <section className="ak-wrap ak-how">
        <h2 data-ak className="ak-rv ak-h2">What the robot <span>looks at</span></h2>
        {[
          ["Can it read you?", "One column. Real text, not a picture. No tables, no text boxes."],
          ["Can it find you?", "Standard headings. A contact block. Dates with months."],
          ["Does it want you?", "Your bullets. Your numbers. Your words against the job description."],
        ].map(([t, b], k) => (
          <div key={t} data-ak className="ak-rv ak-row" style={{ ["--k" as string]: k }}>
            <span className="n">0{k + 1}</span>
            <h3 data-px={k % 2 ? "-24" : "24"} data-pm="x" className={k === 1 ? "out" : k === 2 ? "yel" : ""}>{t}</h3>
            <p data-px="24">{b}</p>
          </div>
        ))}
      </section>

      <section data-ak className="ak-rv ak-end">
        <div className="ak-wrap">
          <h2 data-px="30">Score first.<br /><span>Apply second.</span></h2>
          <a href="#check" className="ak-btn">Check my resume <ArrowRight className="size-4" /></a>
        </div>
      </section>

      {dlGate && !user ? (
        <div className="ak-pm" role="dialog" aria-modal="true" aria-label="Sign in to download" onClick={() => setDlGate(false)}>
          <div className="ak-gate" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ak-pmx" onClick={() => setDlGate(false)} aria-label="Close"><X className="size-5" /></button>
            <h3>Sign in to download your report</h3>
            <p>It is free. Your resume stays in your browser, we do not store it.</p>
            <Link to="/auth" search={{ redirect: "/ats-checker" }} className="ak-btn">Sign in <ArrowRight className="size-4" /></Link>
            <Link to="/auth" search={{ redirect: "/ats-checker" }} className="ak-gate-s">Create a free account</Link>
          </div>
        </div>
      ) : null}
      {pm ? (
        <div className="ak-pm" role="dialog" aria-modal="true" aria-label="Full ATS report" onClick={() => setPm(false)}>
          <div className="ak-pmc" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ak-pmx" onClick={() => setPm(false)} aria-label="Close preview"><X className="size-5" /></button>
            <aside className="ak-pml">
              <span className="ak-tag">{real ? "YOUR RESULT" : "SAMPLE RESULT"}</span>
              {title ? <div className="ak-pmt">{title}</div> : null}
              <div className={`ak-pmg ${tone}`}>
                <svg viewBox="0 0 120 120" aria-hidden><circle cx="60" cy="60" r="54" className="bg" /><circle cx="60" cy="60" r="54" className="fg" strokeDasharray={C} strokeDashoffset={C * (1 - s.score / 100)} /></svg>
                <div className="ak-pmn"><b>{s.score}<span>/100</span></b></div>
              </div>
              <p>{s.verdict}</p>
              <button type="button" className="ak-pmd" onClick={dl}><Download className="size-5" /> Download report</button>
              <Link to="/tailor" className="ak-pmd ak-pmt2" onClick={carry}>Tailor resume <ArrowRight className="size-5" /></Link>
            </aside>
            <div className="ak-pmr">
              <h4>Score by area</h4>
              {s.parts.map(([n, v, m]) => (
                <div key={n} className="ak-pmb"><span>{n}</span><div className="tr"><i style={{ width: `${(v / m) * 100}%` }} className={v / m >= 0.8 ? "g" : v / m >= 0.55 ? "m" : "b"} /></div><em>{v}/{m}</em></div>
              ))}
              <h4>{s.fixes.length ? s.fixes.length + " things to fix" : "Nothing to fix"}</h4>
              {s.fixes.map((f, i) => (
                <div key={f.bad + i} className="ak-pmf">
                  <span className={`ak-ft ${f.tag === "AUTO-FIXED" ? "a" : f.tag === "YOUR CALL" || f.tag === "REGION" ? "c" : "n"}`}>{f.tag}</span>
                  <div><b>{f.bad}</b><p>{f.fix}</p></div>
                </div>
              ))}
              {rv ? (
                <div className="ak-rb">
                  <h4>What the robot read</h4>
                  <p className="ak-rbs">What a simple ATS reads from your file. It stays in your browser.</p>
                  <div className="ak-rbg">
                    {([["Name", rv.name], ["Email", rv.email], ["Phone", rv.phone], ["Location", rv.location], ["Links", rv.links.length ? rv.links.join(", ") : null]] as [string, string | null][]).map(([k, v]) => (
                      <div key={k} className={v ? "ok" : "no"}><span>{k}</span><b>{v ?? "Not found"}</b></div>
                    ))}
                    <div className={rv.roles.length ? "ok" : "no"}><span>Jobs with dates</span><b>{rv.roles.length ? rv.roles.length + " found" : "Not found"}</b></div>
                    <div className={rv.education.length ? "ok" : "no"}><span>Education</span><b>{rv.education.length ? rv.education[0] : "Not found"}</b></div>
                    <div className={rv.skillCount ? "ok" : "no"}><span>Skills list</span><b>{rv.skillCount ? rv.skillCount + " found: " + rv.skills.slice(0, 6).join(", ") : "Not found"}</b></div>
                  </div>
                  <div className="ak-rbc">{rv.sections.map((x) => <span key={x.label} className={x.found ? "ok" : "no"}>{x.found ? "✓" : "✗"} {x.label}</span>)}</div>
                  {rv.roles.length ? <ul className="ak-rbl">{rv.roles.map((r, i) => <li key={i}>{r}</li>)}</ul> : null}
                  {rv.warnings.map((w) => <p key={w} className="ak-rbw">! {w}</p>)}
                  <details className="ak-rbt"><summary>Show the raw text the robot got ({rv.chars} characters)</summary><pre>{rv.text}{rv.truncated ? "\n... (cut here, the robot got the rest too)" : ""}</pre></details>
                </div>
              ) : null}
              <p className="ak-pmn2">A guide, not an official score. We never add skills or jobs for you.</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const AK_CSS = `
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
@font-face{font-family:"HPHand";src:url("/fonts/caveat-brush.woff2") format("woff2");font-display:swap}
.ak{--y:#073f89;--ink:#fffffd;--cream:#073f89;background:#fffffd;color:var(--cream);overflow:hidden}
.ak *{box-sizing:border-box}
.ak-wrap{max-width:1180px;margin:0 auto;padding:0 20px}
.ak-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y);opacity:.9}
.ak-hand{font-family:"HPHand","Caveat Brush",cursive;font-size:1.5rem;color:var(--y);transform:rotate(-4deg);display:inline-block}
.ak-rise{opacity:0;transform:translateY(.7em);filter:blur(8px);animation:ak-rise .8s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes ak-rise{to{opacity:1;transform:none;filter:none}}
.ak-rv{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--k,0)*.12s)}
.ak-rv.ak-in{opacity:1;transform:none}

.ak-hero{position:relative;padding:56px 0 40px;background:radial-gradient(60% 50% at 78% 30%,rgba(7,63,137,.16),transparent 70%)}
.ak-hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(7,63,137,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(7,63,137,.05) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(#fffffd 30%,transparent)}
@keyframes ak-grid{to{background-position:0 56px}}
.ak-hero-grid{position:relative;display:grid;grid-template-columns:1.15fr .85fr;gap:32px;align-items:center}
.ak-h1{margin:18px 0 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.92;letter-spacing:-.015em;font-size:clamp(3rem,8.4vw,7rem)}
.ak-ln{display:block}
.ak-h1 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1.5deg);animation:ak-wob 4s ease-in-out infinite}
@keyframes ak-wob{50%{transform:rotate(1.2deg) translateY(-3px)}}
.ak-out{color:transparent;-webkit-text-stroke:2px var(--cream)}
.ak-sub{max-width:34rem;margin-top:22px;font-size:1.12rem;line-height:1.5;color:rgba(20,33,58,.72)}
.ak-cta{display:flex;align-items:center;gap:18px;margin-top:28px;flex-wrap:wrap}
.ak-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--y);color:#fffffd;font-weight:700;border-radius:999px;padding:15px 28px;font-size:1rem;border:0;cursor:pointer;text-decoration:none;box-shadow:0 0 0 0 rgba(7,63,137,.5);transition:transform .2s;position:relative;isolation:isolate}
.ak-btn:after{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--y);z-index:-1;pointer-events:none;will-change:transform,opacity;animation:ak-ringx 2.6s ease-out infinite}
@keyframes ak-ringx{0%{transform:scale(1);opacity:.45}70%,100%{transform:scale(1.1,1.4);opacity:0}}
.ak-btn.sm:after,.ak-btn:disabled:after{display:none}
.ak-btn:hover{transform:translateY(-3px) scale(1.03)}
.ak-btn:disabled{opacity:.7;cursor:wait;animation:none}
.ak-btn.sm{padding:11px 20px;font-size:.92rem;animation:none}
@keyframes ak-ring{0%{box-shadow:0 0 0 0 rgba(7,63,137,.45)}70%,100%{box-shadow:0 0 0 18px rgba(7,63,137,0)}}

.ak-paper-wrap{position:relative;min-height:380px;display:flex;align-items:center;justify-content:center}
.ak-paper{will-change:transform;position:relative;width:270px;aspect-ratio:.72;background:#073f89;border-radius:6px;padding:26px 22px;transform:rotate(5deg);box-shadow:0 30px 80px rgba(7,63,137,.18),0 0 0 1px rgba(7,63,137,.2);animation:ak-flt 7s ease-in-out infinite;overflow:hidden}
@keyframes ak-flt{0%,100%{transform:rotate(5deg) translate(0,0)}33%{transform:rotate(0deg) translate(12px,-24px)}66%{transform:rotate(8deg) translate(-12px,-10px)}}
.ak-pl{display:block;height:8px;border-radius:4px;background:#161616;margin:0 0 9px;opacity:.85}
.ak-pl.thin{height:5px;opacity:.4}.ak-pl.head{height:11px;margin-top:14px;background:#fffffd}
.w35{width:35%}.w45{width:45%}.w50{width:50%}.w60{width:60%}.w70{width:70%}.w75{width:75%}.w80{width:80%}.w85{width:85%}.w90{width:90%}.w95{width:95%}
.ak-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.ak-beam{position:absolute;left:0;right:0;height:46px;top:-46px;background:linear-gradient(transparent,rgba(7,63,137,.55),transparent);border-bottom:2px solid var(--y);animation:ak-scan 3.2s ease-in-out infinite}
@keyframes ak-scan{0%{transform:translateY(0)}100%{transform:translateY(520px)}}
.ak-pin{position:absolute;display:inline-flex;align-items:center;gap:6px;background:#fffffd;border:1px solid rgba(7,63,137,.3);color:var(--cream);font-size:.74rem;font-weight:700;text-transform:uppercase;padding:7px 11px;border-radius:999px;white-space:nowrap;animation:ak-pop 6.4s ease-in-out infinite;opacity:0}
.ak-pin.bad{background:var(--y);color:#fffffd;border-color:var(--y)}
.ak-pin.p1{left:0;top:16%;animation-delay:.6s}.ak-pin.p2{right:-2%;top:30%;animation-delay:1.6s}.ak-pin.p3{left:2%;bottom:30%;animation-delay:2.6s}.ak-pin.p4{right:2%;bottom:14%;animation-delay:3.6s}
@keyframes ak-pop{0%{opacity:0;transform:scale(.6) translateY(10px)}8%,70%{opacity:1;transform:none}85%,100%{opacity:0;transform:translateY(-8px)}}

.ak-mq{border-block:1px solid rgba(7,63,137,.15);background:var(--y);color:#fffffd;overflow:hidden;white-space:nowrap;transform:rotate(-1deg);margin:26px -2% 0}
.ak-mq-in{display:inline-flex;animation:ak-mq 26s linear infinite}
.ak-mq-in span{font-family:var(--font-display,inherit);font-weight:800;font-size:1.25rem;padding:13px 0;letter-spacing:.02em}
.ak-mq-in b{margin:0 .7em}
@keyframes ak-mq{to{transform:translateX(-50%)}}

.ak-check{padding-top:90px}
.ak-h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.98;font-size:clamp(2.2rem,5.4vw,4.2rem);margin:0 0 34px}
.ak-h2 span{color:var(--y)}
.ak-panel{display:grid;grid-template-columns:1fr 1fr;gap:22px;border:1px solid rgba(7,63,137,.35);border-radius:22px;padding:22px;background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015))}
.ak-drop{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;min-height:300px;border:2px dashed rgba(7,63,137,.55);border-radius:16px;cursor:pointer;overflow:hidden;transition:background .25s,transform .25s}
.ak-drop:hover,.ak-drop.over{background:rgba(7,63,137,.1);transform:scale(1.01)}
.ak-c{position:absolute;width:22px;height:22px;border:3px solid var(--y)}
.ak-c.c1{left:10px;top:10px;border-right:0;border-bottom:0}.ak-c.c2{right:10px;top:10px;border-left:0;border-bottom:0}.ak-c.c3{left:10px;bottom:10px;border-right:0;border-top:0}.ak-c.c4{right:10px;bottom:10px;border-left:0;border-top:0}
.ak-dic{width:68px;height:68px;border-radius:50%;background:var(--y);color:#fffffd;display:grid;place-items:center}
@keyframes ak-bob{50%{transform:translateY(-8px)}}
.ak-dt{font-family:var(--font-display,inherit);font-weight:700;font-size:1.35rem;text-transform:uppercase;padding:0 16px;word-break:break-word}
.ak-dh{font-size:.88rem;color:rgba(20,33,58,.6)}
.ak-dbeam{position:absolute;left:0;right:0;top:0;height:3px;background:var(--y);box-shadow:0 0 24px 6px rgba(7,63,137,.7);opacity:0}
.ak-drop.scan .ak-dbeam{opacity:1;animation:ak-dscan .9s ease-in-out infinite alternate}
@keyframes ak-dscan{to{top:calc(100% - 3px)}}
.ak-fields{display:flex;flex-direction:column;gap:14px;min-height:300px}
.ak-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ak-fields label{display:flex;flex-direction:column;gap:6px}
.ak-fields label span{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--y)}
.ak-fields input,.ak-fields textarea{width:100%;background:rgba(255,255,253,.6);border:1px solid rgba(7,63,137,.2);border-radius:12px;color:var(--cream);padding:13px 14px;font:inherit;font-size:.95rem;outline:none;transition:border-color .2s,box-shadow .2s}
.ak-fields input:focus,.ak-fields textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(7,63,137,.2)}
.ak-fields input::placeholder,.ak-fields textarea::placeholder{color:rgba(20,33,58,.35)}
.ak-grow{flex:1}.ak-grow textarea{flex:1;min-height:150px;resize:none}
.ak-go{grid-column:1/-1;font-size:1.1rem;padding:18px}

.ak-res{margin-top:70px;border-radius:24px;background:var(--cream);color:#fffffd;padding:30px;position:relative;overflow:hidden;transition:opacity .3s,filter .3s;scroll-margin-top:90px}
.ak-res.wait{opacity:.35;filter:blur(3px)}
.ak-res-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ak-tag{background:#fffffd;color:var(--y);font-family:ui-monospace,Menlo,monospace;font-size:.72rem;font-weight:700;padding:6px 12px;border-radius:999px;letter-spacing:.06em}
.ak-tabs{display:flex;gap:6px;background:rgba(7,63,137,.1);padding:4px;border-radius:999px}
.ak-tabs button{border:0;background:transparent;font-weight:800;padding:7px 18px;border-radius:999px;cursor:pointer;font-size:.95rem;transition:background .2s,color .2s}
.ak-tabs button.on{background:#fffffd;color:var(--y)}
.ak-meme{margin:22px 0 6px;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;line-height:.95;font-size:clamp(2.1rem,5.8vw,4.6rem);letter-spacing:-.02em;text-shadow:3px 3px 0 var(--y)}
.ak-meme span{display:block;animation:ak-slam .6s cubic-bezier(.2,1.4,.4,1) both}
.ak-meme span.y{background:#fffffd;color:var(--y);display:inline-block;padding:0 .14em;text-shadow:none;transform:rotate(-1.2deg);animation-delay:.2s}
@keyframes ak-slam{from{opacity:0;transform:scale(1.5) translateY(-20px)}}
.ak-res-grid{display:grid;grid-template-columns:230px 1fr;gap:34px;align-items:center;margin-top:20px}
.ak-gauge{text-align:center;position:relative}
.ak-gauge svg{width:210px;height:210px;transform:rotate(-90deg)}
.ak-gauge circle{fill:none;stroke-width:11}
.ak-gauge .bg{stroke:rgba(7,63,137,.12)}
.ak-gauge .fg{stroke:#073f89;stroke-linecap:round;animation:ak-dash 1.1s cubic-bezier(.2,.8,.2,1) both}
.ak-gauge.good .fg{stroke:#0a7a2f}.ak-gauge.bad .fg{stroke:#c4230f}
@keyframes ak-dash{from{stroke-dashoffset:339.3}to{stroke-dashoffset:var(--to)}}
.ak-num{position:absolute;left:0;right:0;top:50px;height:110px;display:flex;align-items:baseline;justify-content:center;padding-top:22px}
.ak-num b{font-family:var(--font-display,inherit);font-size:4.4rem;line-height:1;font-weight:800}
.ak-num span{font-weight:700;opacity:.5;margin-left:2px}
.ak-gauge p{margin:6px 0 0;font-weight:600;font-size:.95rem}
.ak-bars{display:flex;flex-direction:column;gap:12px}
.ak-bar{display:grid;grid-template-columns:86px 1fr 54px;align-items:center;gap:12px;font-weight:700;font-size:.95rem;opacity:0;animation:ak-fade .5s ease both;animation-delay:calc(var(--i)*.09s + .3s)}
.ak-bar .tr{height:14px;background:rgba(7,63,137,.12);border-radius:99px;overflow:hidden}
.ak-bar i{display:block;height:100%;width:var(--w);border-radius:99px;transform-origin:left;animation:ak-grow 1s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*.09s + .35s)}
.ak-bar i.g{background:#0a7a2f}.ak-bar i.m{background:#073f89}.ak-bar i.b{background:#c4230f}
.ak-bar em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}
@keyframes ak-grow{from{transform:scaleX(0)}}
@keyframes ak-fade{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
.ak-fixes{margin-top:30px;border-top:2px solid #073f89;padding-top:18px}
.ak-fixes h4{font-family:var(--font-display,inherit);text-transform:uppercase;font-size:1.3rem;margin:0 0 12px}
.ak-fix{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:start;padding:12px 0;border-bottom:1px dashed rgba(7,63,137,.25);opacity:0;animation:ak-fade .5s ease both;animation-delay:calc(var(--i)*.12s + .8s)}
.ak-fix b{display:block;font-size:1rem}.ak-fix p{margin:3px 0 0;font-size:.93rem;color:rgba(255,255,253,.72)}
.ak-ft{display:inline-flex;align-items:center;gap:5px;justify-content:center;font-size:.68rem;font-weight:800;letter-spacing:.05em;padding:6px 8px;border-radius:99px;white-space:nowrap}
.ak-ft.a{background:#0a7a2f;color:#073f89}.ak-ft.n{background:#fffffd;color:var(--y)}.ak-ft.c{background:transparent;border:2px solid #073f89}
.ak-fn{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:22px;font-weight:600;font-size:.92rem}
.ak-fn .ak-btn{background:#fffffd;color:var(--y)}

.ak-how{padding-top:110px}
.ak-row{position:relative;display:grid;grid-template-columns:70px 1.2fr 1fr;gap:20px;align-items:center;padding:30px 0;border-top:1px solid rgba(7,63,137,.2);transition:padding-left .3s,background .3s}
.ak-row:hover{padding-left:16px;background:linear-gradient(90deg,rgba(7,63,137,.1),transparent)}
.ak-row .n{font-family:ui-monospace,Menlo,monospace;color:var(--y)}
.ak-row h3{margin:0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(1.8rem,4.4vw,3.6rem);line-height:1}
.ak-row h3.out{color:transparent;-webkit-text-stroke:1.5px var(--cream)}.ak-row h3.yel{color:var(--y)}
.ak-row p{margin:0;color:rgba(20,33,58,.7);font-size:1.02rem;line-height:1.5}
.ak-end{padding:110px 0 120px;text-align:center}
.ak-end h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(2.8rem,8vw,6.6rem);line-height:.95;margin:0 0 30px}
.ak-end h2 span{color:var(--y)}

@media(max-width:820px){
.ak-wrap{padding:0 16px}
.ak-hero{padding:34px 0 20px}
.ak-hero-grid{grid-template-columns:1fr;gap:6px}
.ak-h1{font-size:clamp(2.7rem,14.5vw,4.4rem)}
.ak-out{-webkit-text-stroke:1.5px var(--cream)}
.ak-sub{font-size:1rem}
.ak-paper-wrap{min-height:300px;margin-top:10px}.ak-paper{width:210px}
.ak-pin{font-size:.66rem;padding:5px 9px}.ak-pin.p2{right:0}.ak-pin.p4{right:0}
.ak-mq-in span{font-size:1rem;padding:10px 0}
.ak-check{padding-top:60px}
.ak-panel{grid-template-columns:1fr;padding:14px;gap:14px}
.ak-drop{min-height:200px}
.ak-fields{min-height:0}.ak-two{grid-template-columns:1fr}
.ak-res{margin-top:44px;padding:18px;border-radius:18px}
.ak-res-grid{grid-template-columns:1fr;gap:18px}
.ak-gauge svg{width:180px;height:180px;display:block;margin:0 auto}.ak-num{top:36px;left:50%;right:auto;width:180px;transform:translateX(-50%)}.ak-num b{font-size:3.6rem}
.ak-bar{grid-template-columns:70px 1fr 48px;font-size:.88rem}
.ak-fix{grid-template-columns:1fr;gap:6px}.ak-ft{justify-self:start;padding:5px 10px}
.ak-fn{flex-direction:column;align-items:stretch;text-align:center}.ak-fn .ak-btn{width:100%}
.ak-how{padding-top:70px}
.ak-row{grid-template-columns:44px 1fr;gap:6px 12px;padding:22px 0}.ak-row p{grid-column:2}
.ak-end{padding:70px 0 90px}
}

@media(min-width:821px){
.ak-wrap{max-width:1560px;padding:0 48px}
.ak-hero{padding:72px 0 56px}
.ak-hero-grid{grid-template-columns:1.1fr .9fr}
.ak-h1{font-size:clamp(4rem,7.6vw,8.4rem)}
.ak-sub{max-width:40rem;font-size:1.3rem}
.ak-paper-wrap{min-height:540px}.ak-paper{width:370px}
.ak-pin{font-size:.86rem;padding:9px 14px}
.ak-mq-in span{font-size:1.5rem;padding:16px 0}
.ak-h2{font-size:clamp(2.6rem,5vw,5rem)}
.ak-panel{padding:36px;gap:32px;border-radius:30px;box-shadow:0 0 90px rgba(7,63,137,.12)}
.ak-drop{min-height:500px;border-radius:20px}
.ak-fields{min-height:500px;gap:18px}
.ak-fields label span{font-size:.8rem}
.ak-fields input,.ak-fields textarea{padding:18px 20px;font-size:1.1rem;border-radius:14px}
.ak-grow textarea{min-height:250px}
.ak-dic{width:96px;height:96px}.ak-dt{font-size:2rem}.ak-dh{font-size:1rem}
.ak-go{font-size:1.45rem;padding:26px}
.ak-stage{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1fr);gap:28px;align-items:start}
.ak-res{margin-top:0;padding:22px;border-radius:20px;position:sticky;top:84px}
.ak-meme{font-size:clamp(1.5rem,2vw,2.1rem);margin:14px 0 4px;text-shadow:2px 2px 0 var(--y)}
.ak-res-grid{grid-template-columns:1fr;gap:12px;margin-top:10px}
.ak-gauge svg{width:130px;height:130px}.ak-num{top:20px;height:90px;padding-top:14px}.ak-num b{font-size:2.8rem}.ak-gauge p{font-size:.85rem}
.ak-bars{gap:8px}.ak-bar{grid-template-columns:70px 1fr 46px;font-size:.85rem;gap:10px}.ak-bar .tr{height:10px}
.ak-fixes{margin-top:16px;padding-top:12px}.ak-fixes h4{font-size:1rem;margin-bottom:6px}
.ak-fix{grid-template-columns:1fr;gap:4px;padding:8px 0}.ak-fix b{font-size:.9rem}.ak-fix p{font-size:.82rem}
.ak-ft{justify-self:start;font-size:.62rem;padding:4px 8px}
.ak-fn{flex-direction:column;align-items:stretch;text-align:center;gap:10px;font-size:.8rem;margin-top:14px}.ak-fn .ak-btn{width:100%}
.ak-tabs button{padding:5px 14px;font-size:.85rem}
.ak-row h3{font-size:clamp(2.4rem,4.6vw,4.4rem)}
.ak-row{padding:38px 0}
}

@media(max-width:820px){
.ak-res{padding:14px}
.ak-res-top{gap:8px}
.ak-meme{font-size:1.6rem;margin:12px 0 2px;text-shadow:2px 2px 0 var(--y)}
.ak-res-grid{grid-template-columns:104px 1fr;gap:14px;margin-top:8px}
.ak-gauge svg{width:104px;height:104px}
.ak-num{top:16px;width:104px;height:72px;padding-top:10px}.ak-num b{font-size:2rem}.ak-num span{font-size:.7rem}
.ak-gauge p{display:none}
.ak-bars{gap:6px}.ak-bar{grid-template-columns:60px 1fr 38px;gap:8px;font-size:.76rem}.ak-bar .tr{height:8px}
.ak-fixes{margin-top:12px;padding-top:10px}.ak-fixes h4{font-size:.95rem;margin-bottom:2px}
.ak-fix{grid-template-columns:86px 1fr;gap:10px;padding:8px 0}
.ak-fix b{font-size:.85rem}.ak-fix p{font-size:.76rem;margin-top:1px}
.ak-ft{font-size:.58rem;padding:4px 6px;justify-self:stretch}
.ak-fn{margin-top:12px;gap:8px}.ak-fn>span{display:none}
}

@media(min-width:821px){
.ak-wrap{max-width:1720px;padding:0 56px}
.ak-drop{min-height:560px}.ak-fields{min-height:560px}.ak-grow textarea{min-height:300px}
.ak-dt{font-size:1.7rem}
.ak-res-grid{grid-template-columns:120px 1fr;gap:16px;align-items:center}
.ak-gauge svg{width:120px;height:120px;display:block;margin:0 auto}
.ak-num{top:14px;left:0;right:0;width:auto;height:80px;padding-top:12px}.ak-num b{font-size:2.4rem}
.ak-gauge p{display:none}
.ak-fn>span{display:none}
}

.ak-headrow{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:34px}
.ak-headrow .ak-h2{margin:0}
.ak-smp{background:var(--y);color:#fffffd;border:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:800;font-size:1rem;padding:12px 18px;border-radius:6px;cursor:pointer;transform:rotate(-2deg);transition:transform .2s;letter-spacing:.02em}
.ak-smp:hover{transform:rotate(1deg) scale(1.06)}
.ak-dl{width:34px;height:34px;border-radius:50%;border:2px solid #073f89;background:transparent;color:#fffffd;display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s}
.ak-dl:hover{background:#fffffd;color:var(--y)}
.ak-res-top{justify-content:flex-start}.ak-tabs{margin-left:auto}
.ak-idle{display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;min-height:240px;padding:16px}
.ak-idle b{font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;font-size:2.2rem;line-height:1;color:transparent;-webkit-text-stroke:1.5px var(--cream)}
.ak-idle p{margin:0;color:rgba(20,33,58,.7);max-width:22rem}
.ak-res.idle{background:transparent;color:var(--cream);border:2px dashed rgba(7,63,137,.45)}
.ak-res.idle>*:not(.ak-idle){display:none}
.ak-res.idle .ak-idle{display:flex}
.ak-check{scroll-margin-top:60px}
@media(min-width:821px){
.ak-check{padding-top:140px}
.ak-stage{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px}
.ak-panel{grid-template-columns:1fr;gap:18px;padding:30px}
.ak-drop{min-height:240px}
.ak-fields{min-height:0}
.ak-grow textarea{min-height:190px}
.ak-go{font-size:1.3rem;padding:22px}
.ak-res{padding:28px}
.ak-res.idle{min-height:640px;align-items:center;display:flex}
.ak-idle b{font-size:3.4rem}
.ak-meme{font-size:clamp(1.8rem,2.4vw,2.8rem)}
.ak-res-grid{grid-template-columns:150px 1fr;gap:22px}
.ak-gauge svg{width:150px;height:150px}.ak-num{top:20px;height:100px;padding-top:16px}.ak-num b{font-size:3rem}
.ak-bar{font-size:.95rem;grid-template-columns:78px 1fr 50px}
.ak-fix b{font-size:1rem}.ak-fix p{font-size:.9rem}
}

.ak-smp.in{position:absolute;top:16px;right:52px;z-index:3;font-size:.85rem;padding:9px 14px}
@media(max-width:820px){
.ak-smp.in{top:14px;right:46px;font-size:.78rem;padding:8px 11px}
.ak-res-grid{grid-template-columns:1fr;gap:8px;margin-top:6px}
.ak-gauge svg{width:120px;height:120px;display:block;margin:0 auto}
.ak-num{top:14px;left:0;right:0;width:auto;transform:none;height:80px;padding-top:12px}.ak-num b{font-size:2.3rem}.ak-num span{font-size:.75rem}
.ak-gauge p{display:block;font-size:.8rem;margin:2px 0 0}
.ak-bars{gap:5px}.ak-bar{grid-template-columns:70px 1fr 42px;font-size:.78rem}
}

.ak-meme span.y{transform:none}
.ak-smp{transform:none}.ak-smp:hover{transform:scale(1.05)}
@media(min-width:821px){
.ak-stage{grid-template-columns:minmax(0,7fr) minmax(0,3fr);gap:28px}
.ak-panel{grid-template-columns:1fr 1fr;padding:34px;gap:28px}
.ak-drop{min-height:520px}.ak-fields{min-height:520px}.ak-grow textarea{min-height:280px}
.ak-res{padding:22px}.ak-res.idle{min-height:520px}
.ak-meme{font-size:clamp(1.5rem,2vw,2.1rem)}
.ak-res-grid{grid-template-columns:120px 1fr;gap:16px}
.ak-gauge svg{width:120px;height:120px}.ak-num{top:14px;height:80px;padding-top:12px}.ak-num b{font-size:2.4rem}
.ak-bar{font-size:.85rem;grid-template-columns:70px 1fr 46px}
.ak-fix b{font-size:.9rem}.ak-fix p{font-size:.82rem}
.ak-gauge p{display:none}
.ak-idle b{font-size:2.6rem}
}
@media(max-width:820px){.ak-drop{padding-bottom:30px}.ak-smp.in{top:auto;bottom:14px;right:auto;left:50%;margin-left:-64px;font-size:.85rem;padding:10px 14px;white-space:nowrap}}

.ak-smp.go{font-size:.9rem;padding:9px 14px;vertical-align:middle;margin-left:8px;text-transform:none;white-space:nowrap;letter-spacing:.02em}
.ak-gap{position:relative;margin:110px 0 40px;overflow:hidden;padding:30px 0}
.ak-bw{white-space:nowrap;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(2.6rem,9vw,7.4rem);line-height:1.05;color:var(--cream);margin-left:-8%}
.ak-bw b{color:var(--y);display:inline-block;animation:ak-spin 6s linear infinite}
.ak-bw.out{color:transparent;-webkit-text-stroke:2px var(--cream)}
@keyframes ak-spin{to{transform:rotate(360deg)}}
.ak-chips{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin:26px 0;padding:0 20px}
.ak-chip{font-family:ui-monospace,Menlo,monospace;font-weight:800;text-transform:uppercase;font-size:.85rem;padding:11px 16px;border:2px solid var(--cream);border-radius:999px;animation:ak-bob 3.4s ease-in-out infinite}
.ak-chip.y{background:var(--y);color:#fffffd;border-color:var(--y);animation-delay:-1.4s}
@keyframes ak-bob{50%{transform:translateY(-8px)}}
.ak-how{padding-top:80px}
@media(min-width:821px){.ak-h2{font-size:clamp(2rem,3.7vw,3.7rem)}.ak-gap{margin-top:150px}.ak-how{padding-top:110px}.ak-chip{font-size:1rem}}
@media(max-width:820px){
.ak-res-grid{grid-template-columns:1fr 1fr;gap:10px;align-items:center}
.ak-gauge svg{width:116px;height:116px}.ak-num{top:14px;height:80px;padding-top:12px}.ak-num b{font-size:2.2rem}
.ak-bars{gap:7px}.ak-bar{grid-template-columns:52px 1fr 34px;gap:6px;font-size:.68rem}.ak-bar .tr{height:7px}
.ak-gauge p{display:block;font-size:.72rem;margin:2px 0 0}
.ak-gap{margin-top:120px}
}

.ak-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);-webkit-text-stroke:0;font-weight:400;font-size:1.15em;letter-spacing:-.01em;line-height:.95}
.ak-h2b{line-height:1;margin:0}
.ak-h2 span.d1{display:block;color:var(--cream);font-size:clamp(3rem,13vw,4.4rem);line-height:.95}
.ak-h2 span.d2{display:block;color:var(--y);font-size:clamp(1.3rem,5.6vw,2.2rem);line-height:1.1;margin-top:6px}
.ak-h2 span.d3{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px 22px;margin-top:8px}.ak-h2 span.d3 span.d2{display:inline;margin:0}.ak-h2 span.d3 .ak-smp{align-self:center}
.ak-h2 span.go2{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;font-weight:400;color:var(--y);font-size:clamp(4rem,19vw,5.4rem);line-height:.9}
.ak-smp.go{font-family:var(--font-display,inherit);font-size:1.05rem;padding:14px 22px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em;font-weight:800;box-shadow:5px 5px 0 var(--cream);display:inline-flex;align-items:center;gap:8px;margin:0;vertical-align:middle;animation:ak-nudge 2.4s ease-in-out infinite;transition:box-shadow .2s}
.ak-smp.go:hover{animation-play-state:paused;transform:none;box-shadow:8px 8px 0 var(--cream)}
@keyframes ak-nudge{50%{transform:translateY(-5px)}}
.ak-res.idle{background:transparent;color:var(--cream);border:2px dashed rgba(7,63,137,.45);padding:24px}
.ak-idle{align-items:stretch;justify-content:flex-start;text-align:left;gap:18px;min-height:0}
.ak-sk{display:grid;grid-template-columns:96px 1fr;gap:18px;align-items:center}
.ak-sk .ring{display:block;width:96px;height:96px;border-radius:50%;border:10px solid rgba(7,63,137,.1);border-top-color:var(--y);animation:ak-rot 1.1s linear infinite}
.ak-sk .bars{display:flex;flex-direction:column;gap:10px}
.ak-sk .bars i,.ak-sl i{display:block;height:11px;border-radius:99px;width:var(--w,100%);background:linear-gradient(90deg,rgba(7,63,137,.08) 25%,rgba(7,63,137,.3) 50%,rgba(7,63,137,.08) 75%);background-size:200% 100%;animation:ak-shim 1.4s linear infinite;animation-delay:calc(var(--i)*.12s)}
.ak-sl{display:flex;flex-direction:column;gap:12px}.ak-sl i{height:38px;border-radius:12px}
.ak-idle p{font-family:ui-monospace,Menlo,monospace;color:var(--y);text-align:center;margin:4px 0 0;max-width:none}
@keyframes ak-rot{to{transform:rotate(360deg)}}
@keyframes ak-shim{to{background-position:-200% 0}}
@media(min-width:821px){
.ak-h2 span.d1{font-size:clamp(4.4rem,6.6vw,7rem)}
.ak-h2 span.d2{font-size:clamp(2.4rem,4vw,4.2rem);margin-top:8px;position:relative;top:-.14em}
.ak-h2 span.go2{font-size:clamp(5.6rem,8vw,9rem);-webkit-text-stroke:.025em var(--y)}
.ak-smp.go{font-size:1.35rem;padding:20px 34px;box-shadow:7px 7px 0 var(--cream)}
.ak-headrow{margin-bottom:44px}
.ak-stage{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;align-items:stretch}
.ak-panel{grid-template-columns:1fr;padding:28px;gap:20px}
.ak-drop{min-height:230px}.ak-fields{min-height:0}.ak-grow textarea{min-height:170px}
.ak-res{position:relative;top:auto;margin-top:0;padding:26px}
.ak-res.idle{min-height:0;padding:34px}
.ak-sk{grid-template-columns:150px 1fr;gap:26px}.ak-sk .ring{width:150px;height:150px;border-width:13px}
.ak-sl i{height:56px}.ak-sk .bars{gap:14px}.ak-sk .bars i{height:14px}
.ak-idle{gap:28px;justify-content:center}
.ak-res-grid{grid-template-columns:150px 1fr;gap:22px}
.ak-gauge svg{width:150px;height:150px}.ak-num{top:20px;height:100px;padding-top:16px}.ak-num b{font-size:3rem}
.ak-bar{font-size:.95rem;grid-template-columns:78px 1fr 50px}
.ak-gauge p{display:block;font-size:.85rem}
.ak-fix b{font-size:1rem}.ak-fix p{font-size:.9rem}
}

.ak-res.idle .ak-idle{width:100%;max-width:none;box-sizing:border-box}.ak-idle>*{width:100%;align-self:stretch}
.ak-smp.go.open{background:var(--cream)}
.ak-smp.go.open svg{transform:rotate(90deg)}
@media(max-width:820px){
.ak-res.idle{display:none}.ak-drop{padding-top:30px}.ak-gap{margin:34px 0 10px!important;padding:4px 0}.ak-gap .ak-chips{margin:28px 0;gap:10px}
.ak-hero-grid>div:first-child{position:relative;z-index:2}
.ak-paper-wrap{position:absolute;left:0;right:0;top:36px;height:500px;min-height:0;margin:0;opacity:.13;z-index:1;pointer-events:none}
.ak-paper-wrap .ak-paper{width:300px}
.ak-paper-wrap .ak-pin{display:none}
.ak-h2 span.d1{font-size:clamp(3rem,14vw,4rem)}
.ak-h2 span.d2{font-size:clamp(1.25rem,5.4vw,1.7rem);letter-spacing:.01em}
.ak-h2 span.d3{flex-wrap:wrap;gap:6px 14px;margin-top:10px;justify-content:flex-start}
.ak-h2 span.go2{font-size:3.4rem;flex:none;-webkit-text-stroke:.025em var(--y)}
.ak-smp.go{font-size:.95rem;padding:14px 18px;white-space:nowrap}
}
.ak-pvbar{display:flex;margin-top:22px;gap:0}
.ak-pv{flex:1;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--y);color:#fffffd;border:3px solid #073f89;border-radius:14px;padding:18px 20px;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;letter-spacing:.05em;font-size:1.2rem;cursor:pointer;box-shadow:5px 5px 0 #073f89;animation:ak-pvp 2.2s ease-in-out infinite}
.ak-pv:hover{background:#fffffd;color:var(--y)}
@keyframes ak-pvp{50%{box-shadow:5px 5px 0 #073f89,0 0 0 7px rgba(7,63,137,.55)}}
.ak-dl2{display:none}.ak-dl2-t{display:none}
.ak-gate{position:relative;background:var(--cream);color:#fffffd;border:3px solid #073f89;border-radius:18px;padding:34px 26px 26px;width:min(92vw,420px);margin:auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;box-shadow:6px 6px 0 var(--y)}.ak-gate h3{margin:0;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;font-size:1.6rem;line-height:1.05}.ak-gate p{margin:0;font-size:.95rem}.ak-gate .ak-btn{width:100%;box-sizing:border-box;background:#fffffd;color:var(--y)}.ak-gate .ak-btn:after{display:none}.ak-gate .ak-pmx{position:absolute;top:10px;right:10px}.ak-gate-s{color:#fffffd;font-weight:700;text-decoration:underline;font-size:.95rem}
@media(min-width:821px){.ak-go.ak-btn{align-self:end;height:64px;padding:0 20px;font-size:1.15rem;border-radius:14px}.ak-res .ak-dl{display:none}.ak-res{padding-bottom:108px}.ak-pvbar,.ak-res.idle>.ak-pvbar{display:flex!important;position:absolute;left:18px;right:18px;bottom:114px;margin:0;gap:8px;background:transparent;height:68px;z-index:3}.ak-res .ak-pv{border:3px solid #073f89;border-radius:14px;box-shadow:none;animation:none;height:100%;padding:0 20px;font-size:1.3rem}.ak-res .ak-dl2{display:grid;place-items:center;flex:0 0 100px;width:100px;background:var(--y);color:#fffffd;border:3px solid #073f89;border-radius:14px;cursor:pointer}.ak-res .ak-dl2:hover{background:var(--cream)}}
@media(max-width:820px){.ak-res .ak-dl{display:none}.ak-pvbar{margin:16px 0 0;gap:10px;flex-direction:column}.ak-pv{flex:none;width:100%;border:3px solid #073f89;border-radius:14px;box-shadow:none;animation:none;padding:18px 12px;font-size:1.1rem;gap:8px}.ak-dl2{display:flex;flex:none;width:100%;min-width:0;align-items:center;justify-content:center;gap:10px;padding:16px 12px;background:#fffffd;color:var(--y);border:3px solid #073f89;border-radius:14px;cursor:pointer;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;font-size:1.1rem}.ak-dl2-t{display:inline}}

.ak-err{margin:0;color:#ff8a7a;font-weight:700;font-size:.9rem}
.ak-kw{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.ak-kw em{font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:.78rem;background:#fffffd;color:var(--y);padding:4px 9px;border-radius:99px}
.ak-scroll{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;max-height:640px;padding-right:6px}
.ak-pv.hl{background:var(--cream);color:#fffffd;animation:ak-hl 1.1s ease-in-out 3}
@keyframes ak-hl{50%{transform:scale(1.04)}}
@media(min-width:821px){.ak-res{grid-row:1;grid-column:2}.ak-res .ak-scroll{position:absolute;left:26px;right:20px;top:26px;bottom:90px;max-height:none}}
.ak-pm{position:fixed;inset:0;z-index:1000;background:rgba(255,255,253,.78);display:flex;align-items:center;justify-content:center;padding:16px;animation:ak-fade .2s ease both}
.ak-pmc{position:relative;background:var(--cream);color:#fffffd;border-radius:20px;border:3px solid var(--y);width:min(1080px,96vw);height:min(76vh,720px);display:grid;grid-template-columns:300px 1fr;overflow:hidden}
.ak-pmx{position:absolute;top:10px;right:10px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;background:#fffffd;color:var(--y);display:grid;place-items:center;cursor:pointer}
.ak-pml{background:#fffffd;color:var(--cream);padding:26px 22px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;overflow-y:auto}
.ak-pml .ak-tag{background:var(--y);color:#fffffd}
.ak-pmt{font-weight:700;font-size:.95rem;color:var(--y)}
.ak-pmg{position:relative;width:170px;height:170px}.ak-pmg svg{width:170px;height:170px;transform:rotate(-90deg)}
.ak-pmg circle{fill:none;stroke-width:12}.ak-pmg .bg{stroke:rgba(7,63,137,.14)}.ak-pmg .fg{stroke:var(--y);stroke-linecap:round}
.ak-pmg.good .fg{stroke:#2ecc71}.ak-pmg.bad .fg{stroke:#ff5a43}
.ak-pmn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:0}.ak-pmn b{font-size:3.4rem;line-height:1;font-family:var(--font-display,inherit)}.ak-pmn span{opacity:.7;margin-left:2px}
.ak-pml p{margin:0;font-weight:600}
.ak-pmd{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--y);color:#fffffd;border:0;border-radius:12px;padding:16px 18px;width:100%;font-weight:800;text-transform:uppercase;letter-spacing:.04em;cursor:pointer}
.ak-hint{margin:8px 2px 0;font-size:.82rem;opacity:.65;text-align:center}
.ak-pmt2{margin-top:10px;background:#fffffd;color:var(--y);text-decoration:none;border:2px solid var(--y)}
.ak-gauge{display:grid;justify-items:center}.ak-gauge svg{grid-area:1/1;margin:0}.ak-gauge .ak-num{grid-area:1/1;align-self:center;position:static;top:auto;left:auto;right:auto;width:auto;height:auto;padding:0;transform:none;display:flex;flex-direction:column;align-items:center;justify-content:center}.ak-gauge .ak-num b{line-height:1}.ak-gauge .ak-num span{margin:2px 0 0}.ak-gauge p{grid-area:2/1}
.ak-pmr{padding:28px 30px;overflow-y:auto;overscroll-behavior:contain}
.ak-pmr h4{font-family:var(--font-display,inherit);text-transform:uppercase;font-size:1.15rem;margin:0 0 12px}.ak-pmr h4:not(:first-child){margin-top:26px;border-top:2px solid #073f89;padding-top:18px}
.ak-pmb{display:grid;grid-template-columns:90px 1fr 54px;align-items:center;gap:12px;font-weight:700;font-size:.95rem;margin-bottom:10px}
.ak-pmb .tr{height:12px;background:rgba(7,63,137,.12);border-radius:99px;overflow:hidden}.ak-pmb i{display:block;height:100%;border-radius:99px}.ak-pmb i.g{background:#0a7a2f}.ak-pmb i.m{background:#073f89}.ak-pmb i.b{background:#c4230f}.ak-pmb em{font-style:normal;text-align:right}
.ak-pmf{display:grid;grid-template-columns:104px 1fr;gap:14px;padding:11px 0;border-bottom:1px dashed rgba(7,63,137,.25)}.ak-pmf b{display:block}.ak-pmf p{margin:3px 0 0;font-size:.92rem;color:rgba(255,255,253,.75)}
.ak-pmn2{font-size:.8rem;opacity:.7;margin:18px 0 0}
.ak-gauge .ak-num{top:0!important;bottom:0!important;height:auto!important;padding:0!important;left:0!important;right:0!important;width:auto!important;transform:none!important;flex-direction:column;align-items:center;justify-content:center}.ak-gauge .ak-num span{margin:2px 0 0!important;line-height:1}.ak-pmn span{margin:2px 0 0!important;line-height:1}
.ak-rb{margin-top:22px}.ak-rbs{margin:0 0 10px;font-size:.85rem;opacity:.75}.ak-rbg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ak-rbg>div{border:2px solid #073f89;border-radius:10px;padding:8px 10px;min-width:0}.ak-rbg>div.no{border-style:dashed;background:rgba(214,60,40,.08)}.ak-rbg span{display:block;font-family:ui-monospace,Menlo,monospace;font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.65}.ak-rbg b{display:block;font-size:.88rem;overflow-wrap:anywhere}.ak-rbg .no b{color:#b3261e}
.ak-rbc{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.ak-rbc span{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;border-radius:999px;padding:4px 10px;border:2px solid #073f89}.ak-rbc .ok{background:#fffffd;color:var(--y)}.ak-rbc .no{border-style:dashed;opacity:.65}
.ak-rbl{margin:10px 0 0;padding-left:18px;font-size:.85rem}.ak-rbw{margin:10px 0 0;font-size:.88rem;font-weight:700;color:#b3261e}
.ak-rbt{margin-top:12px}.ak-rbt summary{cursor:pointer;font-weight:700;font-size:.9rem}.ak-rbt pre{margin:8px 0 0;max-height:240px;overflow:auto;background:#fffffd;color:#073f89;border-radius:10px;padding:12px;font-size:.75rem;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
@media(max-width:820px){.ak-rbg{grid-template-columns:minmax(0,1fr)}}
@media(max-width:820px){.ak-scroll{padding-right:12px}.ak-res-grid>*{min-width:0}.ak-bars{min-width:0}.ak-bar{grid-template-columns:50px minmax(0,1fr) 42px!important;gap:5px!important;font-size:.64rem!important}.ak-bar em{white-space:nowrap}.ak-pmc{display:block;width:92vw;height:auto;max-height:78vh;overflow-y:auto;overscroll-behavior:contain}.ak-pml{overflow:visible;padding:22px 18px}.ak-pmd{margin-top:6px}.ak-pmt2{margin-top:10px}.ak-pmr{padding:18px;overflow:visible}.ak-pmg,.ak-pmg svg{width:130px;height:130px}.ak-pmn{padding-top:36px}.ak-pmn b{font-size:2.6rem}.ak-pmf{grid-template-columns:1fr;gap:6px}.ak-pmf .ak-ft{justify-self:start}.ak-pmb{grid-template-columns:70px 1fr 44px}.ak-pmx{position:sticky;float:right;top:8px;width:34px;height:34px;margin:8px 8px -42px 0;box-shadow:0 0 0 4px var(--cream)}.ak-pmr{padding-right:18px}}

.ak-tail{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:#fffffd;color:var(--y);border:4px solid var(--y);border-radius:16px;padding:18px 16px;text-decoration:none;text-align:center;position:relative;isolation:isolate;margin-top:16px;box-shadow:6px 6px 0 var(--y);transition:transform .15s}
.ak-tail:hover{transform:translate(-2px,-2px)}
.ak-tail:before{content:"";position:absolute;inset:-4px;border-radius:18px;border:4px solid var(--y);z-index:-1;pointer-events:none;will-change:transform,opacity;animation:ak-tpulse 2s ease-out infinite}
@keyframes ak-tpulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.07,1.25);opacity:0}}
.ak-tail-t{display:flex;align-items:center;gap:10px;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;letter-spacing:.03em;font-size:1.65rem;line-height:1}
.ak-tail-s{font-size:.82rem;font-weight:600;color:var(--cream);opacity:.85}
.ak-res.idle .ak-tail{display:none}
@media(min-width:821px){.ak-tail{position:absolute;left:18px;right:18px;bottom:18px;margin:0;height:84px;z-index:3;box-shadow:5px 5px 0 var(--y)}.ak-tail-t{font-size:1.9rem}.ak-res .ak-scroll{bottom:204px!important}}
@media(max-width:820px){.ak-tail{padding:20px 12px;margin:10px 0 0;width:100%;box-sizing:border-box;border-width:3px;box-shadow:none}.ak-tail:before{display:none}.ak-tail-t{font-size:1.6rem}.ak-tail-s{font-size:.78rem}}
@media(prefers-reduced-motion:reduce){.ak *{animation-duration:.01s!important;animation-iteration-count:1!important;transition-duration:.01s!important}.ak-rv{opacity:1;transform:none}}
.ak-gauge .ak-num{position:static!important;grid-area:1/1!important;align-self:center!important;justify-self:center!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;margin:0!important;width:auto!important;height:auto!important;top:auto!important;transform:none!important}
.ak-pmg .ak-pmn{position:absolute!important;inset:0!important;top:0!important;bottom:0!important;left:0!important;right:0!important;width:auto!important;height:auto!important;padding:0!important;transform:none!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:row!important}
.ak-gauge{position:relative}
.ak-gauge .ak-num b,.ak-pmg .ak-pmn b{position:relative;display:block;line-height:1!important;margin:0!important;padding:0!important}
.ak-gauge .ak-num b span,.ak-pmg .ak-pmn b span{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin:4px 0 0!important;font-size:.85rem;font-weight:700;opacity:.55;line-height:1!important;white-space:nowrap}
@media(min-width:821px){.ak-res.idle>.ak-pvbar{bottom:18px!important}}
.ak-quota{grid-column:1/-1;margin:2px 0 0;text-align:center;font-size:.85rem;opacity:.75;font-weight:600}
.ak-panel{position:relative}
.ak-pill{position:absolute;top:-14px;right:18px;z-index:3;background:#073f89;color:#fffffd;font-weight:800;font-size:.78rem;letter-spacing:.02em;padding:6px 12px;border-radius:999px;box-shadow:0 4px 18px rgba(7,63,137,.25);white-space:nowrap}
@media(max-width:820px){.ak-pill{right:14px;font-size:.74rem;padding:5px 10px}}
`;



