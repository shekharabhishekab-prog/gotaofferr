import { createFileRoute } from "@tanstack/react-router";

import { ResumeTailor } from "@/components/ResumeTailor";
import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";

export const Route = createFileRoute("/tailor")({
  head: () => ({
    meta: [
      { title: "Tailor Your Resume — GotaOfferr" },
      {
        name: "description",
        content:
          "Paste your resume and a job description. Get a tailored, ATS-friendly resume and cover letter PDF in seconds. Free to start.",
      },
      { property: "og:title", content: "Tailor Your Resume — GotaOfferr" },
      {
        property: "og:description",
        content:
          "Paste your resume and a job description. Get a tailored, ATS-friendly resume and cover letter PDF in seconds. Free to start.",
      },
      { property: "og:url", content: "https://gotaofferr.com/tailor" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/tailor" }],
  }),
  component: TailorPage,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function TailorPage() {
  return (
    <main className="bg-background">
      <div className="site-container pt-12 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Tailor your resume
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Add your default resume and the job description you're applying to. We'll rebuild both your
          resume and cover letter for that exact role.
        </p>
      </div>
      <ResumeTailor />

      <section className="site-container mx-auto max-w-3xl space-y-4 py-16 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">
          What happens when you tailor a resume
        </h2>
        <p>
          GotaOfferr reads the job description, finds the skills, keywords and responsibilities the
          employer cares about, and rewrites your summary, skills and experience bullets around
          them. It keeps your real experience. Anything the job asks for that your resume does not
          show appears in a missing keywords list, so you know what to add honestly.
        </p>
        <h3 className="font-display text-lg font-semibold text-foreground">What you get back</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>A rewritten resume in a single-column, ATS-friendly layout, ready to download as a PDF.</li>
          <li>A cover letter written for that company and role.</li>
          <li>A match score, an ATS score, the missing keywords and tips to improve both.</li>
        </ul>
        <p>
          Applying in another country? Tailoring follows the resume conventions of 11 job markets.
          Read the{" "}
          <a className="underline" href="/guides/dubai-resume-format">
            Dubai
          </a>
          ,{" "}
          <a className="underline" href="/guides/india-resume-format">
            India
          </a>{" "}
          or{" "}
          <a className="underline" href="/guides/uk-resume-format">
            UK
          </a>{" "}
          resume format guides. No resume yet? Start with the{" "}
          <a className="underline" href="/resume-builder">
            resume builder
          </a>
          , or{" "}
          <a className="underline" href="/jobs">
            find jobs
          </a>{" "}
          first. See{" "}
          <a className="underline" href="/how-it-works">
            how it works
          </a>{" "}
          or the{" "}
          <a className="underline" href="/faq">
            FAQ
          </a>
          .
        </p>
      </section>
    </main>
  );
}
