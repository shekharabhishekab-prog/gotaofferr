import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Download, Loader2, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget, resetTurnstile } from "@/components/TurnstileWidget";
import { useSession } from "@/hooks/useSession";
import { assistResumeField, polishResumeDraft } from "@/lib/resume-builder.functions";
import { getBuilderUsage, spendBuilderResume } from "@/lib/builder-usage.functions";
import { UsageUpsell } from "@/components/UsageUpsell";
import type { AssistKind } from "@/lib/resume-assist-schema";
import {
  emptyDraft,
  resumeDraftSchema,
  templateLabels,
  type PolishedResume,
  type ResumeDraft,
  type ResumeTemplate,
} from "@/lib/resume-builder-schema";


const TEMPLATE_BLURB: Record<ResumeTemplate, string> = {
  india: "Indian recruiters and portals like Naukri. Education stays prominent, two pages are fine, and personal details are allowed.",
  international:
    "US, UK, EU, Canada, Australia and Gulf employers on Greenhouse or Workday. No photo, no date of birth, outcome-first bullets.",
};

export function ResumeBuilder() {
  const { session } = useSession();
  const navigate = useNavigate();
  const polish = useServerFn(polishResumeDraft);
  const assist = useServerFn(assistResumeField);
  const loadUsage = useServerFn(getBuilderUsage);
  const spendResume = useServerFn(spendBuilderResume);
  const [usage, setUsage] = useState<{ tier: "free" | "starter" | "job_hunt" | "career_pro"; limit: number; used: number } | null>(null);
  useEffect(() => {
    if (!session) return;
    void loadUsage({}).then((u) => setUsage(u)).catch(() => undefined);
  }, [session, loadUsage]);

  const [draft, setDraft] = useState<ResumeDraft>(() => emptyDraft("international"));
  const [polished, setPolished] = useState<PolishedResume | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [busyField, setBusyField] = useState<string | null>(null);

  function set<K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Inline field-level help. Each button rewrites just its own field so users
   * get AI support while writing, instead of only once at the end.
   */
  async function improve(
    id: string,
    kind: AssistKind,
    text: string,
    apply: (value: string) => void,
    extra?: { role?: string; company?: string },
  ) {
    if (text.trim().length < 3) {
      toast.info("Write a few rough words first — AI will turn them into proper resume lines.");
      return;
    }
    setBusyField(id);
    try {
      const result = await assist({
        data: {
          kind,
          template: draft.template,
          text,
          targetRole: draft.targetRole,
          role: extra?.role ?? "",
          company: extra?.company ?? "",
          turnstileToken: captchaToken ?? undefined,
        },
      });
      apply(result.text);
      toast.success("Rewritten. Edit anything you'd like to change.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rewrite that right now.");
    } finally {
      resetTurnstile();
      setCaptchaToken(null);
      setBusyField(null);
    }
  }


  function parsed() {
    const result = resumeDraftSchema.safeParse(draft);
    if (!result.success) {
      toast.error("Add your full name before continuing.");
      return null;
    }
    return result.data;
  }

  async function runPolish() {
    const data = parsed();
    if (!data) return;
    setPolishing(true);
    try {
      const result = await polish({
        data: { ...data, turnstileToken: captchaToken ?? undefined },
      });
      setPolished(result);
      toast.success("Your resume has been rewritten in a professional tone.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not polish the resume.");
    } finally {
      // Tokens are single use — get a fresh one for the next polish.
      resetTurnstile();
      setCaptchaToken(null);
      setPolishing(false);
    }
  }

  async function download() {
    const data = parsed();
    if (!data) return;
    if (!session) {
      toast.info("Create a free account to download your resume.");
      navigate({ to: "/auth", search: { redirect: "/resume-builder" } });
      return;
    }
    setDownloading(true);
    try {
      const spent = await spendResume({});
      setUsage({ tier: spent.tier, limit: spent.limit, used: spent.used });
      if (!spent.ok) {
        toast.error("You have used all your builder resumes for this month.");
        return;
      }
      const { buildBuilderResumePdf } = await import("@/lib/resume-builder-pdf");
      const doc = await buildBuilderResumePdf(data, polished);
      doc.save(`${(data.fullName || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-resume.pdf`);
    } catch {
      toast.error("Could not build the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const isIndia = draft.template === "india";

  return (
    <div className="site-container pb-24">
      {/* Template picker */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {(Object.keys(templateLabels) as ResumeTemplate[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => set("template", key)}
            aria-pressed={draft.template === key}
            className={`rounded-xl border p-6 text-left transition-colors ${
              draft.template === key
                ? "border-primary bg-primary/10"
                : "border-border/60 bg-card hover:border-primary/50"
            }`}
          >
            <h2 className="font-display text-lg font-bold text-foreground">{templateLabels[key]}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{TEMPLATE_BLURB[key]}</p>
          </button>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------------- Form ---------------- */}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Sections are collapsed to keep this short. Open one, write rough notes, and use
            <span className="mx-1 font-semibold text-primary">Improve with AI</span>
            on any field.
          </p>
          <Section title="Contact details" defaultOpen hint="Name, role and how recruiters reach you.">
            <Field label="Full name" required>
              <Input value={draft.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Aarav Sharma" />
            </Field>
            <Field label="Target role">
              <Input value={draft.targetRole} onChange={(e) => set("targetRole", e.target.value)} placeholder="Business Analyst" />
            </Field>
            <Field label="Email">
              <Input value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
            </Field>
            <Field label="Phone">
              <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxx xxxxx" />
            </Field>
            <Field label="Location">
              <Input value={draft.location} onChange={(e) => set("location", e.target.value)} placeholder="Bengaluru, India" />
            </Field>
            <Field label="LinkedIn">
              <Input value={draft.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/username" />
            </Field>
            <Field label="Portfolio or GitHub">
              <Input value={draft.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="github.com/username" />
            </Field>
          </Section>

          <Section title="About you" defaultOpen hint="Summary and skills.">
            <Field
              label="Rough summary"
              full
              hint="Write it however you like, then let AI rewrite this line."
              action={
                <AiField
                  busy={busyField === "summary"}
                  onClick={() =>
                    improve("summary", "summary", draft.summary, (value) => set("summary", value))
                  }
                />
              }
            >
              <Textarea
                rows={4}
                value={draft.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="3 years in supply chain analytics, mostly SQL and dashboards, handled vendor reporting for 4 plants."
              />
            </Field>
            <Field
              label="Skills"
              full
              hint="Comma separated."
              action={
                <AiField
                  busy={busyField === "skills"}
                  onClick={() => improve("skills", "skills", draft.skills, (value) => set("skills", value))}
                  label="Clean up with AI"
                />
              }
            >
              <Textarea
                rows={3}
                value={draft.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="SQL, Power BI, Excel, stakeholder management"
              />
            </Field>
          </Section>

          <Section
            title="Experience"
            hint="Rough notes per role — AI turns each into proper bullets."

            action={
              <AddButton
                label="Add role"
                onClick={() =>
                  set("experience", [
                    ...draft.experience,
                    { role: "", company: "", location: "", dates: "", details: "" },
                  ])
                }
              />
            }
          >
            {draft.experience.map((item, index) => (
              <RepeatCard
                key={index}
                onRemove={
                  draft.experience.length > 1
                    ? () => set("experience", draft.experience.filter((_, i) => i !== index))
                    : undefined
                }
              >
                <Field label="Job title">
                  <Input
                    value={item.role}
                    onChange={(e) =>
                      set("experience", draft.experience.map((row, i) => (i === index ? { ...row, role: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={item.company}
                    onChange={(e) =>
                      set("experience", draft.experience.map((row, i) => (i === index ? { ...row, company: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label="Dates">
                  <Input
                    placeholder="Mar 2023 – Present"
                    value={item.dates}
                    onChange={(e) =>
                      set("experience", draft.experience.map((row, i) => (i === index ? { ...row, dates: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={item.location}
                    onChange={(e) =>
                      set("experience", draft.experience.map((row, i) => (i === index ? { ...row, location: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field
                  label="What you did"
                  full
                  hint="One point per line. Rough notes are fine — AI rewrites them into bullets."
                  action={
                    <AiField
                      busy={busyField === `exp-${index}`}
                      onClick={() =>
                        improve(
                          `exp-${index}`,
                          "experience",
                          item.details,
                          (value) =>
                            set(
                              "experience",
                              draft.experience.map((row, i) => (i === index ? { ...row, details: value } : row)),
                            ),
                          { role: item.role, company: item.company },
                        )
                      }
                      label="Write bullets with AI"
                    />
                  }
                >
                  <Textarea
                    rows={4}
                    value={item.details}
                    onChange={(e) =>
                      set("experience", draft.experience.map((row, i) => (i === index ? { ...row, details: e.target.value } : row)))
                    }
                    placeholder={"built the weekly vendor dashboard\ncut reporting time from 2 days to 3 hours"}
                  />
                </Field>

              </RepeatCard>
            ))}
          </Section>

          <Section
            title="Education"
            action={
              <AddButton
                label="Add education"
                onClick={() =>
                  set("education", [...draft.education, { credential: "", institution: "", dates: "", score: "" }])
                }
              />
            }
          >
            {draft.education.map((item, index) => (
              <RepeatCard
                key={index}
                onRemove={
                  draft.education.length > 1
                    ? () => set("education", draft.education.filter((_, i) => i !== index))
                    : undefined
                }
              >
                <Field label="Degree">
                  <Input
                    placeholder="B.Tech, Mechanical Engineering"
                    value={item.credential}
                    onChange={(e) =>
                      set("education", draft.education.map((row, i) => (i === index ? { ...row, credential: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label="Institution">
                  <Input
                    value={item.institution}
                    onChange={(e) =>
                      set("education", draft.education.map((row, i) => (i === index ? { ...row, institution: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label="Years">
                  <Input
                    placeholder="2019 – 2023"
                    value={item.dates}
                    onChange={(e) =>
                      set("education", draft.education.map((row, i) => (i === index ? { ...row, dates: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field label={isIndia ? "Percentage or CGPA" : "Grade (optional)"}>
                  <Input
                    value={item.score}
                    onChange={(e) =>
                      set("education", draft.education.map((row, i) => (i === index ? { ...row, score: e.target.value } : row)))
                    }
                  />
                </Field>
              </RepeatCard>
            ))}
          </Section>

          <Section
            title="Projects"
            action={
              <AddButton
                label="Add project"
                onClick={() => set("projects", [...draft.projects, { name: "", details: "" }])}
              />
            }
          >
            {draft.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Optional, but strongly recommended for freshers and career switchers.
              </p>
            ) : null}
            {draft.projects.map((item, index) => (
              <RepeatCard
                key={index}
                onRemove={() => set("projects", draft.projects.filter((_, i) => i !== index))}
              >
                <Field label="Project name" full>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      set("projects", draft.projects.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))
                    }
                  />
                </Field>
                <Field
                  label="What it did"
                  full
                  action={
                    <AiField
                      busy={busyField === `proj-${index}`}
                      onClick={() =>
                        improve(
                          `proj-${index}`,
                          "project",
                          item.details,
                          (value) =>
                            set(
                              "projects",
                              draft.projects.map((row, i) => (i === index ? { ...row, details: value } : row)),
                            ),
                          { role: item.name },
                        )
                      }
                      label="Write bullets with AI"
                    />
                  }
                >
                  <Textarea
                    rows={3}
                    value={item.details}
                    onChange={(e) =>
                      set("projects", draft.projects.map((row, i) => (i === index ? { ...row, details: e.target.value } : row)))
                    }
                  />
                </Field>
              </RepeatCard>
            ))}
          </Section>

          <Section title="Additional" hint="Certifications, languages and region-specific details.">
            <Field
              label="Certifications"
              full
              hint="One per line."
              action={
                <AiField
                  busy={busyField === "certs"}
                  onClick={() =>
                    improve("certs", "certifications", draft.certifications, (value) =>
                      set("certifications", value),
                    )
                  }
                  label="Tidy with AI"
                />
              }
            >
              <Textarea
                rows={3}
                value={draft.certifications}
                onChange={(e) => set("certifications", e.target.value)}
              />

            </Field>
            <Field label="Languages" full hint="Comma separated.">
              <Input value={draft.languages} onChange={(e) => set("languages", e.target.value)} />
            </Field>

            {isIndia ? (
              <>
                <Field label="Date of birth (optional)">
                  <Input value={draft.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
                </Field>
                <Field label="Father's name (optional)">
                  <Input value={draft.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
                </Field>
              </>
            ) : (
              <Field label="Work authorisation" full hint="Example: Open to relocation, eligible for UAE employment visa.">
                <Input
                  value={draft.workAuthorization}
                  onChange={(e) => set("workAuthorization", e.target.value)}
                />
              </Field>
            )}
          </Section>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <TurnstileWidget onToken={setCaptchaToken} className="mb-3" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={runPolish} disabled={polishing}>
                {polishing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {polished ? "Polish again" : "Polish with AI"}
              </Button>
              <Button variant="outline" onClick={download} disabled={downloading}>
                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Download PDF
              </Button>
            </div>
            {usage ? (
              <div className="mt-3">
                <UsageUpsell tier={usage.tier} noun="resumes" limit={usage.limit} used={usage.used} />
              </div>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Building is free. You'll need a free account to download the PDF.
            </p>

            <div className="mt-6 max-h-[70vh] overflow-y-auto rounded-lg border border-border/50 bg-background p-5 text-sm">
              <h3 className="font-display text-lg font-bold text-foreground">
                {draft.fullName || "Your name"}
              </h3>
              <p className="text-muted-foreground">{polished?.headline || draft.targetRole}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[draft.location, draft.phone, draft.email].filter(Boolean).join("  |  ")}
              </p>

              <PreviewBlock title="Summary">
                <p className="text-muted-foreground">{polished?.summary || draft.summary || "—"}</p>
              </PreviewBlock>

              <PreviewBlock title="Core skills">
                <p className="text-muted-foreground">
                  {(polished?.skills?.length ? polished.skills : draft.skills.split(",")).
                    map((s) => s.trim()).filter(Boolean).join("  •  ") || "—"}
                </p>
              </PreviewBlock>

              {polished?.keyAchievements?.length ? (
                <PreviewBlock title="Key achievements">
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {polished.keyAchievements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </PreviewBlock>
              ) : null}

              <PreviewBlock title="Experience">
                {(polished?.experience?.length
                  ? polished.experience
                  : draft.experience.map((item) => ({
                      ...item,
                      bullets: item.details.split("\n").filter(Boolean),
                    }))
                ).map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold text-foreground">
                      {[item.role, item.company].filter(Boolean).join(" — ") || "Role"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[item.dates, item.location].filter(Boolean).join("  |  ")}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                      {item.bullets.map((bullet, i) => (
                        <li key={i}>{bullet.replace(/^[-•*\s]+/, "")}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </PreviewBlock>
            </div>

            {polished?.tips?.length ? (
              <div className="mt-5 rounded-lg border border-primary/40 bg-primary/5 p-4">
                <h4 className="font-display text-sm font-semibold text-foreground">What to improve</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {polished.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-5 text-xs text-muted-foreground">
              Applying to a specific company?{" "}
              <Link to="/tailor" className="font-semibold text-primary underline underline-offset-4">
                Tailor this resume to the job description
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
  defaultOpen = false,
  hint,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border/60 bg-card/40">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={`size-4 shrink-0 text-primary transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span>
            <span className="block font-display text-lg font-bold text-foreground">{title}</span>
            {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
          </span>
        </button>
        {open ? action : null}
      </div>
      {open ? <div className="grid gap-4 border-t border-border/50 p-4 sm:grid-cols-2">{children}</div> : null}
    </section>
  );
}

function Field({
  label,
  children,
  full,
  hint,
  required,
  action,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
  required?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          {required ? <span className="text-primary"> *</span> : null}
        </Label>
        {action}
      </div>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Small inline "rewrite this field" trigger shown next to a field label. */
function AiField({
  busy,
  onClick,
  label = "Improve with AI",
}: {
  busy: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
      {busy ? "Rewriting" : label}
    </button>
  );
}


function RepeatCard({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div className="relative grid gap-4 rounded-xl border border-border/60 bg-muted/20 p-5 sm:col-span-2 sm:grid-cols-2">
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this entry"
          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Plus className="size-4" />
      {label}
    </Button>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{title}</p>
      {children}
    </div>
  );
}

