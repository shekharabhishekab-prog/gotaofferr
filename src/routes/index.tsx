import { createFileRoute, Link } from "@tanstack/react-router";
import { WipSplash } from "@/components/WipSplash";
import { WIP_ENABLED, WIP_HEAD_SCRIPT } from "@/lib/wip";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { resumeExamples } from "@/lib/resume-examples";
import { SITE_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find Jobs & Tailor Your Resume in One Click | GotaOfferr" },
      {
        name: "description",
        content:
          "GotaOfferr finds matching jobs across top boards, then rebuilds your resume and cover letter for each company as ATS-ready PDFs. 5 free applications a month.",
      },
      { property: "og:title", content: "Find Jobs & Tailor Your Resume in One Click | GotaOfferr" },
      {
        property: "og:description",
        content:
          "We find the jobs and tailor your existing resume plus cover letter for every application. ATS-safe PDFs, ready to apply.",
      },

      { property: "og:url", content: "https://gotaofferr.com/" },
      {
        property: "og:image",
        content:
          "https://gotaofferr.com/og-image.png",
      },
      {
        name: "twitter:image",
        content:
          "https://gotaofferr.com/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/" }],
    scripts: [
      ...(WIP_ENABLED ? [{ children: WIP_HEAD_SCRIPT }] : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": "https://gotaofferr.com/#software",
          name: "GotaOfferr",
          url: "https://gotaofferr.com",
          applicationCategory: "BusinessApplication",
          applicationSubCategory: "Resume & Cover Letter Builder",
          operatingSystem: "Web browser",
          description:
            "GotaOfferr finds matching jobs, then rewrites your resume and cover letter for each job description as ATS-ready PDFs.",
          image: SITE_IMAGE,
          featureList: [
            "Tailor an existing resume to a job description",
            "AI cover letter matched to the posting",
            "ATS resume checker with a diagnostic score",
            "Resume builder (India and international templates)",
            "Job finder across major job boards",
          ],
          publisher: { "@id": "https://gotaofferr.com/#organization" },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            description: "Free plan: 5 tailored resumes per month. Paid plans start at INR 49 (Limited Launch Offer, India).",
            url: "https://gotaofferr.com/pricing",
          },
        }),
      },
    ],
  }),
  component: Index,
});

const roles = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "UI/UX Designer",
  "Marketing Intern",
  "Business Analyst",
  "DevOps Engineer",
  "Content Writer",
  "Sales Associate",
  "ML Engineer",
];

const steps = [
  {
    n: "01",
    tag: "Find",
    title: "Find the jobs",
    body: "Tell us the role, salary and location. Our AI searches across job boards and returns one clean list.",
  },
  {
    n: "02",
    tag: "Tailor",
    title: "Tailor the application",
    body: "One click sends a listing into the builder: your resume rewritten for that company, plus the cover letter.",
  },
  {
    n: "03",
    tag: "Apply",
    title: "Apply",
    body: "Download ATS-safe PDFs and go straight to the company's own apply page.",
  },
];

const scope = [
  {
    n: "01",
    title: "AI job finder",
    body: "Matching roles from the boards you would otherwise open in ten tabs, in one list.",
    to: "/jobs",
  },
  {
    n: "02",
    title: "Resume tailor",
    body: "Your existing resume, reshaped for each job description. ATS-safe PDF out.",
    to: "/tailor",
  },
  {
    n: "03",
    title: "Cover letter generator",
    body: "A matching cover letter for every company, written from your resume and the posting.",
    to: "/ai-cover-letter-generator",
  },
  {
    n: "04",
    title: "Resume builder",
    body: "Start from scratch with an ATS-friendly layout and AI help on every field.",
    to: "/resume-builder",
  },
] as const;

const notWhat = [
  {
    title: "Not a resume builder",
    body: "We don't hand you a blank template. We take the resume you already have and reshape it for each specific job description.",
  },
  {
    title: "Not a job board",
    body: "We search across the boards you'd otherwise open in ten tabs and bring the matches to you.",
  },
  {
    title: "One workflow, not three tools",
    body: "Job search, resume tailoring and cover letter writing happen in the same place, so an application takes 15 seconds instead of hours.",
  },
];

const plans = [
  { name: "Free", tailor: "5", search: "1" },
  { name: "Starter", tailor: "20", search: "5" },
  { name: "Job Hunt", tailor: "129", search: "10" },
  { name: "Career Pro", tailor: "199", search: "30" },
];

const showcaseExamples = resumeExamples.filter((example) => example.builtWithAi).slice(0, 3);

/* Corner brackets: the framed-panel detail from the reference. */
function Brackets() {
  return (
    <>
      <span aria-hidden className="hp-br left-0 top-0 border-l border-t" />
      <span aria-hidden className="hp-br right-0 top-0 border-r border-t" />
      <span aria-hidden className="hp-br bottom-0 left-0 border-b border-l" />
      <span aria-hidden className="hp-br bottom-0 right-0 border-b border-r" />
    </>
  );
}

/* Hero visual: two lightweight CSS resume sheets, no images. */
function ResumeSheet({ className = "", variant }: { className?: string; variant: "before" | "after" }) {
  const after = variant === "after";
  return (
    <div
      aria-hidden
      className={`hp-sheet rounded-xl border border-white/15 bg-neutral-950/90 p-4 shadow-2xl backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-24 rounded-full bg-white/80" />
        <span className={`text-[0.6rem] font-semibold uppercase tracking-widest ${after ? "text-highlight" : "text-white/40"}`}>
          {after ? "Tailored" : "Your resume"}
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-11/12 rounded-full bg-white/15" />
        <div className={`h-1.5 w-8/12 rounded-full ${after ? "bg-highlight" : "bg-white/15"}`} />
      </div>
      <div className="mt-4 h-1.5 w-16 rounded-full bg-white/50" />
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className={`h-1.5 w-10/12 rounded-full ${after ? "bg-highlight/80" : "bg-white/15"}`} />
        <div className="h-1.5 w-9/12 rounded-full bg-white/15" />
        <div className={`h-1.5 w-7/12 rounded-full ${after ? "bg-highlight/80" : "bg-white/15"}`} />
      </div>
      <div className="mt-4 flex gap-1.5">
        {["w-10", "w-14", "w-9"].map((w, i) => (
          <div key={i} className={`h-4 ${w} rounded-full border ${after ? "border-highlight/60" : "border-white/15"}`} />
        ))}
      </div>
    </div>
  );
}

function Index() {
  const [rv, setRv] = useState(false);

  // Scroll reveal. Content is fully visible until this runs, so crawlers and
  // no-JS visitors always get the full page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRv(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll("[data-rv]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className={`hp bg-black text-white ${rv ? "hp-rv" : ""}`}>
      <style>{HP_CSS}</style>
      <WipSplash />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="hp-grid absolute inset-0 -z-10" />
        <div aria-hidden className="hp-glow absolute left-1/2 top-[38%] -z-10 h-[34rem] w-[52rem] max-w-[140vw] -translate-x-1/2 -translate-y-1/2" />

        <div className="site-container relative flex min-h-[calc(100svh-4rem)] flex-col justify-between py-8 sm:py-10">
          <div className="flex items-start justify-between gap-6 text-[0.7rem] uppercase tracking-[0.18em] text-white/55">
            <span>
              Job search
              <br />
              Resume · Cover letter
            </span>
            <span className="text-right">
              <span className="text-highlight">5 free</span> a month
              <br />
              No card needed
            </span>
          </div>

          <div className="relative py-14 text-center sm:py-16">
            <ResumeSheet variant="before" className="absolute bottom-6 left-0 hidden w-44 lg:block hp-float-a" />
            <ResumeSheet variant="after" className="absolute bottom-6 right-0 hidden w-44 lg:block hp-float-b" />

            <h1 className="hp-rise mx-auto max-w-[16ch] font-display text-[2.6rem] font-bold uppercase leading-[0.98] tracking-tight text-balance sm:text-[4.2rem] lg:text-[5.6rem]">
              Find the jobs. Tailor the <span className="text-highlight">resume.</span> Apply.
            </h1>
            <p className="hp-rise mx-auto mt-7 max-w-xl text-base text-white/70 [animation-delay:120ms] sm:text-lg">
              Drop in your resume once. Our AI finds matching roles, rebuilds your resume for each
              company and writes the cover letter. You just hit apply.
            </p>
            <div className="hp-rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:220ms]">
              <Button
                asChild
                size="lg"
                className="hp-btn group rounded-full bg-highlight px-7 text-highlight-foreground hover:bg-highlight/90"
              >
                <Link to="/tailor">
                  Tailor my resume
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hp-btn rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/resume-builder">Resume builder</Link>
              </Button>
            </div>
            <div className="mt-12 flex justify-center gap-3 lg:hidden">
              <ResumeSheet variant="before" className="w-36 -rotate-3 sm:w-44" />
              <ResumeSheet variant="after" className="mt-4 w-36 rotate-3 sm:w-44" />
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 text-[0.7rem] uppercase tracking-[0.18em] text-white/55">
            <span>Works with resumes from Indeed, LinkedIn, Naukri, Glassdoor and more</span>
            <span aria-hidden className="hp-scroll hidden sm:block">Scroll</span>
          </div>
        </div>
      </section>

      {/* Roles ticker */}
      <div className="overflow-hidden border-y border-white/10 py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 text-sm uppercase tracking-[0.2em] text-white/45">
          {[...roles, ...roles].map((r, i) => (
            <span key={`${r}-${i}`} className="whitespace-nowrap">
              {r} <span className="ml-10 text-highlight/70">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Statement */}
      <section className="site-container py-20 sm:py-32">
        <p data-rv className="hp-r text-xs uppercase tracking-[0.2em] text-highlight">
          About
        </p>
        <p
          data-rv
          className="hp-r mt-6 max-w-5xl font-display text-3xl font-semibold uppercase leading-[1.12] sm:text-5xl lg:text-6xl"
        >
          One resume. <span className="text-white/35">Twenty jobs.</span> Twenty different
          applications, <span className="text-white/35">without twenty evenings of editing.</span>
        </p>
      </section>

      {/* Scope */}
      <section className="site-container pb-20 sm:pb-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
            What you <br className="sm:hidden" />
            can do
          </h2>
          <p data-rv className="hp-r max-w-sm text-sm text-white/60">
            Four tools in one place. Each one links straight to the real thing, no sign-up wall to
            look around.
          </p>
        </div>

        <ul className="mt-12 border-t border-white/15">
          {scope.map((s) => (
            <li key={s.n} data-rv className="hp-r border-b border-white/15">
              {s.to === "/jobs" ? (
                <Link to="/jobs" search={{ alert: undefined }} className="hp-row group grid items-center gap-x-6 gap-y-2 py-7 sm:grid-cols-[4rem_1fr_1.2fr_2rem] sm:py-9">
                <span className="text-sm text-highlight">{s.n}</span>
                <span className="font-display text-2xl font-semibold uppercase sm:text-3xl">
                  {s.title}
                </span>
                <span className="text-sm text-white/60">{s.body}</span>
                <ArrowUpRight className="hidden size-6 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight sm:block" />
                </Link>
              ) : (
                <Link to={s.to} className="hp-row group grid items-center gap-x-6 gap-y-2 py-7 sm:grid-cols-[4rem_1fr_1.2fr_2rem] sm:py-9">
                <span className="text-sm text-highlight">{s.n}</span>
                <span className="font-display text-2xl font-semibold uppercase sm:text-3xl">
                  {s.title}
                </span>
                <span className="text-sm text-white/60">{s.body}</span>
                <ArrowUpRight className="hidden size-6 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight sm:block" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="border-y border-white/10 bg-neutral-950">
        <div className="site-container py-20 sm:py-32">
          <h2 data-rv className="hp-r max-w-3xl font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                data-rv
                className="hp-r hp-card relative min-h-[17rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <Brackets />
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/50">
                  <span>{s.n}</span>
                  <span className="text-highlight">{s.tag}</span>
                </div>
                <h3 className="mt-16 font-display text-2xl font-semibold uppercase">{s.title}</h3>
                <p className="mt-3 text-sm text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="site-container py-20 sm:py-32">
        <h2 data-rv className="hp-r max-w-3xl font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
          Built for applying at scale
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {notWhat.map((n) => (
            <div key={n.title} data-rv className="hp-r bg-black p-7 sm:p-9">
              <h3 className="font-display text-xl font-semibold uppercase">{n.title}</h3>
              <p className="mt-3 text-sm text-white/60">{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      {showcaseExamples.length > 0 ? (
        <section className="site-container pb-20 sm:pb-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
              Resume examples
            </h2>
            <Link
              to="/examples/resumes"
              className="hp-r inline-flex items-center gap-2 text-sm text-white/70 hover:text-highlight"
            >
              All examples <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {showcaseExamples.map((example) => (
              <Link
                key={example.slug}
                to="/examples/resumes/$slug"
                params={{ slug: example.slug }}
                data-rv
                className="hp-r hp-card group relative flex min-h-[14rem] flex-col justify-between border border-white/10 bg-white/[0.03] p-6"
              >
                <Brackets />
                <span className="text-xs uppercase tracking-[0.18em] text-highlight">
                  Tailored for {example.role}
                </span>
                <span className="mt-10 flex items-end justify-between gap-4">
                  <span className="font-display text-2xl font-semibold uppercase">
                    {example.role} resume
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-white/40 transition-colors group-hover:text-highlight" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Plans */}
      <section className="border-y border-white/10 bg-neutral-950">
        <div className="site-container py-20 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
              Plans
            </h2>
            <p data-rv className="hp-r max-w-sm text-sm text-white/60">
              Start free. Monthly allowances, upgrade only when you need more.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div key={p.name} data-rv className="hp-r hp-card relative border border-white/10 p-6">
                <Brackets />
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">{p.name}</p>
                <p className="mt-8 font-display text-5xl font-bold">{p.tailor}</p>
                <p className="mt-1 text-sm text-white/60">tailored resumes a month</p>
                <p className="mt-5 text-sm text-white/60">
                  <span className="text-highlight">{p.search}</span> job{" "}
                  {p.search === "1" ? "search" : "searches"} a month
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-highlight"
            >
              See prices and what each plan includes <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="site-container py-24 text-center sm:py-40">
        <h2 data-rv className="hp-r mx-auto max-w-4xl font-display text-4xl font-bold uppercase leading-[1.02] sm:text-7xl">
          Your next application, <span className="text-highlight">tailored</span> in 15 seconds
        </h2>
        <div data-rv className="hp-r mt-10 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="hp-btn group rounded-full bg-highlight px-8 text-highlight-foreground hover:bg-highlight/90"
          >
            <Link to="/tailor">
              Tailor my resume
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

const HP_CSS = `
.hp-grid{background-image:linear-gradient(to right,rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.045) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 40%,#000 25%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 25%,transparent 75%)}
.hp-glow{background:radial-gradient(closest-side,color-mix(in oklab,var(--highlight) 22%,transparent),transparent)}
.hp-br{position:absolute;width:12px;height:12px;border-color:rgba(255,255,255,.45)}
.hp-card{transition:border-color .4s,background-color .4s}
.hp-card:hover{border-color:color-mix(in oklab,var(--highlight) 55%,transparent);background-color:rgba(255,255,255,.05)}
.hp-row{transition:padding-left .4s,color .4s}
.hp-row:hover{padding-left:.75rem}
.hp-row:hover .font-display{color:var(--highlight)}
.hp-btn{transition:transform .4s,background-color .4s}
.hp-btn:hover{transform:translateY(-2px)}
.hp-btn:focus-visible,.hp-row:focus-visible,.hp-card:focus-visible{outline:2px solid var(--highlight);outline-offset:3px}
.hp-rise{animation:hp-rise .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes hp-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
.hp-float-a{animation:hp-fa 9s ease-in-out infinite}
.hp-float-b{animation:hp-fb 11s ease-in-out infinite}
@keyframes hp-fa{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-14px) rotate(-4deg)}}
@keyframes hp-fb{0%,100%{transform:translateY(0) rotate(6deg)}50%{transform:translateY(12px) rotate(4deg)}}
.hp-scroll{animation:hp-pulse 2.4s ease-in-out infinite}
@keyframes hp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
.hp-rv .hp-r{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.hp-rv .hp-r.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.hp-rise,.hp-float-a,.hp-float-b,.hp-scroll{animation:none}.hp-rv .hp-r{opacity:1;transform:none;transition:none}}
`;
