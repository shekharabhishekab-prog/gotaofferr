import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

const URL =
  "https://terbey.com/blog/how-to-create-a-custom-resume-for-a-job-description";
const TITLE = "How to Write a Custom Resume for a Job | Terbey";
const DESCRIPTION =
  "A step-by-step guide to writing a custom resume to the job description: requirement mapping, keyword optimisation, and an ATS-safe layout that scores.";

const FAQS = [
  {
    q: "How do I write a custom resume to the job description?",
    a: "Build a requirement map first: list every hard skill, tool, and responsibility the posting names, then match each one to real evidence in your resume. Rewrite your summary, core skills, and top bullets using the posting's exact vocabulary, promote the achievements that prove those requirements, and export a single-column ATS-safe PDF.",
  },
  {
    q: "How long should customising a resume take?",
    a: "Done properly by hand it takes 30-45 minutes per application — roughly 10 minutes to map requirements, 20 to rewrite, and 10 to proofread and export. That is why most people tailor the first two applications and send a generic file for the rest.",
  },
  {
    q: "How many keywords from the job description should I use?",
    a: "Cover every must-have requirement you can genuinely evidence, usually 8-15 terms. Place them naturally inside your summary, core skills, and achievement bullets. Never paste a keyword list or hide white text — applicant tracking systems flag stuffing and recruiters discard it.",
  },
  {
    q: "Should I change my resume for every single job?",
    a: "Yes for every role you seriously want. Keep one master resume with all your experience, then produce a customised version per posting. The heavy edits are almost always the summary, core skills, and the ordering of bullets — your history itself stays fixed.",
  },
];

export const Route = createFileRoute("/blog/how-to-create-a-custom-resume-for-a-job-description")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to create a custom resume to the job description",
          description: DESCRIPTION,
          image: [SITE_IMAGE],
          mainEntityOfPage: URL,
          author: { "@type": "Organization", name: "Terbey" },
          publisher: SITE_PUBLISHER,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: CustomResumeGuide,
});

const STEPS = [
  {
    title: "1. Split the posting into requirements",
    body: "Paste the job description into a blank document and strip the boilerplate — culture blurbs, benefits, equal-opportunity text. What remains is your checklist: hard skills, tools and platforms, years of experience, ownership scope, and the outcomes the team is measured on. Mark each item must-have or nice-to-have. Requirements listed first, or repeated across the summary and responsibilities, carry the most weight.",
  },
  {
    title: "2. Map every requirement to real evidence",
    body: "Next to each requirement, write the line from your master resume that proves it — a project, a metric, a tool you shipped with. Three outcomes appear: direct hits (keep the wording, adopt the posting's term), adjacent hits (you did the work under a different name — rename it to match), and genuine gaps (leave them out; never invent them). This map, not the rewrite, is where tailoring is actually won.",
  },
  {
    title: "3. Rewrite the summary for this one role",
    body: "Your professional summary is the highest-value real estate on the page. Three lines: the role title as the posting names it, your years and domain, and the two requirements the team clearly cares most about, each backed by a number. A summary that opens with 'Brand Manager with 6 years in D2C skincare' beats 'Results-driven professional' for every reader — human or machine.",
  },
  {
    title: "4. Rebuild core skills with the posting's vocabulary",
    body: "Applicant tracking systems match strings, not synonyms. If the posting says 'demand generation', 'GA4', or 'stakeholder management', those exact phrases belong in your skills block — provided you can defend them. Cut skills the role never mentions; a tight, relevant list reads stronger than a wall of twenty tools.",
  },
  {
    title: "5. Reorder and rewrite your achievement bullets",
    body: "Keep the same jobs and dates, but reorder bullets inside each role so the ones proving this posting's must-haves come first. Rewrite each in the shape action + method + measurable outcome: 'Cut paid CAC 31% by restructuring Meta campaigns around first-party audiences.' Recruiters read the top two bullets of your most recent role closely and skim the rest — so put your best proof there.",
  },
  {
    title: "6. Export ATS-safe and proofread once",
    body: "Single column, standard headings (Summary, Core Skills, Key Achievements, Experience, Education), selectable text, no tables, text boxes, icons, or graphics, and nothing critical in a header or footer. Name the file Firstname-Lastname-Role.pdf. Then read it once out loud: every number accurate, every keyword defensible in an interview.",
  },
];

function CustomResumeGuide() {
  return (
    <main className="site-container py-16 sm:py-24">
      <article className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Guide</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          How to create a custom resume to the job description
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          A custom resume is not a new resume — it is your real history, re-mapped so the
          requirements this employer cares about are impossible to miss. The manual process below is
          the gold standard for accuracy: requirement mapping, then keyword optimisation, then an
          ATS-safe export. It takes about 40 minutes per application. Do it by hand once so you
          understand what good looks like, then decide whether to keep spending 40 minutes a role.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Why a generic resume loses before a human reads it
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most applications pass through an applicant tracking system first. The ATS parses your
            PDF into plain text, maps it to fields, and scores it against the requisition. Two
            candidates with identical experience score differently purely on vocabulary: if the
            posting asks for "demand generation" and your resume says "lead gen", the match weakens.
            Recruiters then spend six to eight seconds on the page. A custom resume fixes both —
            it speaks the posting's language, and it front-loads the proof.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            The six-step manual process
          </h2>
          <ol className="mt-6 space-y-8">
            {STEPS.map((step) => (
              <li key={step.title}>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            A worked requirement map
          </h2>
          <p className="mt-4 text-muted-foreground">
            Say the posting asks for "owning the paid social budget", "reporting in GA4", and
            "managing an agency". Your map might read:
          </p>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Owning the paid social budget →</span>{" "}
              "Managed ₹1.2Cr annual Meta and LinkedIn spend" — direct hit, keep and promote to the
              first bullet.
            </li>
            <li>
              <span className="font-semibold text-foreground">Reporting in GA4 →</span> "Built
              weekly performance dashboards in Google Analytics" — adjacent hit, rename to GA4
              because that is the tool you actually used.
            </li>
            <li>
              <span className="font-semibold text-foreground">Managing an agency →</span> "Briefed
              and reviewed two external creative partners" — direct hit under different wording;
              adopt the word "agency".
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Anything with no evidence stays off the page. Tailoring re-frames the truth; it never
            manufactures it.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Keyword optimisation without keyword stuffing
          </h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Match the exact string.</span> Use the
              posting's spelling and casing for tools and certifications, and spell out an acronym
              once alongside its short form.
            </li>
            <li>
              <span className="font-semibold text-foreground">Place them where they score.</span>{" "}
              Summary, Core Skills, and your top experience bullets carry more weight than a skills
              block at the bottom of page two.
            </li>
            <li>
              <span className="font-semibold text-foreground">Cap it at what you can defend.</span>{" "}
              8-15 well-placed terms outperform 40 crammed ones, and every keyword is fair game in
              the interview.
            </li>
            <li>
              <span className="font-semibold text-foreground">Never hide text.</span> White-on-white
              keywords and invisible blocks get flagged on parse and are an instant reject.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            The honest problem with doing this by hand
          </h2>
          <p className="mt-4 text-muted-foreground">
            The manual process works. It just doesn't survive contact with a real job hunt. Forty
            minutes per application means twenty applications is over thirteen hours of rewriting,
            so almost everyone tailors the first two carefully and sends a generic file for the rest
            — which are exactly the ones the ATS filters out. Consistency, not craft, is where
            candidates lose.
          </p>
          <p className="mt-4 text-muted-foreground">
            Terbey runs the same six steps in under a minute: it parses your master resume,
            extracts the posting's requirements, maps them against your real experience, rewrites
            the summary, core skills, and achievement bullets in the posting's vocabulary, and
            exports a single-column ATS-safe PDF with every original section preserved. You still
            do the last step — read it once and confirm every claim is yours.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <dl className="mt-5 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-2 text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link to="/tailor">Build my custom resume in a minute</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/blog/can-ai-tailor-my-resume-to-a-job-posting">
              Can AI tailor my resume?
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/examples/resumes">See ATS resume examples</Link>
          </Button>
        </div>

        <section className="mt-12 text-muted-foreground">
          <h2 className="font-display text-2xl font-bold text-foreground">Related reading</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <a className="underline" href="/ats-resume-checker">
                ATS resume checker
              </a>{" "}
              - see how a tracking system reads your resume.
            </li>
            <li>
              <a className="underline" href="/ai-cover-letter-generator">
                AI cover letter generator
              </a>{" "}
              - a letter written for the company and role.
            </li>
            <li>
              <a className="underline" href="/resume-builder">
                Resume builder
              </a>{" "}
              - start from scratch in the Indian or international format.
            </li>
            <li>
              <a className="underline" href="/how-it-works">
                How Terbey works
              </a>{" "}
              and the{" "}
              <a className="underline" href="/faq">
                FAQ
              </a>
              .
            </li>
            <li>
              Country guides:{" "}
              <a className="underline" href="/guides/india-resume-format">
                India
              </a>
              ,{" "}
              <a className="underline" href="/guides/dubai-resume-format">
                Dubai
              </a>
              ,{" "}
              <a className="underline" href="/guides/uk-resume-format">
                UK
              </a>
              ,{" "}
              <a className="underline" href="/guides/canada-resume-format">
                Canada
              </a>
              .
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
