import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, Gauge, KeyRound, LayoutList } from "lucide-react";

import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";
import { Button } from "@/components/ui/button";

const TITLE = "Free ATS Resume Checker — Score Your Resume Instantly";
const DESCRIPTION =
  "Upload your resume and paste the job description. Get an instant ATS score, missing keywords, formatting fixes, and a rewritten ATS-ready PDF.";

const faqs = [
  {
    q: "What is an ATS resume checker?",
    a: "An ATS (applicant tracking system) resume checker reads your resume the way software like Greenhouse, Workday or Lever does, then reports what those parsers can and cannot read: section headings, job titles, employers, date ranges, contact details and keywords.",
  },
  {
    q: "How is the ATS score calculated?",
    a: "The score combines parseability (single-column layout, standard headings, complete date ranges, no tables or graphics) with keyword coverage against the job description you paste in. You also get a separate match score broken into keywords, title alignment, formatting, experience relevance and quantified impact.",
  },
  {
    q: "Is the ATS check free?",
    a: "Yes. Every account gets 5 free checks and rewrites each month, and the missing-keyword list is included on all of them. Paid plans add higher monthly limits.",
  },
  {
    q: "Will my resume still read like a human wrote it?",
    a: "Yes. The rewrite keeps your own facts, employers, dates and currency figures exactly as written and avoids AI-sounding buzzwords, so a hiring manager reading after the ATS sees a normal, specific resume.",
  },
];

const checks = [
  {
    icon: Gauge,
    title: "Instant ATS parseability score",
    body: "Upload a PDF and get a 0-100 score for how cleanly a parser can extract your name, contact details, roles, employers and dates.",
  },
  {
    icon: KeyRound,
    title: "Missing keyword report",
    body: "Paste the job description and see which required skills and tools appear in your resume verbatim, and which ones are missing.",
  },
  {
    icon: LayoutList,
    title: "Formatting issues flagged",
    body: "Tables, columns, icons, creative headings, bare-year dates and clipped company names are the things that break Greenhouse and Workday. We call them out.",
  },
  {
    icon: FileSearch,
    title: "Fix it in the same run",
    body: "Beyond the diagnosis, the tool rewrites your resume around that job and exports a single-column, ATS-ready PDF with a matching cover letter.",
  },
];

export const Route = createFileRoute("/ats-resume-checker")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://terbey.com/ats-resume-checker" },
    ],
    links: [{ rel: "canonical", href: "https://terbey.com/ats-resume-checker" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AtsResumeChecker,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function AtsResumeChecker() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
        Free ATS Resume Checker
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Most resumes are rejected by software before a person ever opens them. Upload your resume,
        paste the job description, and get an instant ATS score, the keywords you are missing, and
        the formatting problems that stop Greenhouse, Workday and Lever from reading your experience
        correctly.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/tailor">
            Check my resume free <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/examples/resumes">See ATS resume examples</Link>
        </Button>
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        What the checker looks at
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {checks.map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-6">
            <c.icon className="size-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold text-card-foreground">
              {c.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        How to check your resume in three steps
      </h2>
      <ol className="mt-6 space-y-4 text-muted-foreground">
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">1. Upload your resume.</strong> The PDF text is
          extracted in your browser. Non-resume documents are rejected, so the score always reflects
          a real resume.
        </li>
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">2. Paste the job description.</strong> The
          checker compares required skills, tools and seniority against what your resume actually
          says, and detects the hiring country so the conventions match that market.
        </li>
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">3. Read the score and fix it.</strong> You get
          the ATS score, the match breakdown, missing keywords and coaching notes, plus a rewritten
          ATS-ready PDF you can download and send.
        </li>
      </ol>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        ATS resume checker FAQs
      </h2>
      <div className="mt-6 space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-semibold text-card-foreground">{f.q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-card-foreground">
          Score your resume against a real job posting
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Five free checks every month, missing keywords included on all of them.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/tailor">
            Run my free ATS check <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
