import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "@/lib/toast";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Mail,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assertLooksLikeResume, assertValidResumeFile, extractPdfText, isPdfFile } from "@/lib/extract-pdf";
import { buildCoverLetterPdf, buildResumePdf, slug } from "@/lib/resume-pdf";
import { getUsage, tailorResume, type TailoredResume } from "@/lib/tailor.functions";
import { runQueued, queueMessage } from "@/lib/ai-queue";

import { tailorResumeAnonymous, captureLeadEmail } from "@/lib/anon-tailor.functions";
import { getDeviceId } from "@/lib/device-id";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { ResultSkeleton, TailorProgress, type TailorStage } from "@/components/TailorProgress";
import { UsageMeter } from "@/components/UsageMeter";
import { UpgradePopup } from "@/components/UpgradePopup";
import type { PlanTier } from "@/lib/plans";
import { TurnstileWidget, resetTurnstile } from "@/components/TurnstileWidget";

const ANON_USED_KEY = "gao_anon_used";
// Downloads unlock with a boolean flag only — the email itself is never kept
// in localStorage, where any injected script could read it.
const ANON_UNLOCK_KEY = "gao_anon_unlocked";
const LEGACY_ANON_EMAIL_KEY = "gao_anon_email";

type Usage = { used: number; limit: number; remaining: number };


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

function isDocx(f: File): boolean {
  const n = f.name.toLowerCase();
  return n.endsWith(".docx") || f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export function ResumeTailor() {
  const run = useServerFn(tailorResume);
  const runAnon = useServerFn(tailorResumeAnonymous);
  const saveEmail = useServerFn(captureLeadEmail);
  const loadUsage = useServerFn(getUsage);

  const { session, loading: sessionLoading } = useSession();
  const { isSubscribed, tier, loading: subLoading } = useSubscription();
  const [showUp, setShowUp] = useState(false);

  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!session) {
      setUsage(null);
      return;
    }
    loadUsage({}).then(setUsage).catch(() => setUsage(null));
  }, [session, loadUsage]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queueNote, setQueueNote] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [stage, setStage] = useState<TailorStage>("upload");
  const [downloading, setDownloading] = useState<"resume" | "cover" | null>(null);
  const [result, setResult] = useState<TailoredResume | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Logged-out ("anonymous") one-free-rewrite state
  const [anonUsed, setAnonUsed] = useState(false);
  const [anonUnlocked, setAnonUnlocked] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const pendingDownload = useRef<"resume" | "cover" | null>(null);

  useEffect(() => {
    try {
      setAnonUsed(window.localStorage.getItem(ANON_USED_KEY) === "1");
      const legacyEmail = window.localStorage.getItem(LEGACY_ANON_EMAIL_KEY);
      if (legacyEmail) window.localStorage.removeItem(LEGACY_ANON_EMAIL_KEY);
      setAnonUnlocked(window.localStorage.getItem(ANON_UNLOCK_KEY) === "1" || Boolean(legacyEmail));
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Carry-over from the ATS checker: prefill once, then clear it. Session only, never localStorage.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("gf-ats-carry");
      if (!raw) return;
      window.sessionStorage.removeItem("gf-ats-carry");
      const c = JSON.parse(raw) as { resume?: string; jd?: string; company?: string; role?: string; file?: string; t?: number };
      if (!c || typeof c.t !== "number" || Date.now() - c.t > 30 * 60 * 1000) return;
      if (typeof c.resume === "string") setResume(c.resume.slice(0, 60000));
      if (typeof c.file === "string") setFileName(c.file.slice(0, 120));
      if (typeof c.jd === "string") setJobDescription(c.jd.slice(0, 30000));
      if (typeof c.company === "string") setCompany(c.company.slice(0, 80));
      if (typeof c.role === "string") setRole(c.role.slice(0, 80));
    } catch {
      /* storage unavailable or bad data */
    }
  }, []);


  async function onFile(file: File | undefined) {
    if (!file) return;
    setParsing(true);
    try {
      // Type, size and real content are all checked before we parse anything.
      if (file.name.toLowerCase().endsWith(".doc")) throw new Error("Old .doc files can't be read. Save it as DOCX or PDF and try again.");
      if (isDocx(file) && (file.size === 0 || file.size > 8 * 1024 * 1024)) throw new Error("That file is empty or too big. Use one under 8 MB.");
      if (!isDocx(file)) await assertValidResumeFile(file);
      const text = isDocx(file) ? await docxText(file) : isPdfFile(file) ? await extractPdfText(file) : await file.text();
      if (text.trim().length < 30) throw new Error("Almost no text found — is this a scanned PDF?");
      assertLooksLikeResume(text);
      setResume(text);
      setFileName(file.name);
      toast.success(`Loaded ${file.name}`);
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? e.message
          : "Could not read that file. Try a PDF or DOCX.",
      );
    } finally {
      setParsing(false);
    }
  }

  async function onGenerate() {
    if (resume.trim().length < 30) return toast.error("Add your current resume first.");
    if (jobDescription.trim().length < 20) return toast.error("Paste the job description.");
    if (jobDescription.trim().length > 30000) return toast.error("That JD is doing too much 😄 Keep the key responsibilities and requirements, and paste again.");
    setLoading(true);
    setResult(null);
    setStage("upload");
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setStage("analyze"), 700),
      setTimeout(() => setStage("rewrite"), 3500),
      setTimeout(() => setStage("format"), 11000),
    ];
    setTimeout(
      () => document.getElementById("progress")?.scrollIntoView({ behavior: "smooth", block: "center" }),
      80,
    );
    setQueueNote(null);
    try {

      if (!session) {
        const out = await runAnon({
          data: {
            resume,
            jobDescription,
            company: company || undefined,
            role: role || undefined,
            deviceId: getDeviceId(),
            turnstileToken: captchaToken ?? undefined,
          },
        });
        // Tokens are single-use — clear and re-issue after every attempt.
        setCaptchaToken(null);
        resetTurnstile();
        timers.current.forEach(clearTimeout);
        setStage("done");
        setResult(out.result);
        setAnonUsed(true);
        try {
          window.localStorage.setItem(ANON_USED_KEY, "1");
        } catch {
          /* storage unavailable */
        }
      } else {
        // Under heavy load the AI gateway can answer with overload/timeout
        // errors — hold the request in a client-side queue instead of failing.
        const out = await runQueued(
          () =>
            run({
              data: { resume, jobDescription, company: company || undefined, role: role || undefined },
            }),
          {
            onWait: (info) => setQueueNote(queueMessage(info)),
            onResolved: () => setQueueNote(null),
          },
        );

        timers.current.forEach(clearTimeout);
        setStage("done");
        setResult(out.result);
        setUsage(out.usage);
      }
      toast.success("Your tailored resume is ready");
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      timers.current.forEach(clearTimeout);
      if (!session) {
        setCaptchaToken(null);
        resetTurnstile();
      }
      const message = e instanceof Error ? e.message : "Something went wrong";
      if (!session && /free rewrite/i.test(message)) {
        setAnonUsed(true);
        try {
          window.localStorage.setItem(ANON_USED_KEY, "1");
        } catch {
          /* storage unavailable */
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
      setQueueNote(null);
    }
  }

  async function buildAndSave(kind: "resume" | "cover") {
    if (!result) return;
    setDownloading(kind);
    try {
      const doc =
        kind === "resume"
          ? await buildResumePdf(result)
          : await buildCoverLetterPdf(result, company, role);
      doc.save(`${base}-${kind === "resume" ? "resume" : "cover-letter"}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build the PDF");
    } finally {
      setDownloading(null);
    }
  }

  async function download(kind: "resume" | "cover") {
    if (!result) return;
    // Logged-out visitors unlock downloads with an email, not a full sign-up.
    if (!session && !anonUnlocked) {
      pendingDownload.current = kind;
      setEmailOpen(true);
      return;
    }
    await buildAndSave(kind);
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = emailValue.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address.");
    setSavingEmail(true);
    try {
      await saveEmail({ data: { email, deviceId: getDeviceId(), source: "anonymous_tailor" } });
      setAnonUnlocked(true);
      try {
        window.localStorage.setItem(ANON_UNLOCK_KEY, "1");
      } catch {
        /* storage unavailable */
      }
      setEmailOpen(false);
      const kind = pendingDownload.current;
      pendingDownload.current = null;
      if (kind) await buildAndSave(kind);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your email");
    } finally {
      setSavingEmail(false);
    }
  }


  const base = `${slug(result?.name || "resume")}-${slug(company || role || "tailored")}`;

  return (
    <div className="tl tl-wrap w-full pb-24">
      <div id="tailor-form" className="tl-grid grid items-stretch gap-5 lg:grid-cols-2">
        <Card className="tl-card flex flex-col p-6">

          <div className="mb-4 flex items-center gap-2">
            <span className="tl-ic flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <FileText className="size-4" />
            </span>
            <div>
              <h2 className="tl-h text-base font-semibold">1. Your current resume</h2>
              <p className="text-xs text-muted-foreground">Dust off that old PDF or Word file</p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="tl-drop flex min-h-64 w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted"
          >
            {parsing ? (
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
            ) : resume.trim().length >= 30 ? (
              <span className="text-4xl" aria-hidden>🐱</span>
            ) : (
              <Upload className="size-7 text-muted-foreground" />
            )}
            <span className="text-base font-semibold">
              {parsing
                ? "Reading file…"
                : resume.trim().length >= 30
                  ? fileName || "Resume loaded"
                  : "Tap to upload your resume"}
            </span>
            <span className="text-xs text-muted-foreground">
              {resume.trim().length >= 30
                ? `Coco sniffed ${resume.trim().split(/\s+/).length} words. Tap to swap the file.`
                : "PDF, DOCX, TXT or MD. Old formatting welcome."}
            </span>
            {!parsing && resume.trim().length < 30 && (
              <span className="tl-wait mt-2 rounded-full border border-primary/40 px-3 py-1 text-xs text-primary">Coco is waiting to sniff it 🐾</span>
            )}
          </button>
        </Card>

        <Card className="tl-card flex flex-col p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="tl-ic flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Target className="size-4" />
            </span>
            <div>
              <h2 className="tl-h text-base font-semibold">2. The job you want</h2>
              <p className="text-xs text-muted-foreground">Paste the dream job post</p>
            </div>
          </div>

          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-xs">
                Company / brand
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs">
                Role
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
              />
            </div>
          </div>

          <Textarea
            aria-label="Target job description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the whole job post. Yes, even the boring about-us part."
            className="min-h-56 flex-1 resize-y text-sm"
          />
        </Card>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        {!sessionLoading && !session ? (
          anonUsed && !loading ? (
            <div className="mx-auto flex w-full max-w-md flex-col items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth" search={{ redirect: "/tailor" }}>
                  <Sparkles /> Create a free account to keep tailoring
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You've used your free rewrite. A free account gives you 5 tailored resumes and cover
                letters every month.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-md flex-col items-stretch">
              <TurnstileWidget onToken={setCaptchaToken} className="mb-3 flex justify-center" />
              <Button
                variant="hero"
                size="xl"
                className="w-full rounded-full shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
                onClick={onGenerate}
                disabled={loading || parsing}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {loading ? "Rebuilding your resume…" : "Rebuild resume + cover letter — free"}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No account needed for your first rewrite. ~15 seconds, quicker than chai.
              </p>
            </div>
          )
        ) : (

          <div className="mx-auto flex w-full max-w-md flex-col items-stretch">
            {usage ? <UsageMeter usage={usage} fun /> : null}
            <UpgradePopup open={showUp} onClose={() => setShowUp(false)} tier={(tier ?? "free") as PlanTier} feature="tailor" />
            {false ? (
              <Button
                variant="hero"
                size="xl"
                asChild
                className="mt-3 w-full rounded-full shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
              >
                <Link to="/pricing">
                  <Sparkles /> Upgrade for more to continue
                </Link>
              </Button>
            ) : (
            <Button
              variant="hero"
              size="xl"
              className="mt-3 w-full rounded-full shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
              onClick={() => { if (!isSubscribed && usage && usage.remaining === 0) setShowUp(true); else onGenerate(); }}
              disabled={loading || parsing}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Rebuilding your resume…" : !subLoading && !isSubscribed && usage && usage.remaining === 0 ? "Out of rewrites. Upgrade to keep tailoring" : "Rebuild resume + cover letter"}
            </Button>
            )}
            {!subLoading && !isSubscribed && usage && usage.remaining === 0 ? (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                You have tailored {usage.used} of {usage.limit} this month.{" "}
                <Link to="/pricing" className="underline">
                  Upgrade for 129 rewrites and a saved master resume.
                </Link>
              </p>
            ) : (
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {isSubscribed
                  ? tier === "career_pro"
                    ? "199 rewrites included per month"
                    : "129 rewrites included per month"
                  : "Takes ~15 seconds. Chai can wait."}
              </p>
            )}

          </div>
        )}

      </div>

      {loading && (
        <div id="progress" className="scroll-mt-8">
          {queueNote && (
            <div className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
              {queueNote}
            </div>
          )}
          <TailorProgress stage={stage} />
          <ResultSkeleton />
        </div>
      )}


      {result && !loading && (
        <div id="result" className="mt-12 scroll-mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div data-testid="score-match" className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-hero text-foreground">
                  <span className="font-display text-xl leading-none font-bold">
                    {Math.round(result.matchScore)}
                  </span>
                  <span className="mt-0.5 text-[8px] font-bold tracking-wide uppercase opacity-80">Match /100</span>
                </div>
                <div data-testid="score-ats" className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-primary/50 text-foreground">
                  <span className="font-display text-xl leading-none font-bold text-primary">
                    {Math.round(result.atsScore)}
                  </span>
                  <span className="mt-0.5 text-[8px] font-bold tracking-wide uppercase opacity-80">ATS /100</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Tailored for {company || "this role"}</h2>
                <p className="text-sm text-muted-foreground">
                  Fresh resume + cover letter, hot off the press. Go get that offer.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ink" disabled={downloading !== null} onClick={() => download("resume")}>
                {downloading === "resume" ? <Loader2 className="animate-spin" /> : <Download />}
                {downloading === "resume" ? "Building PDF…" : "Resume PDF"}
              </Button>
              <Button
                variant="outline"
                disabled={downloading !== null}
                onClick={() => download("cover")}
              >
                {downloading === "cover" ? <Loader2 className="animate-spin" /> : <Mail />}
                {downloading === "cover" ? "Building PDF…" : "Cover letter PDF"}
              </Button>
            </div>

          </div>

          <Tabs defaultValue="resume">
            <TabsList>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="cover">Cover letter</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="resume">
              <Card className="p-8 shadow-soft sm:p-10">
                <header className="border-b border-border pb-4">
                  <h3 className="text-2xl font-bold text-primary">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{result.contacts.join("  •  ")}</p>
                </header>

                <Section title="Professional summary">
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </Section>

                {result.skills.length > 0 && (
                  <Section title="Core skills">
                    <div className="flex flex-wrap gap-1.5">
                      {result.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </Section>
                )}

                {result.keyAchievements?.length > 0 && (
                  <Section title="Key achievements">
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                      {result.keyAchievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </Section>
                )}

                {result.experience.length > 0 && (
                  <Section title="Experience">
                    <div className="space-y-5">
                      {result.experience.map((e, i) => (
                        <div key={i}>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-semibold">
                              {e.role}
                              {e.company ? ` — ${e.company}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">{e.dates}</p>
                          </div>
                          {(e.context || e.location) && (
                            <p className="text-xs text-muted-foreground italic">
                              {[e.context, e.location && e.context && e.context.toLowerCase().includes(e.location.toLowerCase().split(",")[0].trim()) ? "" : e.location].filter(Boolean).join("  |  ")}
                            </p>
                          )}

                          <ul className="mt-1.5 space-y-1">
                            {e.bullets.map((b, j) => (
                              <li key={j} className="flex gap-2 text-sm leading-relaxed">
                                <span className="text-highlight">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {result.projects.length > 0 && (
                  <Section title="Projects">
                    <div className="space-y-4">
                      {result.projects.map((p, i) => (
                        <div key={i}>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.description}</p>
                          <ul className="mt-1 space-y-1">
                            {p.bullets.map((b, j) => (
                              <li key={j} className="flex gap-2 text-sm">
                                <span className="text-highlight">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {result.education.length > 0 && (
                  <Section title="Education">
                    {result.education.map((e, i) => (
                      <div key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium">
                          {e.credential}
                          <span className="font-normal text-muted-foreground"> — {e.institution}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{e.dates}</p>
                      </div>
                    ))}
                  </Section>
                )}

                {result.certifications.length > 0 && (
                  <Section title="Certifications">
                    <ul className="space-y-1">
                      {result.certifications.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-highlight">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {result.skillGroups?.length > 0 && (
                  <Section title="Skills & tools">
                    <div className="space-y-1.5">
                      {result.skillGroups.map((g, i) => (
                        <p key={i} className="text-sm leading-relaxed">
                          <span className="font-semibold">{g.label}: </span>
                          <span className="text-muted-foreground">{g.items.join(", ")}</span>
                        </p>
                      ))}
                    </div>
                  </Section>
                )}



                {result.additionalSections?.map((section) =>
                  section.items.length > 0 ? (
                    <Section key={section.title} title={section.title}>
                      <ul className="space-y-1">
                        {section.items.map((item, index) => (
                          <li key={`${section.title}-${index}`} className="flex gap-2 text-sm leading-relaxed">
                            <span className="text-highlight">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  ) : null,
                )}
              </Card>
            </TabsContent>

            <TabsContent value="cover">
              <Card className="p-8 shadow-soft sm:p-10">
                <div className="space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.coverLetter}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <div className="tl-ins grid gap-4 md:grid-cols-2">
                <Card className="tl-ins-hero md:col-span-2">
                  <div className="flex shrink-0 gap-4">
                    <div className="text-center">
                      <div className="tl-ins-score">{Math.round(result.matchScore)}</div>
                      <p className="mt-1 text-[10px] font-bold tracking-wider uppercase">Match score</p>
                    </div>
                    <div className="text-center">
                      <div className="tl-ins-score">{Math.round(result.atsScore)}</div>
                      <p className="mt-1 text-[10px] font-bold tracking-wider uppercase">ATS score</p>
                    </div>
                  </div>
                  <div>
                    <p className="tl-ins-verdict">
                      {result.matchScore >= 80
                        ? "Strong match. Go apply."
                        : result.matchScore >= 65
                          ? "Solid fit. A few tweaks and you're in."
                          : result.matchScore >= 45
                            ? "A stretch role. Honest gaps below."
                            : "Big stretch. Read the gaps first."}
                    </p>
                    <p className="tl-ins-sub">
                      Match score: how well you fit this job. ATS score: how cleanly a robot can read your resume. No fluff, no fake skills.
                    </p>
                  </div>
                </Card>
                {result.fitWarning && (
                  <Card className="tl-ins-card tl-ins-warn md:col-span-2">
                    <h4 className="tl-ins-h">
                      <AlertCircle className="size-4" /> Real talk
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.fitWarning}</p>
                  </Card>
                )}
                {result.scoreBreakdown && (
                  <Card className="tl-ins-card md:col-span-2">
                    <h4 className="tl-ins-h">How the {Math.round(result.matchScore)} was built</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Keyword match", emoji: "🔑", value: result.scoreBreakdown.keywordMatch, max: 40 },
                        { label: "Title & seniority alignment", emoji: "🪪", value: result.scoreBreakdown.titleAlignment, max: 15 },
                        { label: "Formatting & parseability", emoji: "🧾", value: result.scoreBreakdown.formatting, max: 20 },
                        { label: "Experience relevance", emoji: "🧭", value: result.scoreBreakdown.experienceRelevance, max: 15 },
                        { label: "Quantified impact", emoji: "📈", value: result.scoreBreakdown.quantifiedImpact, max: 10 },
                      ].map((row, i) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs">
                            <span>
                              {row.emoji} {row.label}
                            </span>
                            <span className="tl-ins-num">
                              {Math.round(row.value)}/{row.max}
                              {row.value / row.max >= 0.9 ? " 🔥" : ""}
                            </span>
                          </div>
                          <div className="tl-ins-bar">
                            <div
                              className="tl-ins-fill"
                              style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%`, ["--i" as string]: i }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                <Card className="tl-ins-card">
                  <h4 className="tl-ins-h">
                    <CheckCircle2 className="size-4" /> You already speak their language
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((k) => (
                      <span key={k} className="tl-chip tl-chip-yes">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </Card>
                <Card className="tl-ins-card">
                  <h4 className="tl-ins-h tl-ins-h-gap">
                    <AlertCircle className="size-4" /> Gaps (honest, never faked)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="tl-chip tl-chip-no">
                        {k}
                      </span>
                    ))}
                  </div>
                  {result.atsTopFix ? (
                    <p className="mt-3 text-sm text-muted-foreground">Top fix: {result.atsTopFix}</p>
                  ) : null}
                </Card>
                <Card className="tl-ins-card md:col-span-2">
                  <h4 className="tl-ins-h">
                    <Lightbulb className="size-4" /> Level-up moves
                  </h4>
                  <ul className="space-y-2.5">
                    {result.tips.map((t, i) => (
                      <li key={i} className="tl-tip">
                        <b>{i + 1}</b>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                {result.consistencyFlags?.length > 0 && (
                  <Card className="tl-ins-card">
                    <h4 className="tl-ins-h tl-ins-h-gap">
                      <AlertCircle className="size-4" /> Double-check these
                    </h4>
                    <ul className="space-y-2">
                      {result.consistencyFlags.map((f, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {result.regionAdaptations?.length > 0 && (
                  <Card className="tl-ins-card">
                    <h4 className="tl-ins-h">
                      <CheckCircle2 className="size-4" /> Adapted for the hiring market
                    </h4>
                    <ul className="space-y-2">
                      {result.regionAdaptations.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

            </TabsContent>
          </Tabs>
          {!session ? (
            <Card className="mt-6 flex flex-col items-center gap-3 border-primary/30 p-6 text-center shadow-soft">
              <p className="text-sm font-semibold">That was your free rewrite.</p>
              <p className="text-xs text-muted-foreground">
                Create a free account to keep tailoring — 5 resumes and cover letters every month.
              </p>
              <Button variant="hero" asChild>
                <Link to="/auth" search={{ redirect: "/tailor" }}>
                  <Sparkles /> Create free account
                </Link>
              </Button>
            </Card>
          ) : !subLoading && !isSubscribed && usage && usage.remaining === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You have tailored {usage.used} of {usage.limit} this month.{" "}
              <Link to="/pricing" className="underline">
                Upgrade for 129 rewrites and a saved master resume.
              </Link>
            </p>
          ) : null}
        </div>
      )}

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter your email to download</DialogTitle>
            <DialogDescription>
              We'll unlock both PDFs right away. No account needed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmitEmail} className="space-y-3">
            <Input
              type="email"
              autoFocus
              required
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
            />
            <Button type="submit" variant="hero" className="w-full" disabled={savingEmail}>
              {savingEmail ? <Loader2 className="animate-spin" /> : <Download />}
              {savingEmail ? "Unlocking…" : "Unlock downloads"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>

  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h4 className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">{title}</h4>
      {children}
    </section>
  );
}



