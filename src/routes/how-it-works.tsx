import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Search, Upload, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How GotaOfferr Works — Resume Tailoring in 3 Steps" },
      {
        name: "description",
        content:
          "See how GotaOfferr reads your resume and a job description, rewrites your experience around the role, and exports polished PDFs.",
      },
      { property: "og:title", content: "How GotaOfferr Works — Resume Tailoring in 3 Steps" },
      {
        property: "og:description",
        content:
          "See how GotaOfferr reads your resume and a job description, rewrites your experience around the role, and exports polished PDFs.",
      },
      { property: "og:url", content: "https://gotaofferr.com/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/how-it-works" }],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: Search,
    title: "1. Find the jobs (or bring your own)",
    body: "Tell us the role, salary range and location and the AI searches across major job boards, returning matching listings in one list. Already found a posting yourself? Just paste it in.",
  },
  {
    icon: Upload,
    title: "2. Add your resume once",
    body: "Upload a PDF and the text is extracted right in your browser, or paste it in manually. This is the master resume you keep reusing — we never start you from a blank template.",
  },
  {
    icon: Wand2,
    title: "3. AI rebuilds it for that company",
    body: "Your summary, skills and experience bullets are reordered and rewritten around what that employer actually asks for, plus a matching cover letter.",
  },
  {
    icon: Download,
    title: "4. Download and apply",
    body: "Check the match score and missing keywords, then download the resume and cover letter as clean, ATS-friendly PDFs and head to the company's apply page.",
  },
];

function HowItWorks() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">How it works</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        GotaOfferr isn't a resume builder or a job board. It finds the right roles for you and turns
        one master resume into a targeted application — resume and cover letter — for every company.
      </p>


      <div className="mt-12 space-y-8">
        {steps.map((s) => (
          <div key={s.title} className="flex gap-5 rounded-xl border border-border bg-card p-6">
            <s.icon className="mt-1 size-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-lg font-semibold text-card-foreground">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-12 space-y-4 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Tips for better results
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Paste the full job description, not just the title. The more of the posting the AI can
            read, the better the keywords line up.
          </li>
          <li>
            Keep one honest master resume. GotaOfferr reframes what you already have and lists
            missing requirements as keyword gaps instead of inventing experience.
          </li>
          <li>
            Applying abroad? Tailoring follows the resume conventions of 11 job markets. See our
            guides for{" "}
            <a className="underline" href="/guides/dubai-resume-format">
              Dubai
            </a>
            ,{" "}
            <a className="underline" href="/guides/germany-resume-format">
              Germany
            </a>
            ,{" "}
            <a className="underline" href="/guides/canada-resume-format">
              Canada
            </a>{" "}
            and{" "}
            <a className="underline" href="/guides/uk-resume-format">
              the UK
            </a>
            .
          </li>
          <li>
            Check the ATS score and missing keywords before you download, then edit the source text
            and regenerate if something reads wrong.
          </li>
        </ul>
        <p>
          Want the details? Read{" "}
          <a className="underline" href="/blog/can-ai-tailor-my-resume-to-a-job-posting">
            can AI tailor my resume to a job posting
          </a>{" "}
          and{" "}
          <a className="underline" href="/blog/how-to-create-a-custom-resume-for-a-job-description">
            how to create a custom resume for a job description
          </a>
          . More questions? Read the{" "}
          <a className="underline" href="/faq">
            FAQ
          </a>
          , look at real{" "}
          <a className="underline" href="/examples/resumes">
            resume examples
          </a>
          , or{" "}
          <a className="underline" href="/contact">
            contact us
          </a>
          .
        </p>
      </section>

      <Button asChild className="mt-12">
        <Link to="/tailor">
          Tailor my resume <ArrowRight className="size-4" />
        </Link>
      </Button>
    </main>
  );
}
