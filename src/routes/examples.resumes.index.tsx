import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeExampleDownload } from "@/components/ResumeExampleDownload";
import { resumeExamples } from "@/lib/resume-examples";

const INITIAL_VISIBLE = 6;

const TITLE = "ATS Resume Examples & Master Resume Guide | Terbey";
const DESCRIPTION =
  "Free ATS-optimized resume examples for software engineer, product manager, brand manager and marketing roles — plus resumes rebuilt with Terbey.";
const CANONICAL = "https://terbey.com/examples/resumes";

export const Route = createFileRoute("/examples/resumes/")({
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
          name: "ATS-optimized resume examples",
          itemListElement: resumeExamples.map((example, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${example.role} resume example`,
            url: `https://terbey.com/examples/resumes/${example.slug}`,
          })),
        }),
      },
    ],
  }),

  component: ResumeExamplesIndex,
});

function ResumeExamplesIndex() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumeExamples;
    return resumeExamples.filter((example) =>
      [example.role, example.title, example.summaryLine, ...example.atsKeywords]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  // Only six show up front; searching or "show all" reveals the rest.
  const searching = query.trim().length > 0;
  const visible = searching || showAll ? matches : matches.slice(0, INITIAL_VISIBLE);
  const hiddenCount = matches.length - visible.length;

  return (
    <main className="site-container py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        The perfect master resume
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-foreground sm:text-5xl">
        ATS-optimized resume examples
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">
        Before you tailor a resume to a specific job, you need one strong master version that an
        applicant tracking system can actually read. These examples show the exact section order,
        keyword placement, and bullet formulas that survive automated screening — copy the structure,
        then let Terbey rebuild it for each company you apply to.
      </p>

      <div className="relative mt-10 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a role — designer, finance, HR…"
          aria-label="Search resume examples by role"
          className="pl-9"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((example) => (
          <Link
            key={example.slug}
            to="/examples/resumes/$slug"
            params={{ slug: example.slug }}
            className="group flex flex-col rounded-xl border border-border/60 bg-muted/20 p-6 transition-colors hover:border-primary/60"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              {example.role} resume example
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{example.summaryLine}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read the example
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
              <ResumeExampleDownload example={example} size="sm" label="Download PDF" />
            </div>
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No example for “{query.trim()}” yet — try a broader title, or tailor your own resume instead.
        </p>
      ) : null}

      {!searching && hiddenCount > 0 ? (
        <Button variant="outline" className="mt-8" onClick={() => setShowAll(true)}>
          Show all {matches.length} examples
        </Button>
      ) : null}


      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-foreground">
          What makes a resume ATS-optimized
        </h2>
        <ul className="mt-5 space-y-3 text-muted-foreground">
          <li>Single column, no tables, text boxes, icons, or photos — parsers drop what they can't read.</li>
          <li>
            Standard headings in this order: Summary, Core Skills, Key Achievements, Experience,
            Education, Projects, Additional.
          </li>
          <li>Keywords written exactly as the posting writes them, inside Core Skills and bullets.</li>
          <li>Every bullet starts with a verb and ends with a number.</li>
          <li>PDF export with selectable text, standard fonts, and no headers or footers.</li>
        </ul>
      </section>

      <section className="mt-12 max-w-3xl rounded-xl border border-primary/40 bg-primary/5 p-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Need the cover letter too?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Most of these roles have a matching cover letter example — the four parts that matter,
          sample lines you can adapt, and the clichés to cut before you send it.
        </p>
        <Button asChild className="mt-5">
          <Link to="/examples/cover-letters">
            Browse cover letter examples <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <p className="mt-8 max-w-3xl text-muted-foreground">
        Wondering whether software can do this for you? Read{" "}
        <Link
          to="/blog/can-ai-tailor-my-resume-to-a-job-posting"
          className="font-semibold text-primary underline underline-offset-4"
        >
          can AI tailor my resume to a job posting?
        </Link>
      </p>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link to="/tailor">Tailor my resume to a job description</Link>
        </Button>
      </div>
    </main>
  );
}
