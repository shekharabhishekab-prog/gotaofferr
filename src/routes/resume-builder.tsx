import { createFileRoute } from "@tanstack/react-router";

import { ResumeBuilder } from "@/components/ResumeBuilder";
import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";

const TITLE = "Free Resume Builder, Indian & International | GotaOfferr";
const DESCRIPTION =
  "Build an ATS-friendly resume in minutes. Pick the Indian or international format, let AI polish your bullets, and download a clean PDF.";
const CANONICAL = "https://gotaofferr.com/resume-builder";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "GotaOfferr Resume Builder",
          applicationCategory: "BusinessApplication",
          description: DESCRIPTION,
          url: CANONICAL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }),
      },
    ],
  }),
  component: ResumeBuilderPage,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function ResumeBuilderPage() {
  return (
    <main className="bg-background pt-12">
      <div className="site-container text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Start from scratch
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold text-foreground sm:text-4xl">
          Build an ATS-friendly resume — national or international
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          No resume yet? Fill in what you know in plain words. Pick the Indian format or the
          international format, and AI rewrites your notes into professional, recruiter-ready copy.
        </p>
      </div>
      <ResumeBuilder />

      <section className="site-container mx-auto max-w-3xl space-y-4 py-16 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">
          How the resume builder works
        </h2>
        <p>
          Write your experience in plain words, the way you would explain it to a friend. The AI
          turns your notes into clear bullet points with action verbs and results, and lays them out
          in a single-column format that applicant tracking systems read reliably.
        </p>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Indian or international format
        </h3>
        <p>
          Pick the format that fits where you are applying. The international format is short and
          achievement-led. The Indian format keeps the personal and academic details that Indian
          recruiters expect. Applying to a specific country? Read our resume format guides for{" "}
          <a className="underline" href="/guides/india-resume-format">
            India
          </a>
          ,{" "}
          <a className="underline" href="/guides/dubai-resume-format">
            Dubai
          </a>
          ,{" "}
          <a className="underline" href="/guides/uk-resume-format">
            the UK
          </a>
          ,{" "}
          <a className="underline" href="/guides/germany-resume-format">
            Germany
          </a>{" "}
          and{" "}
          <a className="underline" href="/guides/canada-resume-format">
            Canada
          </a>
          .
        </p>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Already have a resume?
        </h3>
        <p>
          Skip the builder and{" "}
          <a className="underline" href="/tailor">
            tailor your existing resume
          </a>{" "}
          to a specific job, or see{" "}
          <a className="underline" href="/how-it-works">
            how it works
          </a>{" "}
          and the{" "}
          <a className="underline" href="/faq">
            FAQ
          </a>
          .
        </p>
      </section>
    </main>
  );
}
