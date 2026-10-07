import { createFileRoute, Link } from "@tanstack/react-router";
import { WipSplash } from "@/components/WipSplash";
import { WIP_ENABLED, WIP_HEAD_SCRIPT } from "@/lib/wip";
import {
  ArrowRight,
  BellRing,
  FileText,
  Gauge,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";


import { HeroBackdrop } from "@/components/HeroBackdrop";
import { ImpactStats } from "@/components/ImpactStats";
import { Tilt3D } from "@/components/Tilt3D";
import { ResumeMatchCard } from "@/components/ResumeMatchCard";




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

const features = [
  {
    icon: Target,
    title: "Jobs found for you",
    body: "Give a role, salary and location — the AI searches across major job boards and returns matching listings in one list.",
  },
  {
    icon: Gauge,
    title: "Match score & gaps",
    body: "See how closely you fit each role and which missing keywords to address before you apply.",
  },
  {
    icon: FileText,
    title: "Resume rebuilt per company",
    body: "Your own experience, reordered and rewritten around that exact posting — as a clean, ATS-safe PDF.",
  },
  {
    icon: Wand2,
    title: "Cover letter included",
    body: "A tailored cover letter written in your voice, referencing the company and the role.",
  },
];



const steps = [
  {
    n: "01",
    title: "Find the jobs",
    body: "Tell us the role, salary and location — our AI searches across job boards and returns one clean list.",
  },
  {
    n: "02",
    title: "Tailor the application",
    body: "One click sends a listing into the builder: your resume rewritten for that company, plus the cover letter.",
  },
  {
    n: "03",
    title: "Apply",
    body: "Download ATS-safe PDFs and go straight to the company's own apply page.",
  },
];

const notWhatWeAre = [
  {
    title: "Not a resume builder",
    body: "We don't hand you a blank template. We take the resume you already have and reshape it for each specific job description.",
  },
  {
    title: "Not a job board",
    body: "We search across the boards you'd otherwise open in ten tabs — Indeed, LinkedIn, Glassdoor and more — and bring the matches to you.",
  },
  {
    title: "One workflow, not three tools",
    body: "Job search, resume tailoring and cover letter writing happen in the same place, so an application takes 15 seconds instead of hours.",
  },
];

const ticker = [
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

const showcaseExamples = resumeExamples.filter((example) => example.builtWithAi);

function Index() {
  return (
    <main>
      <WipSplash />
      {/* Hero */}
      <section className="bg-hero relative isolate overflow-hidden text-foreground">
        <HeroBackdrop />

        <div className="site-container relative grid items-center gap-12 py-20 sm:py-24 lg:min-h-[min(720px,calc(100vh-4rem))] lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="animate-pulse-ring inline-flex items-center gap-1.5 rounded-full border border-foreground/25 bg-foreground/5 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="size-3 animate-twinkle text-highlight" /> Find jobs · Tailor
              resume · Apply — 5 free a month
            </span>
            <h1 className="animate-rise-instant mt-6 max-w-[19ch] font-display text-[2.4rem] leading-[1.05] font-bold text-balance sm:text-[3.2rem] xl:text-[4rem]">
              Find the jobs.{" "}
              <span className="text-gradient animate-shimmer">Tailor the resume.</span> Apply in one
              click.
            </h1>

            <p className="animate-rise-instant mt-6 max-w-xl text-base opacity-80 sm:text-lg lg:mx-0 mx-auto">
              Stop hunting across ten job sites and rewriting your CV for every company. Drop in
              your resume once — our AI finds matching roles, rebuilds your resume for each brand
              and writes the cover letter. You just hit apply.
            </p>

            <div className="animate-rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:240ms] lg:justify-start">
              <Button
                asChild
                size="lg"
                className="group bg-highlight text-highlight-foreground shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-highlight/90"
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
                className="border-highlight/50 bg-transparent text-foreground transition-transform hover:-translate-y-0.5 hover:bg-highlight/10 hover:text-foreground"
              >
                <Link to="/resume-builder">Resume builder</Link>
              </Button>
            </div>

            <p className="animate-rise mt-6 text-xs text-muted-foreground [animation-delay:300ms]">
              Works with resumes from Indeed, LinkedIn, Naukri, Glassdoor & more.
            </p>
          </div>

          {/* Animated illustration (desktop only) */}
          <ResumeMatchCard />


        </div>
      </section>

      {/* Ticker */}
      <div className="hidden overflow-hidden border-y border-border bg-card py-4 sm:block">
        <div className="animate-marquee flex w-max gap-3">
          {[...ticker, ...ticker].map((role, i) => (
            <span
              key={`${role}-${i}`}
              className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm whitespace-nowrap text-muted-foreground"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Impact stats */}
      <ImpactStats />

      {/* AI job finder — the headline feature */}
      <section className="site-container content-auto py-10 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/40 bg-card p-8 shadow-lift sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                <Search className="size-3" /> AI job finder
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-card-foreground sm:text-4xl">
                Stop opening ten job boards. Get one merged list.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Type the role, location, experience and salary once. Our AI searches Indeed,
                LinkedIn, Glassdoor, Naukri and more at the same time, filters out the mismatches,
                and hands you one clean list — then tailors your resume for any listing in a click.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/jobs" search={{ alert: undefined }}>
                    Try the job finder free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/pricing">See plans</Link>
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                One free search on any account — no card needed.
              </p>
            </div>

            <ul className="grid gap-4">
              {[
                {
                  icon: Search,
                  title: "Every major board, one search",
                  body: "Results merged and de-duplicated across job boards, sorted by how well they fit you.",
                },
                {
                  icon: Target,
                  title: "Filters that actually hold",
                  body: "Role, seniority, location, remote and salary band in your own currency — mismatches are dropped.",
                },
                {
                  icon: BellRing,
                  title: "Daily alerts by email",
                  body: "Save a search and get fresh roles every morning at the hour and timezone you pick.",
                },
                {
                  icon: Zap,
                  title: "One click to tailor",
                  body: "Send any listing straight into the builder for a rewritten resume and cover letter.",
                },
              ].map((item, i) => (
                <li
                  key={item.title}
                  className={`gap-3 rounded-2xl border border-border bg-background/50 p-5 ${
                    i > 1 ? "hidden sm:flex" : "flex"
                  }`}
                >
                  <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-display text-sm font-semibold text-card-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>



      {/* Showcase — real resumes built with GotaOfferr */}
      <section className="site-container content-auto py-10 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <FileText className="size-3 text-foreground" /> Built with GotaOfferr
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Real resumes, rebuilt for real postings
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              One person's career, rewritten three different ways for three different job
              descriptions. Same facts — different framing, keywords, and order.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/examples/resumes">See all examples</Link>
          </Button>
        </div>

        <div className="perspective-far mt-12 grid gap-5 md:grid-cols-3">
          {showcaseExamples.map((example, i) => (
            <Tilt3D key={example.slug} max={0.7} className={i > 1 ? "hidden md:block" : undefined}>
              <Link
                to="/examples/resumes/$slug"
                params={{ slug: example.slug }}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-lift"
              >
                <span className="w-fit rounded-full bg-highlight px-2.5 py-1 text-[0.7rem] font-semibold text-highlight-foreground">
                  Tailored for {example.role}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                  {example.role} resume
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{example.summaryLine}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {example.atsKeywords.slice(0, 4).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[0.7rem] text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-foreground">
                  View the full resume
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="site-container content-auto py-10 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="size-3 text-foreground" /> Why it works
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Built for applying at scale
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Twenty applications, twenty different resumes — without twenty evenings of editing.
            </p>
          </div>
        </div>

        <div className="perspective-far mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <Tilt3D key={f.title} max={0.7}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-lift">
                <div
                  className="absolute -top-16 -right-16 size-40 rounded-full bg-foreground/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex size-11 items-center justify-center rounded-xl bg-highlight text-highlight-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-semibold text-card-foreground">
                  {f.title}
                </h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="relative overflow-hidden border-y border-border bg-muted/40">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="site-container content-auto relative py-10 sm:py-20">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Find → Tailor → Apply
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The whole application, start to finish, in about a minute — instead of an evening spread
            across job boards, docs and cover letter templates.
          </p>

          <div className="perspective-far mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <Tilt3D key={s.n} max={0.6}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-soft">
                  <div className="font-display text-5xl font-bold text-highlight">{s.n}</div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </Tilt3D>
            ))}
          </div>
          <Button asChild size="lg" className="group mt-12">
            <Link to="/tailor">
              Start now{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* What we are / aren't */}
      <section className="site-container content-auto hidden py-10 sm:block sm:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Target className="size-3 text-foreground" /> To be clear
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
          We don't build resumes. We make yours fit.
        </h2>
        <div className="perspective-far mt-12 grid gap-5 md:grid-cols-3">
          {notWhatWeAre.map((item) => (
            <Tilt3D key={item.title} max={0.6}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-soft">
                <h3 className="font-display text-lg font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </Tilt3D>
          ))}
        </div>
      </section>

      {/* Privacy + CTA */}
      <section className="site-container content-auto py-10 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="hidden rounded-3xl border border-border bg-card p-8 sm:block sm:p-10">
            <ShieldCheck className="size-7 text-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold text-card-foreground">
              Your resume stays yours
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Resumes are processed in your browser and sent to the AI only to generate your
              tailored documents. We never sell your data, and you can delete your account at any
              time.
            </p>
          </div>

          <div className="bg-hero relative isolate overflow-hidden rounded-3xl p-8 text-foreground sm:p-10">
            <div
              className="animate-float-slow absolute -right-16 -bottom-20 size-64 rounded-full bg-foreground/10 blur-3xl"
              aria-hidden
            />
            <Rocket className="relative size-7 text-highlight" />
            <h2 className="relative mt-4 font-display text-2xl font-bold">
              Land the interview, not the rejection
            </h2>
            <p className="relative mt-3 text-sm opacity-85">
              Five tailored resumes free every month. No card needed — just paste and go.
            </p>
            <Button
              asChild
              className="group relative mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90"
            >
              <Link to="/tailor">
                Try it free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
