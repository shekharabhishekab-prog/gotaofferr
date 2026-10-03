import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

const URL = "https://gotaofferr.com/blog/can-ai-tailor-my-resume-to-a-job-posting";
const TITLE = "Can AI Tailor My Resume to a Job Posting? | GotaOfferr";
const DESCRIPTION =
  "Yes — here's exactly how AI tailors a resume to a job posting: keyword matching, ATS parsing, and rewritten bullets, and why it beats editing by hand.";

const FAQS = [
  {
    q: "Can AI tailor my resume to a job posting?",
    a: "Yes. An AI tool reads your master resume and the job description together, extracts the skills, tools, and responsibilities the posting asks for, and rewrites your summary, skills, and bullets so those exact terms appear where an applicant tracking system looks for them — without inventing experience you don't have.",
  },
  {
    q: "Will an ATS reject an AI-tailored resume?",
    a: "No. Applicant tracking systems score text and formatting, not authorship. A single-column PDF with standard headings and selectable text parses cleanly whether a human or an AI wrote it.",
  },
  {
    q: "Is AI tailoring better than editing my resume manually?",
    a: "It is faster and more consistent. Manual tailoring takes 30-45 minutes per application and people skip it under pressure. AI does the keyword mapping in under a minute, so every application gets a tailored version instead of only the first few.",
  },
  {
    q: "Does AI tailoring mean lying on my resume?",
    a: "It shouldn't. Good tailoring re-frames real experience using the posting's vocabulary and moves the most relevant achievements up the page. GotaOfferr keeps every section of your original resume and never fabricates employers, dates, or titles.",
  },
];

export const Route = createFileRoute("/blog/can-ai-tailor-my-resume-to-a-job-posting")({
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
          headline: "Can AI tailor my resume to a job posting?",
          description: DESCRIPTION,
          image: [SITE_IMAGE],
          mainEntityOfPage: URL,
          author: { "@type": "Organization", name: "GotaOfferr" },
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
  component: CanAiTailorGuide,
});

function CanAiTailorGuide() {
  return (
    <main className="site-container py-16 sm:py-24">
      <article className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Guide</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Can AI tailor my resume to a job posting?
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Yes — and it does the part humans skip. AI reads the job description and your resume side
          by side, then rewrites the wording so the posting's own keywords land in the sections an
          applicant tracking system actually scores. Below is exactly how that works, where it beats
          manual editing, and where you still need to check the output yourself.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            What "tailoring" means to an ATS
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most companies run applications through an applicant tracking system before a recruiter
            sees them. The ATS parses your PDF into plain text, maps it to fields (titles, dates,
            skills), and ranks it against the requisition. Two resumes with identical experience can
            score very differently purely on vocabulary: if the posting says "demand generation" and
            your resume says "lead gen", the match is weaker.
          </p>
          <p className="mt-4 text-muted-foreground">
            Tailoring is the work of closing that gap — mirroring the posting's terms, promoting the
            achievements that match its priorities, and keeping the file structurally readable.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            How AI resume tailoring actually works
          </h2>
          <ol className="mt-5 space-y-4 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1. Parsing.</span> Your PDF is
              converted to structured text so every section — summary, skills, experience,
              education, projects — is recognised individually.
            </li>
            <li>
              <span className="font-semibold text-foreground">2. Requirement extraction.</span> The
              job description is broken into hard skills, tools, seniority signals, and
              responsibilities, separated from boilerplate.
            </li>
            <li>
              <span className="font-semibold text-foreground">3. Gap matching.</span> Each
              requirement is matched against evidence already in your resume, so the rewrite is
              grounded in real experience rather than invented for the posting.
            </li>
            <li>
              <span className="font-semibold text-foreground">4. Rewriting.</span> Summary, Core
              Skills, and Key Achievements are rebuilt using the posting's exact phrasing, and
              bullets are reordered so the most relevant proof sits near the top of the page.
            </li>
            <li>
              <span className="font-semibold text-foreground">5. ATS-safe export.</span> The result
              is rendered as a single-column PDF with standard headings, selectable text, no tables
              or icons, and no headers or footers.
            </li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Why it beats tailoring by hand
          </h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Speed.</span> Manual tailoring takes
              30-45 minutes per role. AI takes under a minute, so all twenty applications get a
              tailored version, not just the first two.
            </li>
            <li>
              <span className="font-semibold text-foreground">Coverage.</span> People skim postings
              and miss secondary requirements buried in the third paragraph. A model reads all of
              it.
            </li>
            <li>
              <span className="font-semibold text-foreground">Consistency.</span> Section order,
              bullet structure, and formatting stay ATS-safe every time instead of drifting as you
              copy-paste between versions.
            </li>
            <li>
              <span className="font-semibold text-foreground">Objectivity.</span> It's hard to cut
              your own favourite achievement; a tool ranks by relevance to this posting.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            What you should still check
          </h2>
          <p className="mt-4 text-muted-foreground">
            Read the output once before you send it. Confirm every number and title is accurate,
            remove any keyword you couldn't defend in an interview, and make sure the tone sounds
            like you. AI handles the mapping; the truth of the document is still yours.
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
            <Link to="/tailor">Tailor my resume to a job posting</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/blog/how-to-create-a-custom-resume-for-a-job-description">
              How to write a custom resume manually
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
                How GotaOfferr works
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
