import { createFileRoute, Link } from "@tanstack/react-router";
import { WipSplash } from "@/components/WipSplash";
import { WIP_ENABLED, WIP_HEAD_SCRIPT } from "@/lib/wip";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

/* Muted looping clip. Loads only when near the screen, pauses when away,
   stays a still poster for reduced-motion and data-saver visitors. */
function LazyVideo({ name, className = "" }: { name: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || nav.connection?.saveData) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) v.src = `/m/${name}.mp4`;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [name]);
  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      poster={`/m/${name}.webp`}
      className={`hp-vid ${className}`}
    />
  );
}

const reel = [
  { n: "docs", dx: "-34vw", dy: "-6vh", w: "w-[26vw] sm:w-[16vw]", rot: "-4deg" },
  { n: "night", dx: "34vw", dy: "-8vh", w: "w-[26vw] sm:w-[16vw]", rot: "3deg" },
  { n: "interview", dx: "-30vw", dy: "9vh", w: "w-[24vw] sm:w-[14vw]", rot: "2deg" },
  { n: "cafe", dx: "30vw", dy: "10vh", w: "w-[24vw] sm:w-[14vw]", rot: "-3deg" },
];

const fillText =
  "One resume. Twenty jobs. Twenty different applications, without twenty evenings of editing.";

function Index() {
  const [rv, setRv] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRv(true);
    root.classList.add("hp-live");

    // Reveal on enter
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
    root.querySelectorAll("[data-rv]").forEach((el) => io.observe(el));

    // Scroll engine: one rAF loop writes CSS variables, CSS does the motion.
    const prog = Array.from(root.querySelectorAll<HTMLElement>("[data-p]"));
    const fills = Array.from(root.querySelectorAll<HTMLElement>("[data-fill]"));
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    const cta = root.querySelector<HTMLElement>("[data-cta]");
    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (hero) hero.style.setProperty("--hp", clamp(window.scrollY / vh).toFixed(3));
      for (const el of prog) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue;
        el.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(3));
      }
      for (const el of fills) {
        const r = el.getBoundingClientRect();
        const words = el.querySelectorAll<HTMLElement>(".hp-w");
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.55 + r.height * 0.4));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < n));
      }
      const pastHero = window.scrollY > vh * 0.7;
      const ctaTop = cta ? cta.getBoundingClientRect().top : Infinity;
      setShowBar(pastHero && ctaTop > vh * 0.6);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Pointer interactions (mouse only)
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];
    if (fine) {
      root.querySelectorAll<HTMLElement>("[data-mag]").forEach((el) => {
        const mv = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = ev.clientX - (r.left + r.width / 2);
          const y = ev.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${(x * 0.22).toFixed(1)}px, ${(y * 0.3).toFixed(1)}px)`;
        };
        const lv = () => {
          el.style.transform = "";
        };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerleave", lv);
        cleanups.push(() => {
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerleave", lv);
        });
      });
      root.querySelectorAll<HTMLElement>("[data-spot]").forEach((el) => {
        const mv = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${ev.clientX - r.left}px`);
          el.style.setProperty("--my", `${ev.clientY - r.top}px`);
          el.style.setProperty("--rx", `${(((ev.clientY - r.top) / r.height - 0.5) * -6).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${(((ev.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`);
        };
        const lv = () => {
          el.style.setProperty("--rx", "0deg");
          el.style.setProperty("--ry", "0deg");
        };
        el.addEventListener("pointermove", mv);
        el.addEventListener("pointerleave", lv);
        cleanups.push(() => {
          el.removeEventListener("pointermove", mv);
          el.removeEventListener("pointerleave", lv);
        });
      });
      if (hero) {
        const mv = (ev: PointerEvent) => {
          hero.style.setProperty("--mx", ((ev.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
          hero.style.setProperty("--my", ((ev.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
        };
        hero.addEventListener("pointermove", mv);
        cleanups.push(() => hero.removeEventListener("pointermove", mv));
      }
    }
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cleanups.forEach((c) => c());
    };
  }, []);

  const words = fillText.split(" ");

  return (
    <main ref={rootRef} className={`hp bg-black text-white ${rv ? "hp-rv" : ""}`}>
      <style>{HP_CSS}</style>
      <WipSplash />

      {/* Hero */}
      <section data-hero className="hp-hero relative isolate overflow-hidden">
        <LazyVideo name="commute" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.32]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,#000_85%)]" />
        <div aria-hidden className="hp-grid absolute inset-0 -z-10" />

        <div className="site-container relative flex min-h-[calc(100svh-4rem)] flex-col justify-between py-7 sm:py-10">
          <div className="flex items-start justify-between gap-6 text-[0.68rem] uppercase tracking-[0.18em] text-white/60">
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

          <div className="hp-hero-body relative py-10 text-center">
            <div aria-hidden className="hp-fl hp-fl-a hidden lg:block">
              <div className="hp-doc">
                <b>Your resume</b>
                <i /><i /><i className="s" />
              </div>
            </div>
            <div aria-hidden className="hp-fl hp-fl-b hidden lg:block">
              <div className="hp-doc hot">
                <b>
                  Tailored <u>for the job</u>
                </b>
                <i /><i className="y" /><i className="s y" />
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <span aria-hidden className="hp-echo hp-echo-1 hp-h1">Find the jobs. Tailor the resume. Apply.</span>
              <span aria-hidden className="hp-echo hp-echo-2 hp-h1">Find the jobs. Tailor the resume. Apply.</span>
              <h1 className="hp-h1 hp-rise relative">
                Find the jobs. Tailor the <span className="text-highlight">resume.</span> Apply.
              </h1>
              <span aria-hidden className="hp-hand hp-hero-note">one click, per job</span>
            </div>

            <p className="hp-rise mx-auto mt-14 max-w-xl text-base text-white/75 [animation-delay:140ms] sm:text-lg">
              Drop in your resume once. Our AI finds matching roles, rebuilds your resume for each
              company and writes the cover letter. You just hit apply.
            </p>
            <div className="hp-rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:240ms]">
              <span data-mag className="hp-mag inline-block">
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
              </span>
              <span data-mag className="hp-mag inline-block">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="hp-btn rounded-full border-white/30 bg-black/30 px-7 text-white backdrop-blur hover:bg-white/10 hover:text-white"
                >
                  <Link to="/resume-builder">Resume builder</Link>
                </Button>
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 text-[0.68rem] uppercase tracking-[0.18em] text-white/60">
            <span className="max-w-[16rem] sm:max-w-none">
              Works with resumes from Indeed, LinkedIn, Naukri, Glassdoor and more
            </span>
            <span aria-hidden className="hp-scroll hidden sm:block">Scroll</span>
          </div>
        </div>
      </section>

      {/* Roles ticker */}
      <div className="overflow-hidden border-y border-white/10 py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 text-sm uppercase tracking-[0.2em] text-white/50">
          {[...roles, ...roles].map((r, i) => (
            <span key={`${r}-${i}`} className="whitespace-nowrap">
              {r} <span className="ml-10 text-highlight/70">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Statement: words light up as you scroll */}
      <section className="site-container py-24 sm:py-40">
        <p className="hp-hand text-2xl text-highlight sm:text-3xl">about</p>
        <p
          data-fill
          className="mt-4 max-w-5xl font-display text-[1.9rem] font-semibold uppercase leading-[1.12] sm:text-5xl lg:text-6xl"
        >
          {words.map((w, i) => (
            <span key={i} className="hp-w">
              {w}{" "}
            </span>
          ))}
        </p>
      </section>

      {/* Split headline + moving image strips */}
      <section data-p className="relative overflow-hidden border-y border-white/10 bg-neutral-950 py-20 sm:py-32">
        <div className="hp-split font-display text-[3.2rem] font-bold uppercase leading-[0.9] sm:text-[8vw]">
          <div className="hp-sl whitespace-nowrap pl-[4vw]">What you</div>
          <div className="hp-sr whitespace-nowrap pr-[4vw] text-right text-highlight">can do</div>
        </div>
        <div aria-hidden className="mt-12 space-y-3 sm:mt-16">
          <div className="hp-strip hp-strip-a flex w-max gap-3">
            {["commute", "docs", "cafe", "night", "interview", "commute", "docs"].map((n, i) => (
              <div key={i} className="relative h-28 w-48 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:h-44 sm:w-72">
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-50" />
              </div>
            ))}
          </div>
          <div className="hp-strip hp-strip-b flex w-max gap-3">
            {["night", "interview", "commute", "cafe", "docs", "night", "interview"].map((n, i) => (
              <div key={i} className="relative h-28 w-48 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:h-44 sm:w-72">
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope: rows with a hover image */}
      <section className="site-container py-20 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
            Four tools. <span className="hp-hand normal-case text-highlight">one place</span>
          </h2>
          <p data-rv className="hp-r max-w-sm text-sm text-white/60">
            Each one links straight to the real thing, no sign-up wall to look around.
          </p>
        </div>
        <ul className="mt-12 border-t border-white/15">
          {scope.map((s, i) => {
            const img = ["commute", "interview", "docs", "cafe"][i];
            const inner = (
              <>
                <img
                  src={`/m/${img}.webp`}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="hp-rowimg"
                />
                <span className="relative text-sm text-highlight">{s.n}</span>
                <span className="relative font-display text-2xl font-semibold uppercase sm:text-3xl">
                  {s.title}
                </span>
                <span className="relative text-sm text-white/65">{s.body}</span>
                <ArrowUpRight className="relative hidden size-6 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight sm:block" />
              </>
            );
            const cls =
              "hp-row group relative grid items-center gap-x-6 gap-y-2 overflow-hidden py-7 sm:grid-cols-[4rem_1fr_1.2fr_2rem] sm:py-9";
            return (
              <li key={s.n} data-rv className="hp-r border-b border-white/15">
                {s.to === "/jobs" ? (
                  <Link to="/jobs" search={{ alert: undefined }} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <Link to={s.to} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works: cards stack over each other as you scroll */}
      <section className="border-y border-white/10 bg-neutral-950">
        <div className="site-container py-20 sm:py-32">
          <h2 data-rv className="hp-r max-w-3xl font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
            How it works
          </h2>
          <div className="mt-12 sm:mt-16">
            {steps.map((s, i) => (
              <div key={s.n} className="hp-stack" style={{ ["--i" as string]: i }}>
                <div className="hp-stackcard relative overflow-hidden border border-white/15 bg-black p-6 sm:p-10">
                  <LazyVideo
                    name={["night", "interview", "cafe"][i] ?? "cafe"}
                    className="absolute inset-0 -z-0 h-full w-full object-cover opacity-[0.22]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <Brackets />
                  <div className="relative flex min-h-[13rem] flex-col justify-between sm:min-h-[17rem]">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/60">
                      <span>{s.n} /</span>
                      <span className="hp-hand text-xl normal-case tracking-normal text-highlight">{s.tag}</span>
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-bold uppercase sm:text-5xl">{s.title}</h3>
                      <p className="mt-3 max-w-lg text-sm text-white/70 sm:text-base">{s.body}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showreel: tiles drift out around a central clip */}
      <section data-p className="relative overflow-hidden py-24 sm:py-40">
        <div className="relative mx-auto flex h-[46vh] max-w-6xl items-center justify-center sm:h-[60vh]">
          {reel.map((t) => (
            <div
              key={t.n}
              aria-hidden
              className={`hp-tile absolute overflow-hidden rounded-lg border border-white/15 ${t.w}`}
              style={{ ["--dx" as string]: t.dx, ["--dy" as string]: t.dy, ["--rot" as string]: t.rot }}
            >
              <img src={`/m/${t.n}.webp`} alt="" loading="lazy" decoding="async" className="aspect-[4/5] h-full w-full object-cover opacity-60" />
            </div>
          ))}
          <div className="hp-core relative z-10 w-[58vw] max-w-xl overflow-hidden rounded-xl border border-white/25 sm:w-[34vw]">
            <LazyVideo name="commute" className="aspect-[4/5] w-full object-cover" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-4">
              <span className="text-xs uppercase tracking-[0.2em]">Real people. Real applications.</span>
            </div>
          </div>
        </div>
        <p className="hp-hand mt-10 text-center text-3xl text-highlight sm:text-5xl">
          fifteen seconds a job
        </p>
      </section>

      {/* Why */}
      <section className="site-container pb-20 sm:pb-32">
        <h2 data-rv className="hp-r max-w-3xl font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
          Built for applying at scale
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {notWhat.map((n) => (
            <div key={n.title} data-rv data-spot className="hp-r hp-spot relative border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <Brackets />
              <h3 className="relative font-display text-xl font-semibold uppercase">{n.title}</h3>
              <p className="relative mt-3 text-sm text-white/65">{n.body}</p>
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
                data-spot
                className="hp-r hp-spot group relative flex min-h-[14rem] flex-col justify-between border border-white/10 bg-white/[0.03] p-6"
              >
                <Brackets />
                <span className="relative text-xs uppercase leading-relaxed tracking-[0.14em] text-highlight">
                  Tailored for <span className="whitespace-nowrap">{example.role}</span>
                </span>
                <span className="relative mt-10 flex items-end justify-between gap-4">
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
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {plans.map((p) => (
              <div key={p.name} data-rv data-spot className="hp-r hp-spot relative border border-white/10 p-5 sm:p-6">
                <Brackets />
                <p className="relative text-xs uppercase tracking-[0.18em] text-white/55">{p.name}</p>
                <p className="relative mt-6 font-display text-5xl font-bold sm:mt-8">{p.tailor}</p>
                <p className="relative mt-1 text-sm text-white/65">tailored resumes a month</p>
                <p className="relative mt-4 text-sm text-white/65">
                  <span className="text-highlight">{p.search}</span> job{" "}
                  {p.search === "1" ? "search" : "searches"} a month
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-highlight">
              See prices and what each plan includes <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA over a clip */}
      <section data-cta className="relative isolate overflow-hidden py-28 text-center sm:py-44">
        <LazyVideo name="night" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.28]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,transparent_0%,#000_80%)]" />
        <div className="site-container">
          <h2 data-rv className="hp-r mx-auto max-w-4xl font-display text-4xl font-bold uppercase leading-[1.02] sm:text-7xl">
            Your next application, <span className="text-highlight">tailored</span> in 15 seconds
          </h2>
          <p className="hp-hand mt-4 text-3xl text-white/85 sm:text-4xl">go get that offer</p>
          <div data-rv className="hp-r mt-10 flex flex-wrap justify-center gap-3">
            <span data-mag className="hp-mag inline-block">
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
            </span>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className={`hp-bar sm:hidden ${showBar ? "show" : ""}`}>
        <Link
          to="/tailor"
          className="flex items-center justify-center gap-2 rounded-full bg-highlight px-6 py-3 text-sm font-semibold text-highlight-foreground shadow-[0_8px_30px_rgba(0,0,0,.6)]"
        >
          Tailor my resume free <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}

const HP_CSS = `
@font-face{font-family:"HPHand";src:url("/fonts/caveat-brush.woff2") format("woff2");font-display:swap}
.hp-hand{font-family:"HPHand","Caveat Brush",cursive;font-weight:400;letter-spacing:.01em}
.hp-h1{display:block;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.98;letter-spacing:-.01em;font-size:2.7rem;text-wrap:balance}
@media(min-width:640px){.hp-h1{font-size:4.4rem}}
@media(min-width:1024px){.hp-h1{font-size:5.4rem}}
.hp-hero{--hp:0;--mx:0;--my:0}
.hp-hero-body{transform:translateY(calc(var(--hp)*-40px));opacity:calc(1 - var(--hp)*1.1)}
.hp-vid{background:#000}
.hp-hero .hp-vid{transform:scale(calc(1 + var(--hp)*.12)) translateY(calc(var(--hp)*60px))}
.hp-echo{position:absolute;left:0;right:0;top:0;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.28);pointer-events:none;user-select:none}
.hp-live .hp-echo-1{transform:translateY(calc(var(--hp)*70px));opacity:.7}
.hp-live .hp-echo-2{transform:translateY(calc(var(--hp)*150px));opacity:.4}
.hp-echo{display:none}
.hp-live .hp-echo{display:block}
.hp-hero-note{position:absolute;right:-2%;bottom:-2.9rem;color:var(--highlight);font-size:1.5rem;transform:rotate(-6deg)}
@media(min-width:640px){.hp-hero-note{font-size:2.4rem;bottom:-2.6rem;right:-6%}}
.hp-grid{background-image:linear-gradient(to right,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.04) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 20%,transparent 75%)}
.hp-br{position:absolute;width:12px;height:12px;border-color:rgba(255,255,255,.5)}
.hp-fl{position:absolute;bottom:1.5rem;width:11rem;transition:transform .2s linear}
.hp-fl-a{left:0;transform:translate(calc(var(--mx)*14px),calc(var(--my)*10px)) rotate(-6deg)}
.hp-fl-b{right:0;transform:translate(calc(var(--mx)*-22px),calc(var(--my)*-14px)) rotate(6deg)}
.hp-doc{border:1px solid rgba(255,255,255,.18);background:rgba(8,8,8,.85);backdrop-filter:blur(6px);border-radius:12px;padding:14px;text-align:left;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.hp-doc b{display:block;font-size:.6rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:12px;line-height:1.5}
.hp-doc.hot b{color:var(--highlight)}
.hp-doc b u{text-decoration:none;display:block;margin-top:2px;color:rgba(255,255,255,.55)}
.hp-doc i{display:block;height:6px;border-radius:9px;background:rgba(255,255,255,.16);margin-top:7px}
.hp-doc i.s{width:60%}
.hp-doc i.y{background:var(--highlight)}
.hp-scroll{animation:hp-pulse 2.4s ease-in-out infinite}
@keyframes hp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
.hp-rise{animation:hp-rise .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes hp-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
.hp-mag{transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.hp-btn{transition:background-color .4s}
.hp-btn:focus-visible,.hp-row:focus-visible,.hp-spot:focus-visible{outline:2px solid var(--highlight);outline-offset:3px}
.hp-live .hp-w{color:rgba(255,255,255,.28);transition:color .35s}
.hp-live .hp-w.on{color:#fff}
.hp-sl{transform:translateX(calc((var(--p) - .5)*-26vw))}
.hp-sr{transform:translateX(calc((var(--p) - .5)*26vw))}
.hp-strip{will-change:transform}
.hp-strip-a{transform:translateX(calc(var(--p)*-22%))}
.hp-strip-b{transform:translateX(calc(-22% + var(--p)*22%))}
[data-p]{--p:.5}
.hp-row{transition:padding-left .45s cubic-bezier(.2,.7,.2,1)}
.hp-row:hover{padding-left:1rem}
.hp-row:hover .font-display{color:var(--highlight)}
.hp-rowimg{position:absolute;right:0;top:0;height:100%;width:45%;object-fit:cover;opacity:0;transform:translateX(30px);transition:opacity .5s,transform .5s;-webkit-mask-image:linear-gradient(to left,#000 30%,transparent);mask-image:linear-gradient(to left,#000 30%,transparent);pointer-events:none}
.hp-row:hover .hp-rowimg{opacity:.4;transform:none}
.hp-stack{position:sticky;top:calc(4.5rem + var(--i)*.9rem);padding-bottom:1rem}
.hp-stack:last-child{padding-bottom:0}
.hp-spot{transition:border-color .4s,transform .25s ease-out;transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));background-image:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),color-mix(in oklab,var(--highlight) 16%,transparent),transparent 70%)}
.hp-spot:hover{border-color:color-mix(in oklab,var(--highlight) 55%,transparent)}
.hp-tile{left:50%;top:50%;transform:translate(calc(-50% + var(--dx)*var(--p)*1.7),calc(-50% + var(--dy)*var(--p)*1.7)) rotate(var(--rot))}
.hp-core{transform:scale(calc(.82 + var(--p)*.34))}
.hp-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:.75rem 1rem calc(.75rem + env(safe-area-inset-bottom));transform:translateY(120%);transition:transform .45s cubic-bezier(.2,.7,.2,1);pointer-events:none}
.hp-bar.show{transform:none}
.hp-bar.show a{pointer-events:auto}
.hp-rv .hp-r{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.hp-rv .hp-r.in{opacity:1;transform:none}
.hp-rv .hp-spot.hp-r.in{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:opacity .8s,transform .25s ease-out,border-color .4s}
@media(max-width:639px){.hp-stack{top:calc(4.2rem + var(--i)*.7rem)}.hp-tile{transform:translate(calc(-50% + var(--dx)*var(--p)*1.3),calc(-50% + var(--dy)*var(--p)*1.3)) rotate(var(--rot))}}
@media(prefers-reduced-motion:reduce){.hp-rise,.hp-scroll{animation:none}.hp-rv .hp-r{opacity:1;transform:none;transition:none}.hp-live .hp-w{color:#fff}.hp-hero-body,.hp-hero .hp-vid,.hp-sl,.hp-sr,.hp-strip-a,.hp-strip-b,.hp-tile,.hp-core{transform:none!important;opacity:1}.hp-stack{position:static}}
`;
