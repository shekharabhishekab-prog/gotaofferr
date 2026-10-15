import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

const URL = "https://terbey.com/blog/why-resumes-get-rejected-by-ats";
const TITLE = "Why Resumes Get Rejected by ATS Software (9 Real Reasons) | Terbey";
const DESCRIPTION =
  "Most ATS rejections come from parsing failures and keyword gaps, not a robot reading your resume badly. Here are the 9 real reasons and how to fix each one.";

const FAQS = [
  {
    q: "Does an ATS automatically reject resumes?",
    a: "Rarely by itself. Most ATS software parses, indexes and ranks resumes, and a human recruiter filters from the ranked list. What feels like an auto-rejection is usually a low rank caused by parsing failures (the system could not read your file) or a keyword gap (your vocabulary did not match the requisition).",
  },
  {
    q: "What resume format passes an ATS?",
    a: "A single-column PDF or DOCX with standard section headings (Summary, Experience, Education, Skills), selectable text, no tables, no icons, no text boxes, and no headers or footers. That structure parses cleanly in every major ATS.",
  },
  {
    q: "Do ATS keywords really matter?",
    a: "Yes. Recruiters search and filter the ATS database by the exact terms in the job requisition - skills, tools, certifications, titles. If the posting says 'demand generation' and your resume only says 'lead gen', you rank below candidates who mirror the posting's language.",
  },
  {
    q: "Can I check my resume against an ATS before applying?",
    a: "Yes. Paste your resume and the job description into Terbey's free ATS checker and it shows your score, the keywords you are missing, and the formatting problems that break parsing, before you submit the application.",
  },
];

export const Route = createFileRoute("/blog/why-resumes-get-rejected-by-ats")({
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
          headline: "Why resumes get rejected by ATS software: 9 real reasons",
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
  component: AtsRejectionGuide,
});

function AtsRejectionGuide() {
  return (
    <main className="site-container py-16 sm:py-24">
      <article className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Guide</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Why resumes get rejected by ATS software: 9 real reasons
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          You applied, you were qualified, and you heard nothing. It feels personal, but the cause
          is usually mechanical. Applicant tracking systems reject or bury resumes for a short list
          of repeatable reasons - and every one of them is fixable in under an hour. Here are the
          nine that account for almost all silent rejections.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            First, what an ATS actually does
          </h2>
          <p className="mt-4 text-muted-foreground">
            An ATS is not a robot judge. It is a database. When you apply, it parses your file into
            plain text, splits that text into fields (name, titles, dates, skills), and indexes it
            so a recruiter can search and filter. Rejections happen at two points: parsing (the
            system could not read your file correctly) and ranking (a recruiter filtered by keywords
            and your resume did not contain them). Both are resume problems, not verdicts on your
            career.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            The 9 reasons, and the fix for each
          </h2>
          <ol className="mt-5 space-y-4 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1. Tables and columns.</span> Parsers
              read left to right, top to bottom. A two-column layout scrambles your timeline into
              nonsense. <span className="text-foreground">Fix:</span> rebuild as a single column.
            </li>
            <li>
              <span className="font-semibold text-foreground">2. Text inside images or icons.</span>{" "}
              Skill bars, icon-only contact rows and logo watermarks are invisible to a parser.{" "}
              <span className="text-foreground">Fix:</span> every word that matters must be real,
              selectable text.
            </li>
            <li>
              <span className="font-semibold text-foreground">3. Headers and footers.</span> Many
              parsers skip them entirely - and that is where people put their name and phone
              number. <span className="text-foreground">Fix:</span> contact details go in the body,
              top of page one.
            </li>
            <li>
              <span className="font-semibold text-foreground">4. Non-standard section names.</span>{" "}
              "My journey" and "What I bring" do not map to database fields.{" "}
              <span className="text-foreground">Fix:</span> use Summary, Experience, Education,
              Skills - the labels the parser was trained on.
            </li>
            <li>
              <span className="font-semibold text-foreground">5. Missing hard keywords.</span> The
              requisition says "Kubernetes", your resume says "container orchestration". A
              recruiter filtering on "Kubernetes" never sees you.{" "}
              <span className="text-foreground">Fix:</span> mirror the posting's exact terms for
              skills, tools and certifications you genuinely have.
            </li>
            <li>
              <span className="font-semibold text-foreground">6. Job titles that do not match.</span>{" "}
              If you were a "Growth Hacker" applying to "Growth Marketing Manager" roles, the
              filter misses you. <span className="text-foreground">Fix:</span> put the market
              title in brackets next to your official one - "Growth Hacker (Growth Marketing
              Manager)".
            </li>
            <li>
              <span className="font-semibold text-foreground">7. Dates the parser cannot read.</span>{" "}
              "Summer 2024" or "2024 - now" breaks the timeline math some systems run.{" "}
              <span className="text-foreground">Fix:</span> use "Jun 2024 - Present" style, month
              plus year, for every role.
            </li>
            <li>
              <span className="font-semibold text-foreground">8. The wrong file type.</span> A
              scanned image-PDF or a .pages file parses as an empty document.{" "}
              <span className="text-foreground">Fix:</span> export a true PDF from your editor, or
              DOCX when the application allows it. Test: if you cannot select a sentence with your
              mouse, neither can the ATS.
            </li>
            <li>
              <span className="font-semibold text-foreground">9. Acronyms without the full term.</span>{" "}
              Recruiters search "Search Engine Optimization", not only "SEO".{" "}
              <span className="text-foreground">Fix:</span> write both once - "Search Engine
              Optimization (SEO)" - then use whichever reads better.
            </li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Check your resume in two minutes
          </h2>
          <p className="mt-4 text-muted-foreground">
            You do not have to guess which of these applies to you. Paste your resume and the job
            description into Terbey's free ATS checker: it runs the same parsing and keyword
            matching the hiring systems do, shows your score, and lists the exact missing terms and
            formatting problems to fix. If you want the fixes done for you, the Tailor tool rewrites
            the resume against the posting while keeping every fact from your original.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/ats-resume-checker">Check my resume free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tailor">Tailor it to a job</Link>
            </Button>
          </div>
        </section>

        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-8">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-foreground">{f.q}</h3>
                <p className="mt-2 text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
