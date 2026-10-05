import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Lock, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget, resetTurnstile } from "@/components/TurnstileWidget";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { reviewLinkedInProfile, reviewLinkedInProfilePro } from "@/lib/linkedin.functions";
import type { LinkedInFreeReview, LinkedInProReview } from "@/lib/linkedin-schema";

type Form = {
  profileUrl: string;
  headline: string;
  about: string;
  experience: string;
  skills: string;
  targetRole: string;
};

const EMPTY: Form = {
  profileUrl: "",
  headline: "",
  about: "",
  experience: "",
  skills: "",
  targetRole: "",
};

function ScoreRing({ score }: { score: number }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="flex size-28 flex-col items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10">
      <span className="font-display text-3xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">out of 100</span>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold text-card-foreground">{title}</h4>
      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function LinkedInReviewer() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [review, setReview] = useState<LinkedInFreeReview | null>(null);
  const [pro, setPro] = useState<LinkedInProReview | null>(null);
  const [running, setRunning] = useState(false);
  const [runningPro, setRunningPro] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const runFree = useServerFn(reviewLinkedInProfile);
  const runPro = useServerFn(reviewLinkedInProfilePro);
  const { session } = useSession();
  const { tier, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  const isPaid = tier === "job_hunt" || tier === "career_pro";
  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const enoughText =
    `${form.headline} ${form.about} ${form.experience} ${form.skills}`.trim().length >= 60;

  async function review_() {
    if (!enoughText) {
      toast.error("Paste a bit more of your profile — headline, About and a few experience bullets.");
      return;
    }
    setRunning(true);
    setPro(null);
    try {
      const res = await runFree({ data: { ...form, turnstileToken: captchaToken ?? undefined } });
      setReview(res.review);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not review your profile. Please try again.");
    } finally {
      resetTurnstile();
      setCaptchaToken(null);
      setRunning(false);
    }
  }

  async function unlockPro() {
    if (!session) {
      navigate({ to: "/auth", search: { redirect: "/linkedin-profile-reviewer" } });
      return;
    }
    if (!isPaid) {
      navigate({ to: "/pricing" });
      return;
    }
    setRunningPro(true);
    try {
      const res = await runPro({ data: form });
      setPro(res.pro);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not build the full report. Please try again.");
    } finally {
      setRunningPro(false);
    }
  }

  async function download() {
    if (!review) return;
    if (!session) {
      toast.info("Create a free account to download your report.");
      navigate({ to: "/auth", search: { redirect: "/linkedin-profile-reviewer" } });
      return;
    }
    setDownloading(true);
    try {
      const { buildLinkedInReportPdf } = await import("@/lib/linkedin-pdf");
      const doc = await buildLinkedInReportPdf(review, pro);
      doc.save("linkedin-profile-report.pdf");
    } catch {
      toast.error("Could not build the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="site-container pb-24">
      <section className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="li-url">LinkedIn profile URL (optional)</Label>
            <Input
              id="li-url"
              value={form.profileUrl}
              onChange={(e) => set("profileUrl", e.target.value)}
              placeholder="https://www.linkedin.com/in/yourname"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="li-headline">Headline</Label>
            <Input
              id="li-headline"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="Marketing Manager | Performance & Growth"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="li-about">About section</Label>
          <Textarea
            id="li-about"
            rows={6}
            value={form.about}
            onChange={(e) => set("about", e.target.value)}
            placeholder="Paste your About section exactly as it appears on your profile."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="li-exp">Experience bullets</Label>
          <Textarea
            id="li-exp"
            rows={7}
            value={form.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder={"Role, company and your bullets, one per line."}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="li-skills">Skills</Label>
          <Textarea
            id="li-skills"
            rows={3}
            value={form.skills}
            onChange={(e) => set("skills", e.target.value)}
            placeholder="SQL, Google Analytics, Paid Social, Team Leadership"
            className="mt-1"
          />
        </div>

        <TurnstileWidget onToken={setCaptchaToken} className="mt-1" />

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={review_} disabled={running}>
            <Sparkles className="size-4" />
            {running ? "Reviewing your profile…" : "Review my profile free"}
          </Button>
          <span className="text-xs text-muted-foreground">
            No login needed for your score and feedback.
          </span>
        </div>
      </section>

      {review ? (
        <section className="mt-8 space-y-5">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
            <ScoreRing score={review.overallScore} />
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                Your LinkedIn profile score
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{review.summary}</p>
            </div>
          </div>

          {([
            ["Headline", review.headline],
            ["About section", review.about],
          ] as const).map(([label, section]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-card-foreground">{label}</h3>
                <span className="text-sm font-semibold text-primary">
                  {Math.round(section.score)}/100
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{section.verdict}</p>
              <List title="What works" items={section.strengths} />
              <List title="Fix these" items={section.fixes} />
              {section.rewrite ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4">
                  <h4 className="text-sm font-semibold text-card-foreground">Suggested rewrite</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {section.rewrite}
                  </p>
                </div>
              ) : null}
            </div>
          ))}

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-card-foreground">Skills</h3>
              <span className="text-sm font-semibold text-primary">
                {Math.round(review.skills.score)}/100
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{review.skills.verdict}</p>
            <List title="Keep these" items={review.skills.keep} />
            <List title="Add these" items={review.skills.add} />
            <List title="Fix these" items={review.skills.fixes} />
          </div>

          {/* Paid layer */}
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              Full report — keyword alignment, industry advice and rewrites
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Included in Job Hunt Pack and Career Pro Pack, alongside the LinkedIn About rewrite
              you already get with your plan.
            </p>
            <div className="mt-4">
              <Label htmlFor="li-role">Target role</Label>
              <Input
                id="li-role"
                value={form.targetRole}
                onChange={(e) => set("targetRole", e.target.value)}
                placeholder="Senior Performance Marketing Manager"
                className="mt-1 max-w-md"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={unlockPro} disabled={runningPro || subLoading}>
                {!session || !isPaid ? <Lock className="size-4" /> : <Sparkles className="size-4" />}
                {runningPro
                  ? "Building your full report…"
                  : !session
                    ? "Sign in to unlock"
                    : !isPaid
                      ? "Upgrade to unlock"
                      : "Run the full report"}
              </Button>
              {!isPaid ? (
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  See plans
                </Link>
              ) : null}
            </div>

            {pro ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-base font-semibold text-card-foreground">
                      Keyword alignment
                    </h4>
                    <span className="text-sm font-semibold text-primary">
                      {Math.round(pro.keywordAlignment.score)}/100
                    </span>
                  </div>
                  <List title="Already in your profile" items={pro.keywordAlignment.present} />
                  <List title="Missing" items={pro.keywordAlignment.missing} />
                  <List title="Where to add them" items={pro.keywordAlignment.notes} />
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h4 className="font-display text-base font-semibold text-card-foreground">
                    Industry suggestions
                  </h4>
                  <List title="" items={pro.industrySuggestions} />
                </div>

                {pro.aboutRewrite ? (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h4 className="font-display text-base font-semibold text-card-foreground">
                      Rewritten About section
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {pro.aboutRewrite}
                    </p>
                  </div>
                ) : null}

                {pro.experienceRewrite.length ? (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h4 className="font-display text-base font-semibold text-card-foreground">
                      Rewritten experience section
                    </h4>
                    {pro.experienceRewrite.map((entry, i) => (
                      <div key={i} className="mt-3">
                        <p className="text-sm font-semibold text-card-foreground">{entry.heading}</p>
                        <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                          {entry.bullets.map((b, j) => (
                            <li key={j}>• {b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={download} disabled={downloading}>
              <Download className="size-4" />
              {downloading ? "Preparing PDF…" : "Download report as PDF"}
            </Button>
            {!session ? (
              <span className="text-xs text-muted-foreground">
                Free account required to save or download.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

