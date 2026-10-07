import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, MessageSquareQuote, Sparkles, Timer } from "lucide-react";

import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";
import { Button } from "@/components/ui/button";

const TITLE = "AI Cover Letter Generator — Tailored to the Job in Seconds";
const DESCRIPTION =
  "Generate a cover letter built around one job description, using your real resume facts and the posting's keywords. ATS-ready PDF, 3 free monthly.";

const faqs = [
  {
    q: "How does the AI cover letter generator work?",
    a: "You upload your resume and paste the job description. The generator reads both, pulls the achievements from your own history that map to what the posting asks for, and writes a letter around those specific points. It never invents an employer, a metric or a qualification you did not list.",
  },
  {
    q: "Is the cover letter generator free?",
    a: "Yes. Every account gets 3 free tailored applications each month, and the cover letter is included with the resume rewrite on all of them. The Starter Pack adds 20 rewrites with cover letters, and larger packages go further.",
  },
  {
    q: "Will it sound like AI wrote it?",
    a: "That is the thing we optimise hardest against. The output avoids the buzzword patterns recruiters now read as machine-written — no 'leveraging synergies', no 'passionate about driving impact'. It uses your own phrasing, your own numbers and plain professional English.",
  },
  {
    q: "Is the cover letter ATS-readable?",
    a: "Yes. It exports as a single-column PDF with selectable text, standard headings and no tables or graphics, so Greenhouse, Workday and Lever parse it correctly alongside your resume.",
  },
  {
    q: "Can I use it for jobs in another country?",
    a: "Yes. The generator detects the hiring country from the job description and adapts conventions — date format, currency, spelling and, for cross-border applications, an explicit line about relocation and visa sponsorship.",
  },
];

const features = [
  {
    icon: MessageSquareQuote,
    title: "Written around one posting",
    body: "Not a template with your name dropped in. Each letter opens on the specific problem the role exists to solve and answers it with evidence from your history.",
  },
  {
    icon: Sparkles,
    title: "Keyword-aware without stuffing",
    body: "The required skills and tools from the job description appear naturally in the letter, so both the parser and the hiring manager see the match.",
  },
  {
    icon: FileText,
    title: "Matches your tailored resume",
    body: "The letter is generated in the same run as the rewritten resume, so the two documents tell one consistent story instead of contradicting each other.",
  },
  {
    icon: Timer,
    title: "Under a minute per application",
    body: "Upload once, paste a job description, download both PDFs. Applying to ten roles stops being a weekend project.",
  },
];

export const Route = createFileRoute("/ai-cover-letter-generator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://gotaofferr.com/ai-cover-letter-generator" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/ai-cover-letter-generator" }],
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
  component: AiCoverLetterGenerator,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function AiCoverLetterGenerator() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
        AI Cover Letter Generator
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        A generic cover letter is worse than none. Paste the job description, upload your resume,
        and get a letter written around that exact posting — using your real achievements, the
        employer's own language, and a tone that reads like you wrote it on a good day.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/tailor">
            Write my cover letter free <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/examples/cover-letters">See cover letter examples by role</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/ats-resume-checker">Check my resume first</Link>
        </Button>
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        What makes these letters land
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6">
            <f.icon className="size-6 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold text-card-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        How to generate a cover letter in three steps
      </h2>
      <ol className="mt-6 space-y-4 text-muted-foreground">
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">1. Upload your resume.</strong> This is the source
          of truth for every claim in the letter — your employers, dates, tools and numbers are
          carried across exactly as you wrote them.
        </li>
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">2. Paste the job description.</strong> The
          generator identifies what the role actually needs, which of your achievements answer it,
          and which market conventions apply for that country.
        </li>
        <li className="rounded-xl border border-border bg-card p-5 text-sm">
          <strong className="text-card-foreground">3. Download both PDFs.</strong> You get the
          tailored cover letter and a matching ATS-ready resume, plus a match score and the keywords
          you were missing.
        </li>
      </ol>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        What goes into each letter
      </h2>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p className="rounded-xl border border-border bg-card p-5">
          <strong className="text-card-foreground">The opening.</strong> One or two sentences naming
          the role and the single strongest reason you are a credible candidate for it — not "I am
          writing to express my interest in the above position."
        </p>
        <p className="rounded-xl border border-border bg-card p-5">
          <strong className="text-card-foreground">The evidence.</strong> Two short paragraphs
          mapping the posting's top requirements to things you have actually done, with the numbers
          from your resume intact.
        </p>
        <p className="rounded-xl border border-border bg-card p-5">
          <strong className="text-card-foreground">The close.</strong> A direct, unfussy sign-off,
          plus a relocation and visa-sponsorship line when you are applying across borders.
        </p>
      </div>

      <h2 className="mt-16 font-display text-2xl font-semibold text-foreground">
        AI cover letter generator FAQs
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
          Write a cover letter for the job in front of you
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Ten free tailored applications every month — resume and cover letter together.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/tailor">
            Generate my cover letter <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
