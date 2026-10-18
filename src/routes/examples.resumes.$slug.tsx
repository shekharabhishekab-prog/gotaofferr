import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ResumeExampleDownload } from "@/components/ResumeExampleDownload";
import { getCoverLetterExample } from "@/lib/cover-letter-examples";
import type { ResumeExample } from "@/lib/resume-examples";
import { getResumeExample, resumeExamples } from "@/lib/resume-examples";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

export const Route = createFileRoute("/examples/resumes/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
    const example = getResumeExample(params.slug);
    if (!example) throw notFound();
    return { example };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Resume example not found — GotaOfferr" }, { name: "robots", content: "noindex" }],
      };
    }
    const { example } = loaderData;
    const url = `https://gotaofferr.com/examples/resumes/${example.slug}`;
    return {
      meta: [
        { title: example.metaTitle },
        { name: "description", content: example.metaDescription },
        { property: "og:title", content: example.metaTitle },
        { property: "og:description", content: example.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: example.title,
            description: example.metaDescription,
            image: [SITE_IMAGE],
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "GotaOfferr" },
            publisher: SITE_PUBLISHER,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://gotaofferr.com/" },
              {
                "@type": "ListItem",
                position: 2,
                name: "Resume examples",
                item: "https://gotaofferr.com/examples/resumes",
              },
              { "@type": "ListItem", position: 3, name: `${example.role} resume example`, item: url },
            ],
          }),
        },
        ...(example.faqs?.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: example.faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: { "@type": "Answer", text: faq.a },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: ResumeExamplePage,
  notFoundComponent: ExampleNotFound,
});

function ResumeExamplePage() {
  const { example } = Route.useLoaderData() as { example: ResumeExample };

  return (
    <main className="site-container py-16 sm:py-24">
      <nav className="text-sm text-muted-foreground">
        <Link to="/examples/resumes" className="hover:text-foreground">
          Resume examples
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{example.role}</span>
      </nav>

      <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold text-foreground sm:text-5xl">
        {example.title}
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">{example.summaryLine}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ResumeExampleDownload example={example} label="Download this example as PDF" />
        {getCoverLetterExample(example.slug) ? (
          <Button asChild variant="outline">
            <Link to="/examples/cover-letters/$slug" params={{ slug: example.slug }}>
              Matching cover letter example
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="rounded-xl border border-border/60 bg-muted/20 p-6 sm:p-8">
          <h2 className="sr-only">{example.role} resume example content</h2>
          {example.sections.map((section) => (
            <section key={section.heading} className="mb-8 last:mb-0">
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                {section.heading}
              </h3>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <aside className="space-y-8">
          <div className="rounded-xl border border-border/60 p-6">
            <h2 className="font-display text-lg font-bold text-foreground">ATS keywords to include</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {example.atsKeywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded-full border border-primary/40 px-3 py-1 text-xs text-foreground"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 p-6">
            <h2 className="font-display text-lg font-bold text-foreground">How to write yours</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {example.writingTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
            <h2 className="font-display text-lg font-bold text-foreground">
              Next: tailor it to a real job
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Paste this master resume plus a job description and GotaOfferr rebuilds it for that exact
              role, with a matching cover letter.
            </p>
            <Button asChild className="mt-5 w-full">
              <Link to="/tailor">Tailor my resume</Link>
            </Button>
          </div>
        </aside>
      </div>

      {example.recruiterFocus?.length ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground">
            What recruiters look for in a {example.role.toLowerCase()} resume
          </h2>
          <ul className="mt-5 space-y-3">
            {example.recruiterFocus.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-border/60 bg-card p-5 text-sm text-muted-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {example.mistakes?.length ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground">Common mistakes to avoid</h2>
          <ul className="mt-5 space-y-3">
            {example.mistakes.map((mistake) => (
              <li
                key={mistake}
                className="rounded-xl border border-border/60 bg-card p-5 text-sm text-muted-foreground"
              >
                {mistake}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {example.faqs?.length ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {example.role} resume FAQs
          </h2>
          <div className="mt-5 space-y-4">
            {example.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="font-display text-base font-semibold text-card-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="font-display text-xl font-bold text-foreground">Applying in India or abroad?</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link to="/guides/india-resume-format" className="hover:text-foreground">
              India resume format for job applications
            </Link>
          </li>
          <li>
            <Link to="/guides/dubai-resume-format" className="hover:text-foreground">
              Dubai / UAE resume format for Indian candidates
            </Link>
          </li>
          <li>
            <Link to="/guides/canada-resume-format" className="hover:text-foreground">
              Canada resume format for Indian applicants
            </Link>
          </li>
          <li>
            <Link to="/guides/australia-resume-format" className="hover:text-foreground">
              Australia resume format for Indian applicants
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground">More resume examples</h2>
        <ul className="mt-5 space-y-2 text-muted-foreground">
          {resumeExamples
            .filter((other) => other.slug !== example.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link
                  to="/examples/resumes/$slug"
                  params={{ slug: other.slug }}
                  className="hover:text-foreground"
                >
                  {other.role} resume example
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}

function ExampleNotFound() {
  return (
    <main className="site-container py-24">
      <h1 className="font-display text-3xl font-bold text-foreground">Resume example not found</h1>
      <p className="mt-4 text-muted-foreground">
        That example doesn't exist yet. Browse the full library instead.
      </p>
      <Button asChild className="mt-8">
        <Link to="/examples/resumes">All resume examples</Link>
      </Button>
    </main>
  );
}
