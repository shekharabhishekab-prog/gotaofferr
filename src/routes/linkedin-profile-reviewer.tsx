import { createFileRoute } from "@tanstack/react-router";

import { LinkedInReviewer } from "@/components/LinkedInReviewer";
import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";

const TITLE = "Free LinkedIn Profile Reviewer — Score Your Profile | GotaOfferr";
const DESCRIPTION =
  "Paste your LinkedIn headline, About section, experience and skills to get a free 0-100 profile score with specific fixes, plus keyword alignment and rewrites on paid plans.";
const CANONICAL = "https://gotaofferr.com/linkedin-profile-reviewer";

const faqs = [
  {
    q: "Is the LinkedIn profile review free?",
    a: "Yes. The overall score out of 100 and the feedback on your headline, About section and skills are free and need no login. You only sign in to save or download the report as a PDF.",
  },
  {
    q: "What does the paid report add?",
    a: "Job Hunt Pack and Career Pro Pack add keyword alignment against a target role you type in, industry-specific suggestions, and a full rewritten experience section on top of the LinkedIn About rewrite already included in those plans.",
  },
  {
    q: "Do I need to share my LinkedIn login?",
    a: "No. You paste your profile text yourself — headline, About, experience bullets and skills. The profile URL is optional and we never ask for your LinkedIn password.",
  },
  {
    q: "Will the rewrites sound AI generated?",
    a: "No. The rewrite keeps your own facts, employers and numbers, and avoids buzzwords, so it reads like you wrote it.",
  },
];

export const Route = createFileRoute("/linkedin-profile-reviewer")({
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
  component: LinkedInReviewerPage,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function LinkedInReviewerPage() {
  return (
    <main className="bg-background pt-12">
      <div className="site-container text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Free tool</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold text-foreground sm:text-4xl">
          LinkedIn Profile Reviewer
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Recruiters search LinkedIn before they ever open your resume. Paste your headline, About
          section, experience bullets and skills, and get an instant score out of 100 with specific
          fixes — no login required.
        </p>
      </div>

      <LinkedInReviewer />

      <section className="site-container pb-24">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          LinkedIn profile reviewer FAQs
        </h2>
        <div className="mt-6 space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-semibold text-card-foreground">{f.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
