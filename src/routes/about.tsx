import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GotaOfferr — Why We Built a Resume Rewriter" },
      {
        name: "description",
        content:
          "GotaOfferr was built for job seekers tired of manually rewriting the same resume for every company they apply to.",
      },
      { property: "og:title", content: "About GotaOfferr — Why We Built a Resume Rewriter" },
      {
        property: "og:description",
        content:
          "GotaOfferr was built for job seekers tired of manually rewriting the same resume for every company they apply to.",
      },
      { property: "og:url", content: "https://gotaofferr.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/about" }],
  }),
  component: About,
});

function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">About GotaOfferr</h1>

      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Most people apply to dozens of roles with the same generic resume, then wonder why the
          replies never come. Recruiters and applicant tracking systems both look for a direct match
          between what the posting asks for and what your resume says — and a one-size-fits-all CV
          rarely provides it.
        </p>
        <p>
          Tailoring manually works, but it's slow. Rewriting your summary, reordering skills, and
          reframing every bullet for one application can take an hour. Multiply that by twenty
          applications and most people simply give up and send the default version.
        </p>
        <p>
          GotaOfferr closes that gap. You keep one master resume; we rebuild it for each specific
          company and role in seconds, complete with a cover letter, a match score, and the keywords
          you're missing. Same truth about your experience, framed for the job in front of you.
        </p>
        <p>
          GotaOfferr is a sole proprietorship business operated by AB24 SOLUTIONS, Delhi, India. Nothing
          is stored on our servers and no account is required — paste, generate, download, apply.
        </p>
      </div>

      <section className="mt-12 space-y-4 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">What you get</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            A tailored resume and cover letter for each job, with a match score, an ATS score, the
            keywords you are missing, and tips to close the gap.
          </li>
          <li>
            Country-aware formatting for 11 job markets, so a resume for Dubai, Germany or the UK
            follows local conventions instead of one generic template.
          </li>
          <li>
            A job finder that searches major job boards for roles that fit your resume, ranks the
            searched city first, and lets you tailor your resume to a listing in one click.
          </li>
          <li>A free resume builder and ATS checker if you are starting from scratch.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">Where to go next</h2>
        <p>
          New here? Read{" "}
          <a className="underline" href="/how-it-works">
            how it works
          </a>
          , try the{" "}
          <a className="underline" href="/resume-builder">
            resume builder
          </a>
          , browse{" "}
          <a className="underline" href="/jobs">
            the job finder
          </a>
          , or check the{" "}
          <a className="underline" href="/faq">
            FAQ
          </a>
          . Preparing for a specific market? See our resume format guides for{" "}
          <a className="underline" href="/guides/dubai-resume-format">
            Dubai
          </a>
          ,{" "}
          <a className="underline" href="/guides/india-resume-format">
            India
          </a>
          ,{" "}
          <a className="underline" href="/guides/uk-resume-format">
            the UK
          </a>{" "}
          and more. Questions? Reach us on the{" "}
          <a className="underline" href="/contact">
            contact page
          </a>
          .
        </p>
      </section>

      <Button asChild className="mt-10">
        <Link to="/tailor">Tailor my resume</Link>
      </Button>
    </main>
  );
}
