import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";
import { Button } from "@/components/ui/button";
import { coverLetterExamples } from "@/lib/cover-letter-examples";

const TITLE = "Cover Letter Examples by Role: Short, ATS-Ready | Terbey";
const DESCRIPTION =
  "Cover letter examples for software engineers, freshers, business analysts, marketing and support roles — the structure, sample lines and clichés to cut.";
const CANONICAL = "https://terbey.com/examples/cover-letters";

export const Route = createFileRoute("/examples/cover-letters/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Cover letter examples by role",
          itemListElement: coverLetterExamples.map((example, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${example.role} cover letter example`,
            url: `https://terbey.com/examples/cover-letters/${example.slug}`,
          })),
        }),
      },
    ],
  }),
  component: CoverLetterExamplesIndex,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function CoverLetterExamplesIndex() {
  return (
    <main className="site-container py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Cover letters that get read
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground sm:text-5xl">
        Cover letter examples by role
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        A cover letter has about fifteen seconds to say something your resume cannot. These examples
        skip the full-page template and show the four parts that actually matter — the opening line,
        the reason it's this company, the proof, and the close — with sample lines you can adapt for
        both Indian and international applications.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coverLetterExamples.map((example) => (
          <Link
            key={example.slug}
            to="/examples/cover-letters/$slug"
            params={{ slug: example.slug }}
            className="group flex flex-col rounded-xl border border-border/60 bg-muted/20 p-6 transition-colors hover:border-primary/60"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              {example.role} cover letter
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{example.summaryLine}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Read the example
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-foreground">
          What every good cover letter does
        </h2>
        <ul className="mt-5 space-y-3 text-muted-foreground">
          <li>Stays between 150 and 250 words — one screen, four short paragraphs.</li>
          <li>Opens on a result or the closest thing you've built, never "I am writing to apply".</li>
          <li>Names one specific, checkable reason for this employer.</li>
          <li>Repeats no more than two lines from the resume; adds context instead.</li>
          <li>Exports as a plain single-column PDF so parsers read it alongside the resume.</li>
        </ul>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-foreground">Keep going</h2>
        <ul className="mt-5 space-y-2 text-muted-foreground">
          <li>
            <Link to="/examples/resumes" className="hover:text-foreground">
              ATS resume examples by role
            </Link>
          </li>
          <li>
            <Link to="/ai-cover-letter-generator" className="hover:text-foreground">
              How the AI cover letter generator works
            </Link>
          </li>
          <li>
            <Link to="/ats-resume-checker" className="hover:text-foreground">
              Check your resume against a job description
            </Link>
          </li>
        </ul>
      </section>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link to="/tailor">
            Write my cover letter for a real job <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
