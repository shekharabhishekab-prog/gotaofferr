import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Counter, Field, fieldClass as field, newId } from "@/components/ListEditor";
import { safeUrl } from "@/lib/profile-types";

// Phase 1 (preview): "Post a job" in 4 steps. Nothing is saved yet. Real posting needs a company page + the database step.
export const Route = createFileRoute("/company/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a job | GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PostJob,
});

const JOB_TYPES = ["Full time", "Part time", "Contract", "Temporary", "Internship", "Volunteer", "Other"];
const WORKPLACES = ["On-site", "Hybrid", "Remote"];
type QType = "Yes or no" | "Number" | "Short text" | "Multiple choice";
type Q = { id: string; type: QType; text: string; mustHave: boolean; ideal: string; options: string };
const STEPS = ["Job details", "Description", "How to apply", "Review"];
const card = "rounded-xl border border-border/60 bg-card p-5 sm:p-6";
const COMPANY = "BrightLeaf Media";

function PostJob() {
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [workplace, setWorkplace] = useState("On-site");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Full time");
  const [desc, setDesc] = useState("");
  const [skills, setSkills] = useState("");
  const [showPay, setShowPay] = useState(true);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [period, setPeriod] = useState("year");
  const [method, setMethod] = useState<"link" | "email">("link");
  const [target, setTarget] = useState("");
  const [qs, setQs] = useState<Q[]>([]);

  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);

  const check = (s: number): string | null => {
    if (s === 0) {
      if (!title.trim()) return "Add a job title.";
      if (title.trim().length > 100) return "Keep the title under 100 characters.";
      if (title.length > 6 && title === title.toUpperCase()) return "Please do not write the title in all capitals.";
      if (title.toLowerCase().includes(COMPANY.toLowerCase())) return "Leave the company name out of the title.";
      if (workplace !== "Remote" && !location.trim()) return "Add the job location.";
    }
    if (s === 1) {
      if (desc.trim().length < 50) return "Describe the job in at least 50 characters.";
      if (showPay && (min || max)) {
        const a = Number(min), b = Number(max);
        if (!(a > 0) || !(b > 0)) return "Enter both a minimum and a maximum pay.";
        if (b < a) return "Maximum pay cannot be less than the minimum.";
      }
    }
    if (s === 2) {
      if (!target.trim()) return method === "link" ? "Add the application link." : "Add the email for applications.";
      if (method === "link" && !safeUrl(target)) return "That is not a valid web address.";
      if (method === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target.trim())) return "That is not a valid email.";
      if (qs.some((q) => !q.text.trim())) return "Every screening question needs its text.";
      if (qs.some((q) => q.type === "Multiple choice" && q.options.split(",").filter((o) => o.trim()).length < 2)) return "Multiple choice needs at least 2 options.";
    }
    return null;
  };
  const next = () => {
    const e = check(step);
    setErr(e);
    if (!e) setStep(step + 1);
  };

  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-6 sm:py-10">
      <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
        Preview. Nothing is saved or published. Only company and organization pages can post jobs; personal profiles cannot. Posting is always free.
      </p>
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Post a job</h1>
      <p className="mt-1 text-sm text-muted-foreground">Posting as {COMPANY}</p>

      <ol className="mt-5 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li key={s} className={`rounded-full border px-3 py-1 ${i === step ? "border-primary bg-primary/10 font-semibold text-foreground" : i < step ? "border-primary/40 text-foreground" : "border-border/60 text-muted-foreground"}`}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <form className={card} onSubmit={(e) => e.preventDefault()}>
          {step === 0 ? (
            <>
              <Field label="Job title" required hint="No all capitals. No company name.">
                <input className={field} value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
                <Counter value={title} max={100} />
              </Field>
              <Field label="Workplace" required>
                <select className={field} value={workplace} onChange={(e) => setWorkplace(e.target.value)}>{WORKPLACES.map((o) => <option key={o}>{o}</option>)}</select>
              </Field>
              <Field label={workplace === "Remote" ? "Region (optional)" : "Location"} required={workplace !== "Remote"} hint={workplace === "Remote" ? 'Example: "India" or "Worldwide".' : "City and country."}>
                <input className={field} value={location} maxLength={80} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field label="Job type" required>
                <select className={field} value={jobType} onChange={(e) => setJobType(e.target.value)}>{JOB_TYPES.map((o) => <option key={o}>{o}</option>)}</select>
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label="Description" required hint="What they will do, what you need, what you offer. One line per point.">
                <textarea className={field} rows={10} value={desc} maxLength={10000} onChange={(e) => setDesc(e.target.value)} />
                <Counter value={desc} max={10000} />
              </Field>
              <Field label="Skills (up to 10, comma separated)">
                <input className={field} value={skills} maxLength={300} onChange={(e) => setSkills(e.target.value)} />
              </Field>
              <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <input type="checkbox" className="h-4 w-4 accent-[#073f89]" checked={showPay} onChange={(e) => setShowPay(e.target.checked)} />
                Show the pay range (recommended)
              </label>
              {showPay ? (
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Minimum"><input inputMode="numeric" className={field} value={min} onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ""))} /></Field>
                  <Field label="Maximum"><input inputMode="numeric" className={field} value={max} onChange={(e) => setMax(e.target.value.replace(/[^0-9]/g, ""))} /></Field>
                  <Field label="Currency"><input className={field} value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value.toUpperCase())} /></Field>
                  <Field label="Per">
                    <select className={field} value={period} onChange={(e) => setPeriod(e.target.value)}>{["hour", "month", "year"].map((o) => <option key={o}>{o}</option>)}</select>
                  </Field>
                </div>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm font-semibold text-foreground">How should people apply?</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground">
                <label className="flex items-center gap-2"><input type="radio" name="m" className="accent-[#073f89]" checked={method === "link"} onChange={() => setMethod("link")} /> Your own link</label>
                <label className="flex items-center gap-2"><input type="radio" name="m" className="accent-[#073f89]" checked={method === "email"} onChange={() => setMethod("email")} /> Email</label>
                <label className="flex items-center gap-2 text-muted-foreground"><input type="radio" disabled name="m" /> Apply here with a tailored resume (coming)</label>
              </div>
              <Field label={method === "link" ? "Application link" : "Application email"} required>
                <input className={field} value={target} maxLength={300} placeholder={method === "link" ? "https://" : "jobs@company.com"} onChange={(e) => setTarget(e.target.value)} />
              </Field>
              <p className="mt-5 text-sm font-semibold text-foreground">Screening questions (up to 10, optional)</p>
              <ul className="mt-2 space-y-3">
                {qs.map((q, i) => (
                  <li key={q.id} className="rounded-lg border border-border/60 bg-background p-3">
                    <div className="flex flex-wrap gap-2">
                      <select className={field + " !mt-0 w-auto"} value={q.type} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, type: e.target.value as QType } : x)))}>
                        {["Yes or no", "Number", "Short text", "Multiple choice"].map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <Button type="button" size="sm" variant="outline" onClick={() => setQs(qs.filter((_, j) => j !== i))}>Remove</Button>
                    </div>
                    <input className={field} placeholder="Question" maxLength={200} value={q.text} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
                    {q.type === "Multiple choice" ? (
                      <input className={field} placeholder="Options, comma separated" maxLength={300} value={q.options} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))} />
                    ) : null}
                    {q.type !== "Short text" ? (
                      <input className={field} placeholder="Ideal answer" maxLength={100} value={q.ideal} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, ideal: e.target.value } : x)))} />
                    ) : null}
                    {q.type !== "Short text" ? (
                      <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" className="h-4 w-4 accent-[#073f89]" checked={q.mustHave} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, mustHave: e.target.checked } : x)))} />
                        Must-have (people who answer differently are told they do not match)
                      </label>
                    ) : null}
                  </li>
                ))}
              </ul>
              {qs.length < 10 ? (
                <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setQs([...qs, { id: newId(), type: "Yes or no", text: "", mustHave: false, ideal: "", options: "" }])}>
                  Add question
                </Button>
              ) : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="font-display text-lg font-bold text-foreground">Review</h2>
              <p className="mt-1 text-sm text-muted-foreground">Check the preview on the right. Publish opens after the database step is approved.</p>
              <Button type="button" disabled className="mt-4 w-full">Publish job (not available in preview)</Button>
            </>
          ) : null}

          {err ? <p role="alert" className="mt-4 text-sm text-primary">{err}</p> : null}
          <div className="mt-6 flex gap-2">
            {step > 0 ? <Button type="button" variant="outline" onClick={() => { setErr(null); setStep(step - 1); }}>Back</Button> : <Button asChild variant="outline"><Link to="/company/dashboard">Cancel</Link></Button>}
            {step < 3 ? <Button type="button" onClick={next}>Next</Button> : null}
          </div>
        </form>

        <aside className={`${card} h-fit lg:sticky lg:top-6`} aria-label="Job preview">
          <p className="text-xs uppercase tracking-widest text-primary">Preview</p>
          <h2 className="mt-2 break-words font-display text-xl font-bold text-foreground">{title || "Job title"}</h2>
          <p className="mt-1 text-sm text-foreground/90">{COMPANY} - {workplace === "Remote" ? `Remote${location ? `, ${location}` : ""}` : location || "Location"}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {[jobType, workplace].map((c) => <li key={c} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-foreground">{c}</li>)}
          </ul>
          {showPay && min && max ? <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Pay: </span>{currency} {Number(min).toLocaleString("en-IN")} - {Number(max).toLocaleString("en-IN")} per {period}</p> : null}
          {desc ? <p className="mt-3 line-clamp-6 whitespace-pre-line text-sm text-muted-foreground">{desc}</p> : null}
          {skillList.length ? <ul className="mt-3 flex flex-wrap gap-2">{skillList.map((s) => <li key={s} className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-foreground">{s}</li>)}</ul> : null}
          {qs.length ? <p className="mt-3 text-xs text-muted-foreground">{qs.length} screening question{qs.length > 1 ? "s" : ""}</p> : null}
        </aside>
      </div>
    </main>
  );
}
