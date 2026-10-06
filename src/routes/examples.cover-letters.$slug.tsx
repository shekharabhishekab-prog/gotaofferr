import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { CoverLetterExample } from "@/lib/cover-letter-examples";
import { coverLetterExamples, getCoverLetterExample } from "@/lib/cover-letter-examples";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

export const Route = createFileRoute("/examples/cover-letters/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
    const example = getCoverLetterExample(params.slug);
    if (!example) throw notFound();
    return { example };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Cover letter example not found — GotaOfferr" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { example } = loaderData;
    const url = `https://gotaofferr.com/examples/cover-letters/${example.slug}`;
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
                name: "Cover letter examples",
                item: "https://gotaofferr.com/examples/cover-letters",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `${example.role} cover letter example`,
                item: url,
              },
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
  component: CoverLetterExamplePage,
  notFoundComponent: CoverLetterNotFound,
});

function CoverLetterExamplePage() {
  const { example } = Route.useLoaderData() as { example: CoverLetterExample };

  return (
    <main className="site-container py-16 sm:py-24">
      <nav className="text-sm text-muted-foreground">
        <Link to="/examples/cover-letters" className="hover:text-foreground">
          Cover letter examples
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{example.role}</span>
      </nav>

      <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold text-foreground sm:text-5xl">
        {example.title}
      </h1>
      <p className="mt-5 max-w-2xl text-muted-foreground">{example.intro}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/tailor">Generate this cover letter in 30 seconds</Link>
        </Button>
        {example.resumeExampleSlug ? (
          <Button asChild size="lg" variant="outline">
            <Link
              to="/examples/resumes/$slug"
              params={{ slug: example.resumeExampleSlug }}
            >
              See the matching resume example
            </Link>
          </Button>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-foreground">
          The four parts, with sample lines
        </h2>
        <ol className="mt-6 space-y-4">
          {example.structure.map((step, index) => (
            <li key={step.label} className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-base font-semibold text-card-foreground">
                {index + 1}. {step.label}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.guidance}</p>
              <p className="mt-4 border-l-2 border-primary/60 pl-4 text-sm italic leading-relaxed text-foreground">
                {step.sample}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/60 p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Phrases that work</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {example.phrases.map((phrase) => (
              <li key={phrase}>{phrase}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Cut these before sending</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {example.avoid.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-14 rounded-xl border border-primary/40 bg-primary/5 p-6">
        <h2 className="font-display text-lg font-bold text-foreground">
          Applying in India vs abroad
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{example.localeNote}</p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link to="/guides/uk-resume-format" className="hover:text-foreground">
              UK CV and cover letter conventions
            </Link>
          </li>
          <li>
            <Link to="/guides/dubai-resume-format" className="hover:text-foreground">
              Dubai / UAE application format
            </Link>
          </li>
          <li>
            <Link to="/guides/canada-resume-format" className="hover:text-foreground">
              Canada application format
            </Link>
          </li>
        </ul>
      </section>

      {example.faqs.length ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {example.role} cover letter FAQs
          </h2>
          <div className="mt-5 space-y-4">
            {example.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground">
          More cover letter examples
        </h2>
        <ul className="mt-5 space-y-2 text-muted-foreground">
          {coverLetterExamples
            .filter((other) => other.slug !== example.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link
                  to="/examples/cover-letters/$slug"
                  params={{ slug: other.slug }}
                  className="hover:text-foreground"
                >
                  {other.role} cover letter example
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <div className="mt-14 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-card-foreground">
          Stop rewriting this from scratch
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Paste the job description, upload your resume, and get a matching cover letter and
          ATS-ready resume together — ten free every month.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/tailor">Write my cover letter</Link>
        </Button>
      </div>
    </main>
  );
}

function CoverLetterNotFound() {
  return (
    <main className="site-container py-24">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Cover letter example not found
      </h1>
      <p className="mt-4 text-muted-foreground">
        That example doesn't exist yet. Browse the full library instead.
      </p>
      <Button asChild className="mt-8">
        <Link to="/examples/cover-letters">All cover letter examples</Link>
      </Button>
    </main>
  );
}

