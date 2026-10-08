import { createFileRoute, Link } from "@tanstack/react-router";
import { WipSplash } from "@/components/WipSplash";
import { WIP_ENABLED, WIP_HEAD_SCRIPT } from "@/lib/wip";
import { ArrowRight, ArrowUpRight, Clock, Hourglass, MousePointerClick, Target } from "lucide-react";
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
function HeroReel() {
  const names = ["t1", "t2", "t3"];
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(1);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setCur((c) => (c + 1) % names.length), 4200);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    setSeen((n) => Math.min(names.length, Math.max(n, cur + 2)));
    refs.current.forEach((v, k) => {
      if (!v) return;
      if (k === cur) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        window.setTimeout(() => v.pause(), 1100);
      }
    });
  }, [cur]);
  return (
    <div aria-hidden className="absolute inset-0 -z-20">
      {names.map((n, k) => (
        <video
          key={n}
          ref={(el) => {
            refs.current[k] = el;
          }}
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          poster={`/m/${n}.webp`}
          src={k < seen ? `/m/${n}.mp4` : undefined}
          className="hp-hv absolute inset-0 h-full w-full object-cover"
          style={{ opacity: k === cur ? 0.42 : 0 }}
        />
      ))}
    </div>
  );
}

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
const reelTiles = [
  "i4226261", "i5716008", "i5411999", "i5749153", "i6814521", "i6830879",
  "i7641842", "i7652126", "i7654396", "i7674645",
  "i7875949", "i8154580", "i8297441", "i8301225", "i8441808", "i8837769",
];
const reelRing = [3, 2, 1, 1, 2, 3, 2, 2, 2, 2, 3, 2, 1, 1, 2, 3];

function ReelCentre() {
  const names = ["c1", "c2", "c3"];
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setCur((c) => (c + 1) % names.length), 5000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    refs.current.forEach((v, k) => {
      if (!v) return;
      if (k === cur) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        window.setTimeout(() => v.pause(), 1000);
      }
    });
  }, [cur]);
  const labels = ["Reviewing the resume", "Panel conversation", "Hiring decision"];
  return (
    <div className="rl-core relative overflow-hidden rounded-xl border border-white/25">
      {names.map((n, k) => (
        <video
          key={n}
          ref={(el) => {
            refs.current[k] = el;
          }}
          muted
          loop
          playsInline
          preload={k === 0 ? "auto" : "metadata"}
          tabIndex={-1}
          aria-hidden
          poster={`/m/${n}.webp`}
          src={`/m/${n}.mp4`}
          className="hp-hv absolute inset-0 h-full w-full object-cover"
          style={{ opacity: k === cur ? 1 : 0 }}
        />
      ))}
      <Brackets />
      <div className="absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 sm:p-4">
        <span className="rl-mono">{labels[cur]}</span>
        <span className="flex gap-1.5" aria-hidden>
          {names.map((n, k) => (
            <i key={n} className={`rl-seg ${k === cur ? "on" : ""}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

function HeroTunnel() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const hero = c.closest("[data-hero]") as HTMLElement | null;
    const small = window.innerWidth < 640;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
    let w = 0;
    let h = 0;
    const size = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const RINGS = small ? 14 : 24;
    const SPOKES = small ? 14 : 28;
    const pts = Array.from({ length: small ? 40 : 110 }, () => ({ a: Math.random() * 6.283, z: Math.random(), r: 0.2 + Math.random() * 0.8 }));
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let boost = 0;
    let lastY = window.scrollY;
    let run = true;
    let raf = 0;
    let t = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (hero) {
        hero.style.setProperty("--rx", (-ty * 5).toFixed(2));
        hero.style.setProperty("--ry", (tx * 7).toFixed(2));
        hero.style.setProperty("--gx", (tx * 10).toFixed(1) + "px");
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      run = e.isIntersecting;
      if (run && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(c);
    window.addEventListener("resize", size);
    function draw() {
      raf = 0;
      if (!run) return;
      t += 0.004;
      const sy = window.scrollY;
      boost = boost * 0.92 + Math.min(0.06, Math.abs(sy - lastY) * 0.0009);
      lastY = sy;
      cx += (tx * w * 0.06 - cx) * 0.06;
      cy += (ty * h * 0.06 - cy) * 0.06;
      ctx!.clearRect(0, 0, w, h);
      const ox = w / 2 + cx;
      const oy = h * 0.46 + cy;
      const R = Math.max(w, h) * 0.85;
      for (let i = 0; i < RINGS; i++) {
        const z = (((i / RINGS) + t * 1.4 + boost * 6) % 1);
        const k = Math.pow(z, 2.4);
        const rx = R * k + 4;
        const ry = rx * 0.62;
        const wob = Math.sin(t * 6 + i) * 6 * k;
        const alpha = Math.sin(z * Math.PI) * 0.5;
        ctx!.beginPath();
        ctx!.ellipse(ox - cx * k * 1.6 + wob, oy - cy * k * 1.6, rx, ry, 0, 0, 6.283);
        ctx!.strokeStyle = i % 5 === 0 ? `rgba(255,214,0,${alpha * 0.9})` : `rgba(255,255,255,${alpha * 0.45})`;
        ctx!.lineWidth = 0.6 + k * 1.2;
        ctx!.stroke();
      }
      ctx!.strokeStyle = "rgba(255,255,255,0.09)";
      ctx!.lineWidth = 1;
      for (let j = 0; j < SPOKES; j++) {
        const a = (j / SPOKES) * 6.283 + t * 0.6;
        ctx!.beginPath();
        ctx!.moveTo(ox + Math.cos(a) * 20, oy + Math.sin(a) * 12);
        ctx!.lineTo(ox + Math.cos(a) * R, oy + Math.sin(a) * R * 0.62);
        ctx!.stroke();
      }
      for (const p of pts) {
        p.z = (p.z + 0.0025 + boost * 0.5) % 1;
        const k = Math.pow(p.z, 2);
        const x = ox + Math.cos(p.a + t) * R * p.r * k;
        const y = oy + Math.sin(p.a + t) * R * p.r * k * 0.62;
        ctx!.fillStyle = `rgba(255,255,255,${Math.sin(p.z * Math.PI) * 0.8})`;
        ctx!.fillRect(x, y, 1 + k * 1.6, 1 + k * 1.6);
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      run = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", size);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="hx-tun absolute inset-0 -z-10 h-full w-full" />;
}

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


const stripA = ["i5439438", "i5668859", "i3760072", "i19451448", "i5439455"];
const stripB = ["i5668863", "i5989927", "i36766896", "i7606041", "i8730781"];
const rowImgs = ["i30677714", "i5439449", "i5668858", "i3760069"];
const aboutLines: { t: string; c: string; m?: boolean }[][] = [
  [{ t: "One", c: "s" }, { t: "resume.", c: "xl" }],
  [{ t: "Twenty", c: "xl", m: true }, { t: "jobs.", c: "xl o" }],
  [{ t: "Twenty", c: "xs" }, { t: "different", c: "s" }, { t: "applications,", c: "l", m: true }],
  [{ t: "without", c: "xs" }, { t: "twenty", c: "m" }, { t: "evenings", c: "l" }, { t: "of", c: "xs" }, { t: "editing.", c: "xl", m: true }],
];

/* Stats from the current live site. Edit the wording here (second entry: 10 hrs a week shown as 600+ min). */
const stats = [
  { to: 15, pre: "", suf: " sec", label: "to a tailored resume", body: "Upload once. Rebuild for every company instantly.", Icon: Clock },
  { to: 600, pre: "", suf: "+ min", label: "saved weekly", body: "Stop spending 1-2 hours every day hunting jobs and rewriting CVs.", Icon: Hourglass },
  { to: 1000, pre: "", suf: "+", label: "applications automated", body: "The reality of getting hired: hundreds of applications. We do the searching and tailoring for you.", Icon: Target },
  { to: 1, pre: "", suf: " click", label: "to apply", body: "Find, tailor, download, then go straight to the company.", Icon: MousePointerClick },
] as const;


const flow = [
  { n: "01", tag: "Find", title: "Find the jobs", cta: "Open job finder", clip: "s1" },
  { n: "02", tag: "Tailor", title: "Tailor the application", cta: "Tailor a resume", clip: "s2" },
  { n: "03", tag: "Apply", title: "Apply", cta: "Open the builder", clip: "s3" },
] as const;

/* Small connector between sections: a line that grows with scroll and a
   handwritten nudge that scrolls to the next block. */
function Bridge({ label, href }: { label: string; href: string }) {
  return (
    <div data-p className="hp-bridge relative flex flex-col items-center py-6 sm:py-10">
      <span aria-hidden className="hp-bline" />
      <a
        href={href}
        data-mag
        className="hp-hand hp-mag relative z-10 mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-lg text-highlight backdrop-blur transition-colors hover:border-highlight/60 sm:text-xl"
      >
        <span aria-hidden className="hp-dot" />
        {label}
      </a>
    </div>
  );
}

function StepArt({ i }: { i: number }) {
  if (i === 0)
    return (
      <div aria-hidden className="hp-art hp-art-1">
        {roles.slice(0, 3).map((r, k) => (
          <div key={r} className="hp-job" style={{ ["--k" as string]: k }}>
            <span className="hp-pulse" />
            <span className="truncate">{r}</span>
            <em>new match</em>
          </div>
        ))}
      </div>
    );
  if (i === 1)
    return (
      <div aria-hidden className="hp-art hp-art-2">
        <div className="hp-doc hot">
          <b>
            Tailored <u>for the job</u>
          </b>
          <i className="hp-sweep" style={{ ["--k" as string]: 0 }} />
          <i className="hp-sweep" style={{ ["--k" as string]: 1 }} />
          <i className="hp-sweep s" style={{ ["--k" as string]: 2 }} />
          <i className="hp-sweep" style={{ ["--k" as string]: 3 }} />
        </div>
      </div>
    );
  return (
    <div aria-hidden className="hp-art hp-art-3">
      {["Resume.pdf", "Cover-letter.pdf"].map((f, k) => (
        <div key={f} className="hp-file" style={{ ["--k" as string]: k }}>
          <span>{f}</span>
          <em>ATS-safe</em>
        </div>
      ))}
      <ArrowRight className="hp-down size-6 rotate-90 text-highlight" />
    </div>
  );
}

function Index() {
  const [rv, setRv] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [ri, setRi] = useState(0);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRv(true);
    root.classList.add("hp-live");

    const roleTimer = window.setInterval(() => setRi((n) => n + 1), 2200);

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
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          cio.unobserve(el);
          const to = Number(el.dataset.count);
          const suf = el.dataset.suf ?? "";
          const t0 = performance.now();
          const step = (t: number) => {
            const q = Math.min(1, (t - t0) / 1400);
            const v = Math.round(to * (1 - Math.pow(1 - q, 3)));
            el.textContent = `${v}${suf}`;
            if (q < 1) requestAnimationFrame(step);
          };
          el.textContent = `0${suf}`;
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 },
    );
    root.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    const prog = Array.from(root.querySelectorAll<HTMLElement>("[data-p]"));
    const fills = Array.from(root.querySelectorAll<HTMLElement>("[data-fill]"));
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    const cta = root.querySelector<HTMLElement>("[data-cta]");
    const bar = root.querySelector<HTMLElement>("[data-bar]");
    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (hero) hero.style.setProperty("--hp", clamp(window.scrollY / vh).toFixed(3));
      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max).toFixed(3) : 0})`;
      }
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
          const r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", ((ev.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
          hero.style.setProperty("--my", ((ev.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
          hero.style.setProperty("--gx", `${ev.clientX - r.left}px`);
          hero.style.setProperty("--gy", `${ev.clientY - r.top}px`);
        };
        hero.addEventListener("pointermove", mv);
        cleanups.push(() => hero.removeEventListener("pointermove", mv));
      }
    }
    return () => {
      window.clearInterval(roleTimer);
      io.disconnect();
      cio.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cleanups.forEach((c) => c());
    };
  }, []);

    const role = roles[ri % roles.length];
  
  return (
    <main ref={rootRef} className={`hp bg-black text-white ${rv ? "hp-rv" : ""}`}>
      <style>{HP_CSS}</style>
      <WipSplash />
      <div aria-hidden className="hp-prog">
        <span data-bar />
      </div>

      {/* Hero */}
      <section data-hero className="hp-hero relative isolate overflow-hidden">
        <HeroReel />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,#000_88%)]" />
        <div aria-hidden className="hp-grid absolute inset-0 -z-10" />
        <div aria-hidden className="hp-cursor absolute inset-0 -z-10" />
        <HeroTunnel />

        <div aria-hidden className="hx-meta hx-m1"><span>(01)</span> find / tailor / apply</div>
        <div aria-hidden className="hx-meta hx-m2">global roles <b>/</b> free to start</div>
        <div aria-hidden className="hx-meta hx-m3"><i /> scroll</div>
        <div aria-hidden className="hx-meta hx-m4">gotaofferr&reg; 2026</div>
        <div className="site-container relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-10">
          <div className="hp-hero-body relative text-center">
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

            <div className="relative mx-auto max-w-6xl">
              <h1 className="hx" aria-label="Find the jobs. Tailor the resume. Apply.">
                <span aria-hidden className="hx-line hx-l1">
                  <span className="hx-hand hx-first">first,</span>
                  <span className="hx-word hx-outline" data-t="FIND">
                    {"FIND".split("").map((c, i) => (
                      <i key={i} style={{ ["--d" as string]: i }}>{c}</i>
                    ))}
                  </span>
                  <span className="hx-hand hx-jobs">the jobs.</span>
                </span>
                <span aria-hidden className="hx-line hx-l2">
                  <span className="hx-mid">Tailor</span>
                  <span className="hx-tiny">the</span>
                  <span className="hx-word hx-giant" data-t="RESUME.">
                    {"RESUME.".split("").map((c, i) => (
                      <i key={i} style={{ ["--d" as string]: i + 4 }}>{c}</i>
                    ))}
                    <b className="hx-under" />
                  </span>
                </span>
                <span aria-hidden className="hx-line hx-l3">
                  <span className="hx-track"><em /></span>
                  <span className="hx-hand hx-apply">then apply.</span>
                  <span className="hx-stop">next stop: your offer</span>
                </span>
              </h1>
            </div>

            <p aria-live="off" className="hp-hand hp-rolebox mt-4 text-xl text-highlight sm:mt-5 sm:text-3xl">
              tailored for <span key={ri} className="hp-roleword">{role}</span>
            </p>

            <p className="hp-rise mx-auto mt-5 max-w-xl text-base text-white/75 [animation-delay:140ms] sm:text-lg">
              <span className="text-balance sm:hidden">Drop in your resume once. We find jobs and tailor it for each.</span>
              <span className="hidden sm:inline">
                Drop in your resume once. Our AI finds matching roles, rebuilds your resume for each
                company and writes the cover letter. You just hit apply.
              </span>
            </p>

            <div className="hp-rise mx-auto mt-7 flex max-w-xs flex-col items-stretch gap-3 [animation-delay:240ms] sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
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

            <p className="hp-rise mt-4 text-[0.68rem] uppercase tracking-[0.2em] text-white/60 sm:hidden"><span className="text-highlight">5 free</span> a month / no card</p>

            <ul className="hp-rise mt-6 hidden flex-wrap justify-center gap-2 sm:flex text-[0.66rem] uppercase tracking-[0.16em] text-white/75 [animation-delay:320ms] sm:text-xs">
              {["Job search", "Resume", "Cover letter"].map((c) => (
                <li key={c} className="hp-chip">{c}</li>
              ))}
              <li className="hp-chip hp-chip-y">5 free a month</li>
              <li className="hp-chip hidden sm:block">No card needed</li>
            </ul>
            <p className="hp-rise mx-auto mt-4 hidden max-w-md text-[0.68rem] uppercase leading-relaxed tracking-[0.16em] text-white/55 [animation-delay:380ms] sm:block sm:max-w-none">
              Works with resumes from Indeed, LinkedIn, Naukri, Glassdoor and more
            </p>
          </div>
        </div>
      </section>

      {/* Roles ticker */}
      <div className="overflow-hidden py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 text-sm uppercase tracking-[0.2em] text-white/45">
          {[...roles, ...roles].map((r, i) => (
            <span key={`${r}-${i}`} className="whitespace-nowrap">
              {r} <span className="ml-10 text-highlight/70">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <section id="numbers" className="site-container py-14 sm:py-28">
        <div className="relative">
          <span data-rv className="hp-r hp-chip hp-chip-y inline-block text-[0.66rem] uppercase tracking-[0.16em] sm:text-xs">
            Built for speed
          </span>
          <h2 data-rv className="hp-r nx-h mt-4 font-display font-bold uppercase">
            <span className="nx-a">Numbers that</span>
            <span className="nx-b">
              <span className="hp-hand nx-act normal-case text-highlight">actually</span>
              <span className="nx-m">matter</span>
            </span>
          </h2>
          <p data-rv className="hp-r mt-5 max-w-xs text-sm text-white/60 sm:ml-auto sm:max-w-sm sm:text-base">
            Stop counting tabs. Start counting replies.
          </p>
        </div>
        <div className="nx-list mt-10 sm:mt-16">
          {stats.map((st, k) => (
            <div key={st.label} data-rv className={`hp-r nx-row ${k % 2 ? "nx-r" : ""}`} style={{ ["--k" as string]: k }}>
              <p className="nx-num font-display font-bold leading-none">
                <span data-count={st.to} data-suf="">{st.to}</span>
                <span className="nx-suf">{st.suf.trim()}</span>
              </p>
              <div className="nx-txt">
                <p className="hp-hand nx-lab text-highlight">
                  <st.Icon aria-hidden className="hp-sicon mr-2 inline size-5 align-[-3px]" />
                  {st.label}
                </p>
                <p className="mt-1 hidden max-w-xs text-sm text-white/60 sm:block">{st.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About: text on the left, living visual on the right */}
      <section id="about" data-p className="site-container py-16 sm:py-28">
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col justify-center">
            <p className="hp-hand text-2xl text-highlight sm:text-3xl">about</p>
            <p data-fill className="ab-t mt-4 font-display font-semibold uppercase">
              {aboutLines.map((ln, li) => (
                <span key={li} className="ab-line">
                  {ln.map((w, i) => (
                    <span key={i} className={`hp-w ab-${w.c} ${w.m ? "hp-mark" : ""}`} style={{ ["--k" as string]: li * 3 + i }}>
                      {w.t}
                    </span>
                  ))}
                </span>
              ))}
            </p>
            <span aria-hidden className="hp-hand hp-pnote mt-3 inline-block -rotate-3 self-end text-2xl text-highlight sm:text-4xl">
              one resume, every job
            </span>
          </div>
          <div data-spot className="hp-about relative">
            <div className="hp-about-card relative h-full min-h-[13rem] overflow-hidden rounded-2xl border border-white/15 sm:min-h-[20rem]">
              <LazyVideo name="ab2" className="absolute inset-0 h-full w-full object-cover opacity-85" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              <Brackets />
              <span className="absolute left-4 top-4 text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
                The interview is next
              </span>
            </div>
            <div aria-hidden className="hp-doc hot hp-about-doc absolute -left-3 bottom-6 w-40 sm:-left-8 sm:w-48">
              <b>
                Tailored <u>for the job</u>
              </b>
              <i /><i className="y" /><i className="s y" />
            </div>
            
          </div>
        </div>
      </section>

      <Bridge label="see what you can do" href="#tools" />

      {/* Split headline + moving image strips */}
      <section id="tools" data-p className="relative overflow-hidden py-10 sm:py-20">
        <div className="site-container">
          <div className="wy relative font-display font-bold uppercase">
            <div className="wy-l">
              <span data-rv className="hp-wd" style={{ ["--k" as string]: 0 }}>Your next application,</span>
            </div>
            <div className="wy-l">
              <span data-rv className="hp-wd text-highlight" style={{ ["--k" as string]: 1 }}>tailored</span>{" "}
              <span data-rv className="hp-wd" style={{ ["--k" as string]: 2 }}>in 15 seconds</span>
            </div>
            <svg aria-hidden viewBox="0 0 120 120" className="hp-badge absolute right-0 top-1/2 size-20 -translate-y-1/2 sm:size-32">
              <defs>
                <path id="hpc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <text fontSize="11" letterSpacing="3" fill="currentColor">
                <textPath href="#hpc">FIND • TAILOR • APPLY • REPEAT •</textPath>
              </text>
            </svg>
          </div>
<ul className="mt-6 flex flex-wrap gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-white/70 sm:mt-10 sm:text-xs">
            {["Job finder", "Resume tailor", "Cover letter", "Resume builder"].map((t, i) => (
              <li key={t} data-rv className="hp-chip hp-wd" style={{ ["--k" as string]: 4 + i }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="mt-10 overflow-hidden sm:mt-14">
          <div className="hp-strip hp-strip-a hp-grid2">
            {[...stripA.flatMap((a, i) => [a, stripB[i]]), ...stripA.flatMap((a, i) => [a, stripB[i]])].map((n, i) => (
              <div key={i} className="hp-tl relative overflow-hidden rounded-lg border border-white/10">
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope: rows with a hover image */}
      <section className="site-container py-16 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
            Four tools. <span className="hp-hand normal-case text-highlight">one place</span>
          </h2>
          <p data-rv className="hp-r hidden max-w-sm text-sm text-white/60 sm:block">
            Each one links straight to the real thing, no sign-up wall to look around.
          </p>
        </div>
        <ul className="mt-10 border-t border-white/15 sm:mt-12">
          {scope.map((s, i) => {
            const img = rowImgs[i];
            const inner = (
              <>
                <img src={`/m/${img}.webp`} alt="" aria-hidden loading="lazy" decoding="async" className="hp-rowimg" />
                <span className="relative text-sm text-highlight">{s.n}</span>
                <span className="relative font-display text-2xl font-semibold uppercase sm:text-3xl">{s.title}</span>
                <span className="relative text-sm text-white/65">{s.body}</span>
                <ArrowUpRight className="relative hidden size-6 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-highlight sm:block" />
              </>
            );
            const cls =
              "hp-row group relative grid items-center gap-x-6 gap-y-2 overflow-hidden py-6 sm:grid-cols-[4rem_1fr_1.2fr_2rem] sm:py-9";
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

      <Bridge label="how it works" href="#how" />

      {/* How it works: cards stack over each other; titles are links */}
      <section id="how">
        <div className="site-container py-16 sm:py-32">
          <h2 data-rv className="hp-r max-w-4xl font-display text-5xl font-bold uppercase leading-none sm:text-8xl">
            How it works
          </h2>
          <div className="mt-10 sm:mt-14">
            {flow.map((s, i) => {
              const body = steps[i]?.body ?? "";
              const titleCls = "hp-tlink inline-flex items-center gap-2 font-display text-4xl font-bold uppercase sm:text-7xl";
              const titleIn = (
                <>
                  {s.title}
                  <ArrowUpRight className="hp-tarrow size-7 sm:size-12" />
                </>
              );
              const ctaCls =
                "hp-btn mt-4 inline-flex items-center gap-2 rounded-full border border-highlight/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-highlight transition-colors hover:bg-highlight hover:text-highlight-foreground";
              return (
                <div key={s.n} className="hp-stack" style={{ ["--i" as string]: i }}>
                  <div data-p className="hp-stackcard relative overflow-hidden border border-white/15 bg-black p-6 sm:p-14">
                    <span aria-hidden className="hp-bignum">{s.n}</span>
                    <LazyVideo name={s.clip} className="hp-cardvid absolute inset-0 h-full w-full object-cover opacity-[0.34]" />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
                    <Brackets />
                    <StepArt i={i} />
                    <div className="relative flex min-h-[15rem] flex-col justify-between sm:min-h-[26rem]">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/60">
                        <span>{s.n} /</span>
                        <span className="hp-hand text-xl normal-case tracking-normal text-highlight">{s.tag}</span>
                      </div>
                      <div>
                        <div aria-hidden className="hp-kw mb-4 overflow-hidden">
                          <div className="animate-marquee flex w-max gap-6 text-xs uppercase tracking-[0.3em] text-white/30">
                            {[0, 1, 2, 3].map((k) => (
                              <span key={k} className="whitespace-nowrap">{s.tag} <span className="text-highlight/60">/</span> {s.title} <span className="text-highlight/60">/</span></span>
                            ))}
                          </div>
                        </div>
                        <h3>
                          {i === 0 ? (
                            <Link to="/jobs" search={{ alert: undefined }} className={titleCls}>{titleIn}</Link>
                          ) : (
                            <Link to={i === 1 ? "/tailor" : "/resume-builder"} className={titleCls}>{titleIn}</Link>
                          )}
                        </h3>
                        <p className="mt-3 hidden max-w-lg text-sm text-white/70 sm:block sm:text-base">{body}</p>
                        {i === 0 ? (
                          <Link to="/jobs" search={{ alert: undefined }} className={ctaCls}>
                            {s.cta} <ArrowRight className="size-3.5" />
                          </Link>
                        ) : (
                          <Link to={i === 1 ? "/tailor" : "/resume-builder"} className={ctaCls}>
                            {s.cta} <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Bridge label="real people, real applications" href="#reel" />

      {/* Showreel */}
      <section id="reel" data-p className="rl relative overflow-hidden py-12 sm:py-28">
        <div className="site-container">
          <div className="rl-head">
            <span className="rl-mono">( hiring, in motion )</span>
            <p className="hp-hand rl-say">fifteen seconds a job</p>
          </div>
          <div className="rl-grid mt-6 sm:mt-10">
            {reelTiles.map((n, k) => (
              <div key={n} aria-hidden className="rl-t" style={{ ["--k" as string]: k, ["--d" as string]: reelRing[k] }}>
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" />
                {k % 5 === 2 ? <i className="rl-dot" /> : null}
                {k % 4 === 1 ? <em className="rl-tag">{String(k + 1).padStart(2, "0")}</em> : null}
              </div>
            ))}
            <ReelCentre />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="site-container py-12 sm:py-24">
        <h2 data-rv className="hp-r max-w-3xl font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
          Built for applying at scale
        </h2>
        <div className="mt-8 sm:mt-14">
          {notWhat.map((n, k) => (
            <div key={n.title} data-rv className="hp-r tx-why" style={{ ["--k" as string]: k }}>
              <span className="tx-n">0{k + 1}</span>
              <h3 className={`tx-big ${k === 1 ? "tx-out" : ""} ${k === 2 ? "tx-yel" : ""}`}>{n.title}</h3>
              <p className="tx-sm">{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      {showcaseExamples.length > 0 ? (
        <section className="site-container pb-16 sm:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
              Resume examples
            </h2>
            <Link to="/examples/resumes" className="hp-r inline-flex items-center gap-2 text-sm text-white/70 hover:text-highlight">
              All examples <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 sm:mt-14">
            {showcaseExamples.map((example, k) => (
              <Link
                key={example.slug}
                to="/examples/resumes/$slug"
                params={{ slug: example.slug }}
                data-rv
                className="hp-r tx-ex group"
                style={{ ["--k" as string]: k }}
              >
                <span className="tx-n">0{k + 1}</span>
                <span className="hp-hand tx-for">tailored for {example.role}</span>
                <span className="tx-exname">{example.role} resume</span>
                <ArrowUpRight className="tx-arr size-7 shrink-0 sm:size-10" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Plans */}
      <section className="site-container pb-16 sm:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">Plans</h2>
          <p data-rv className="hp-r hidden max-w-sm text-sm text-white/60 sm:block">
            Start free. Monthly allowances, upgrade only when you need more.
          </p>
        </div>
        <div className="tx-plans mt-10 sm:mt-16">
          {plans.map((p, k) => (
            <div key={p.name} data-rv className="hp-r tx-plan" style={{ ["--k" as string]: k }}>
              <p className="tx-pn">{p.name}</p>
              <p className={`tx-pnum ${k === 3 ? "tx-yel" : k % 2 ? "tx-out" : ""}`}>{p.tailor}</p>
              <p className="tx-pl">tailored resumes a month</p>
              <p className="tx-ps">
                <span>{p.search}</span> job {p.search === "1" ? "search" : "searches"} a month
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-highlight">
            See prices and what each plan includes <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Final CTA over a clip */}
      <section data-cta className="relative isolate overflow-hidden py-24 text-center sm:py-44">
        <LazyVideo name="cta" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.3]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,transparent_0%,#000_80%)]" />
        <div className="site-container">
          <h2 data-rv className="hp-r mx-auto max-w-4xl font-display text-4xl font-bold uppercase leading-[1.02] sm:text-7xl">
            What you <span className="text-highlight">can do</span>
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
.hp-prog{position:fixed;left:0;right:0;top:0;height:2px;z-index:60;pointer-events:none}
.hp-prog span{display:block;height:100%;background:var(--highlight);transform:scaleX(0);transform-origin:0 50%}
.hp-cursor{background:radial-gradient(380px circle at var(--gx,50%) var(--gy,40%),color-mix(in oklab,var(--highlight) 14%,transparent),transparent 70%);opacity:0;transition:opacity .4s}
.hp-hero:hover .hp-cursor{opacity:1}
.hp-hw{display:inline-block;transition:transform .35s cubic-bezier(.2,.7,.2,1),color .3s}
@media(hover:hover){.hp-hw:hover{transform:translateY(-8px) rotate(-2deg);color:var(--highlight)}}
.hp-rolebox{min-height:1.4em}
.hp-roleword{display:inline-block;animation:hp-roleIn .55s cubic-bezier(.2,.7,.2,1) both}
@keyframes hp-roleIn{from{opacity:0;transform:translateY(.5em) rotate(-3deg)}to{opacity:1;transform:none}}
.hp-chip{border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:.4rem .8rem;background:rgba(0,0,0,.35);backdrop-filter:blur(6px);transition:border-color .3s,transform .3s}
.hp-chip:hover{border-color:var(--highlight);transform:translateY(-2px)}
.hp-chip-y{border-color:color-mix(in oklab,var(--highlight) 60%,transparent);color:var(--highlight)}
.hp-about{--rx:0deg;--ry:0deg}
.hp-about-card{transform:translateY(calc((.5 - var(--p))*50px))}
.hp-about-doc{transform:translateY(calc((var(--p) - .5)*-70px)) rotate(-5deg);animation:hp-bob 6s ease-in-out infinite}
.hp-about-note{transform:rotate(-8deg) translateY(calc((var(--p) - .5)*-40px))}
@keyframes hp-bob{0%,100%{margin-bottom:0}50%{margin-bottom:12px}}
.hp-bridge{--p:0}
.hp-bline{display:block;width:1px;height:calc(10px + var(--p)*70px);background:linear-gradient(to bottom,transparent,var(--highlight))}
.hp-dot{width:7px;height:7px;border-radius:99px;background:var(--highlight);animation:hp-ping 1.8s ease-in-out infinite}
@keyframes hp-ping{0%,100%{box-shadow:0 0 0 0 color-mix(in oklab,var(--highlight) 60%,transparent)}50%{box-shadow:0 0 0 7px transparent}}
.hp-tlink{transition:color .3s}
.hp-tlink:hover{color:var(--highlight)}
.hp-tarrow{transition:transform .3s;opacity:.6}
.hp-tlink:hover .hp-tarrow{transform:translate(4px,-4px);opacity:1}
html{scroll-behavior:smooth}
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
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.hp-roleword,.hp-dot,.hp-about-doc{animation:none}.hp-about-card,.hp-about-doc,.hp-about-note{transform:none}.hp-prog{display:none}.hp-rise,.hp-scroll{animation:none}.hp-rv .hp-r{opacity:1;transform:none;transition:none}.hp-live .hp-w{color:#fff}.hp-hero-body,.hp-hero .hp-vid,.hp-sl,.hp-sr,.hp-strip-a,.hp-strip-b,.hp-tile,.hp-core{transform:none!important;opacity:1}.hp-stack{position:static}}

.hp-w{display:inline-block;margin-right:.28em}
.hp-live .hp-w{transform:translateY(.22em);transition:color .35s,transform .45s cubic-bezier(.2,.7,.2,1)}
.hp-live .hp-w.on{transform:none}
.hp-w:hover{color:var(--highlight)!important}
.hp-mark{background-image:linear-gradient(var(--highlight),var(--highlight));background-repeat:no-repeat;background-position:0 92%;background-size:0 .12em;transition:color .35s,transform .45s cubic-bezier(.2,.7,.2,1),background-size .7s .15s}
.hp-live .hp-mark.on{background-size:100% .12em}
.hp-pecho{position:absolute;inset:0;margin:0;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.13);pointer-events:none;user-select:none;display:none}
.hp-live .hp-pecho{display:block;transform:translate(calc((.5 - var(--p))*40px),calc((var(--p) - .5)*-30px))}
.hp-pnote{transform:rotate(-5deg)}
.hp-wd{display:inline-block}
.hp-rv .hp-wd{opacity:0;transform:translateY(70%) rotate(5deg);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--k)*.11s)}
.hp-rv .hp-wd.in{opacity:1;transform:none}
.hp-badge{color:var(--highlight);animation:hp-spin 18s linear infinite}
@keyframes hp-spin{to{transform:rotate(360deg)}}
.hp-art{position:absolute;right:1rem;top:50%;transform:translateY(-50%);width:11.5rem;pointer-events:none}
@media(min-width:640px){.hp-art{right:2.5rem;width:16rem}}
.hp-job{display:flex;align-items:center;gap:.5rem;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.7);border-radius:10px;padding:.5rem .65rem;margin-bottom:.5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;animation:hp-slide 4.8s ease-in-out infinite;animation-delay:calc(var(--k)*.5s)}
.hp-job em{margin-left:auto;font-style:normal;color:var(--highlight);font-size:.6rem;white-space:nowrap}
.hp-pulse{width:7px;height:7px;border-radius:9px;background:var(--highlight);flex:none;animation:hp-ping 1.8s infinite}
@keyframes hp-slide{0%,100%{transform:translateX(0)}50%{transform:translateX(-14px)}}
.hp-art-2 .hp-doc{transform:rotate(4deg)}
.hp-sweep{position:relative;overflow:hidden}
.hp-sweep::after{content:"";position:absolute;inset:0;background:var(--highlight);transform:translateX(-101%);animation:hp-fill 4s ease-in-out infinite;animation-delay:calc(var(--k)*.45s)}
@keyframes hp-fill{0%,15%{transform:translateX(-101%)}45%,85%{transform:translateX(0)}100%{transform:translateX(101%)}}
.hp-file{display:flex;align-items:center;justify-content:space-between;gap:.5rem;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.72);border-radius:10px;padding:.6rem .75rem;margin-bottom:.5rem;font-size:.7rem;animation:hp-slide 5s ease-in-out infinite;animation-delay:calc(var(--k)*.6s)}
.hp-file em{font-style:normal;color:var(--highlight);font-size:.6rem;text-transform:uppercase;letter-spacing:.1em}
.hp-down{display:block;margin:.4rem auto 0;animation:hp-bounce 1.4s ease-in-out infinite}
@keyframes hp-bounce{0%,100%{transform:rotate(90deg) translateX(0)}50%{transform:rotate(90deg) translateX(8px)}}
.hp-strip-a{transform:translateX(calc(var(--p)*-12%))}
.hp-strip-b{transform:translateX(calc(-12% + var(--p)*12%))}
.hp-sl{transform:translateX(calc((var(--p) - .5)*-12vw))}
.hp-sr{transform:translateX(calc((var(--p) - .5)*12vw))}
@media(prefers-reduced-motion:reduce){.hp-job,.hp-file,.hp-down,.hp-badge,.hp-pulse{animation:none}.hp-sweep::after{animation:none;transform:none}.hp-wd{opacity:1!important;transform:none!important}.hp-pecho{display:none!important}}
@media(max-width:639px){.hp-art{display:none}}


.hp-rcol-l{}
.hp-rcol-r{}
.hp-rtile{transition:transform .4s}
.hp-rtile:hover{transform:scale(1.03)}
.hp-core{transform:none;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 30px 80px -30px color-mix(in oklab,var(--highlight) 35%,transparent)}
.hp-hw{margin-right:.26em}
.hp-bignum{position:absolute;right:1rem;bottom:-1.5rem;font-family:var(--font-display,inherit);font-weight:800;font-size:9rem;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.14);transform:translateY(calc((1 - var(--p))*70px));pointer-events:none}
@media(min-width:640px){.hp-bignum{font-size:20rem;right:3rem;bottom:-3rem}}
.hp-cardvid{transform:scale(calc(1.18 - var(--p)*.18))}
.hp-stackcard{--p:.5}
@media(prefers-reduced-motion:reduce){.hp-rcol-l,.hp-rcol-r,.hp-core,.hp-bignum,.hp-cardvid{transform:none!important}}

.hp-sbar{position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--highlight);transform:scaleX(0);transform-origin:0 50%;transition:transform 1.4s cubic-bezier(.2,.7,.2,1) .3s}
.hp-rv .hp-stat.in .hp-sbar{transform:scaleX(1)}
.hp-sicon{animation:hp-bob2 3.4s ease-in-out infinite;animation-delay:calc(var(--k)*.4s)}
@keyframes hp-bob2{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(6deg)}}
@media(prefers-reduced-motion:reduce){.hp-sicon{animation:none}.hp-sbar{transform:scaleX(1)}}

/* v4 */
.hp-hv{transition:opacity 1.1s ease}
.hx{display:block;margin:0;font-family:var(--font-display,inherit);text-transform:uppercase;line-height:.9}
.hx-line{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:0 .35em}
.hx-hand{font-family:"HPHand","Caveat Brush",cursive;text-transform:none;color:var(--highlight);font-weight:400;display:inline-block;opacity:0;animation:hx-in .8s cubic-bezier(.2,.7,.2,1) forwards}
.hx-first{font-size:1.6rem;transform:rotate(-6deg);animation-delay:.1s}
.hx-jobs{font-size:2rem;transform:rotate(-4deg);animation-delay:1s}
.hx-apply{font-size:1.8rem;animation-delay:1.7s}
.hx-word{position:relative;display:inline-block;font-weight:800}
.hx-word i{font-style:normal;display:inline-block;opacity:0;transform:translateY(.5em) rotate(6deg);filter:blur(8px);animation:hx-let .8s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:calc(var(--d)*70ms + 250ms)}
.hx-outline{font-size:4.4rem;color:transparent;-webkit-text-stroke:2px #fff}
.hx-giant{font-size:5.2rem;color:var(--highlight)}

.hx-outline::before{content:attr(data-t);position:absolute;left:0;top:0;transform:translate(-.04em,.04em);color:rgba(255,214,0,.16);z-index:-1}
.hx-mid{font-size:2.2rem;font-weight:500;font-family:Georgia,"Times New Roman",serif;font-style:italic;text-transform:none;letter-spacing:0;opacity:0;animation:hx-in .8s .5s forwards}
.hx-tiny{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;letter-spacing:.3em;color:rgba(255,255,255,.65);opacity:0;animation:hx-in .8s .8s forwards}
.hx-under{position:absolute;left:0;right:0;bottom:.02em;height:.07em;background:#fff;transform:scaleX(0);transform-origin:0 50%;animation:hx-line 1s 1.4s cubic-bezier(.2,.7,.2,1) forwards}
.hx-l2{margin-top:.1em}.hx-l3{margin-top:.5rem;gap:1rem}
.hx-track{position:relative;display:inline-block;width:min(34vw,12rem);height:10px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.5) 0 2px,transparent 2px 12px);background-size:12px 10px;animation:hx-run 1s linear infinite;opacity:.7;align-self:center}
.hx-track em{position:absolute;left:0;right:0;top:4px;height:2px;background:rgba(255,255,255,.35)}
.hx-stop{font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.2em;color:rgba(255,255,255,.6);opacity:0;animation:hx-in .8s 2.1s forwards}
@media(min-width:640px){.hx-outline{font-size:7rem}.hx-giant{font-size:9rem}.hx-mid{font-size:3.6rem}.hx-first{font-size:2.6rem}.hx-jobs{font-size:3.4rem}.hx-apply{font-size:2.8rem}.hx-tiny{font-size:1rem}.hx-stop{font-size:.8rem}}
@media(min-width:1024px){.hx-outline{font-size:9rem}.hx-giant{font-size:12rem}.hx-mid{font-size:4.6rem}}
@keyframes hx-in{to{opacity:1}}
@keyframes hx-let{to{opacity:1;transform:none;filter:none}}
@keyframes hx-line{to{transform:scaleX(1)}}
@keyframes hx-run{to{background-position:-12px 0}}
@keyframes hx-shift{0%,100%{transform:translate(.045em,.045em)}50%{transform:translate(.09em,.07em)}}
.hx-first,.hx-jobs{animation-fill-mode:forwards}
.hx-hand.hx-first{animation:hx-in .8s .1s forwards}
@media(prefers-reduced-motion:reduce){.hx-word i,.hx-hand,.hx-mid,.hx-tiny,.hx-stop{opacity:1!important;transform:none!important;filter:none!important;animation:none!important}.hx-under{transform:none;animation:none}.hx-track,.hx-giant::before{animation:none}}
/* numbers */
.nx-h{line-height:.88}
.nx-a{display:block;font-size:3.2rem}
.nx-b{display:flex;align-items:baseline;gap:.25em;padding-left:1.2rem}
.nx-m{font-size:2rem;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.7);font-family:Georgia,serif;font-style:italic;text-transform:none;font-weight:400}
.nx-act{font-size:3.6rem;transform:rotate(-5deg);display:inline-block}
@media(min-width:640px){.nx-a{font-size:8rem}.nx-b{padding-left:6rem}.nx-m{font-size:5.5rem}.nx-act{font-size:7rem}}
.nx-list{display:flex;flex-direction:column;gap:1.8rem}
.nx-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.4rem 1.5rem}
.nx-r{justify-content:flex-end;text-align:right}
.nx-num{font-size:5rem;display:flex;align-items:baseline;gap:.15em}
.nx-suf{font-size:.34em;font-family:Georgia,serif;font-style:italic;font-weight:400;color:#fff;opacity:.85}
.nx-row:nth-child(1) .nx-num{font-size:6.5rem}.nx-row:nth-child(2) .nx-num{font-size:5rem}.nx-row:nth-child(3) .nx-num{font-size:6rem}.nx-row:nth-child(4) .nx-num{font-size:5.5rem}
.nx-lab{font-size:1.5rem;transform:rotate(-3deg)}
@media(min-width:640px){.nx-list{gap:.5rem}.nx-row:nth-child(1) .nx-num{font-size:13rem}.nx-row:nth-child(2) .nx-num{font-size:9rem}.nx-row:nth-child(3) .nx-num{font-size:11rem}.nx-row:nth-child(4) .nx-num{font-size:8rem}.nx-lab{font-size:2.2rem}.nx-row{padding:0 4%}}
/* about */
.ab-t{line-height:1;font-size:1rem}
.ab-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .3em;margin-bottom:.15em}
.ab-t .hp-w{margin-right:0}
.ab-xs{font-family:ui-monospace,Menlo,monospace;font-size:.85rem;letter-spacing:.2em;font-weight:500}
.ab-s{font-family:Georgia,serif;font-style:italic;text-transform:none;font-size:1.6rem;font-weight:400}
.ab-m{font-size:1.5rem}
.ab-l{font-size:2.2rem}
.ab-xl{font-size:3.4rem;font-weight:800}
.ab-o{color:transparent!important;-webkit-text-stroke:2px var(--highlight)}
.hp-live .ab-o.on{color:transparent}
.ab-xl{animation:hp-bob2 5s ease-in-out infinite;animation-delay:calc(var(--k)*.3s)}
@media(min-width:640px){.ab-xs{font-size:1rem}.ab-s{font-size:2.6rem}.ab-m{font-size:2.4rem}.ab-l{font-size:3.6rem}.ab-xl{font-size:6rem}}
@media(min-width:1024px){.ab-xl{font-size:5.6rem}}
@media(prefers-reduced-motion:reduce){.ab-xl{animation:none}}
/* what you can do */
.wy{font-size:2.3rem;line-height:.95;padding-right:5.5rem}.wy-l{white-space:normal!important}
.wy-l{white-space:nowrap;text-align:left}
@media(min-width:640px){.wy{font-size:min(5.4vw,4.6rem);padding-right:9rem}.wy-l{white-space:nowrap!important}}
.hp-grid2{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,1fr);grid-auto-columns:11rem;gap:.75rem;width:max-content;padding-left:max(1rem,calc((100vw - 80rem)/2 + 1rem))}
.hp-tl{height:5.2rem;width:100%}
@media(min-width:640px){.hp-grid2{grid-auto-columns:20rem;gap:.9rem}.hp-tl{height:10.5rem}}
.hp-grid2.hp-strip-a{animation:hp-gmv 60s linear infinite}
@keyframes hp-gmv{to{transform:translateX(calc(-50% - .4rem))}}
@media(prefers-reduced-motion:reduce){.hp-grid2.hp-strip-a{animation:none}}

/* v4 sections */
.tx-n{font-family:ui-monospace,Menlo,monospace;font-size:.75rem;letter-spacing:.25em;color:var(--highlight)}
.tx-sm{font-size:.9rem;color:rgba(255,255,255,.6);max-width:20rem}
.tx-why{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem 1.2rem;padding:.9rem 0;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.tx-why:hover{transform:translateX(1.2rem)}
.tx-big{font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;line-height:.95;font-size:2rem;transition:color .3s}
.tx-out{color:transparent;-webkit-text-stroke:1.5px #fff;font-family:Georgia,serif;font-style:italic;text-transform:none;font-weight:400}
.tx-yel{color:var(--highlight)}
.tx-why:hover .tx-big{color:var(--highlight)}.tx-why:hover .tx-out{color:transparent;-webkit-text-stroke-color:var(--highlight)}
@media(min-width:640px){.tx-big{font-size:5.2rem}.tx-why{padding:1.2rem 0 1.2rem 0}.tx-why:nth-child(2){margin-left:8%}.tx-why:nth-child(3){margin-left:16%}.tx-sm{font-size:1rem}}
.tx-ex{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem 1rem;padding:.9rem 0;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.tx-ex:hover{transform:translateX(1rem)}
.tx-for{font-size:1.3rem;color:var(--highlight);transform:rotate(-2deg);display:inline-block}
.tx-exname{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;font-size:1.6rem;flex:1 1 100%;order:3;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.75);transition:color .3s,-webkit-text-stroke-color .3s}
.tx-arr{color:rgba(255,255,255,.4);transition:transform .3s,color .3s;order:4}
.tx-ex:hover .tx-exname{color:#fff;-webkit-text-stroke-color:#fff}
.tx-ex:hover .tx-arr{color:var(--highlight);transform:translate(4px,-4px)}
@media(min-width:640px){.tx-ex{flex-wrap:nowrap;align-items:center;gap:1.5rem;padding:1.4rem 0}.tx-exname{flex:1;order:0;font-size:3.6rem}.tx-for{font-size:1.9rem;min-width:15rem;order:-1}.tx-n{order:-2}.tx-arr{order:0}}
.tx-plans{display:grid;grid-template-columns:1fr 1fr;gap:2.2rem 1rem}
.tx-pn{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.tx-pnum{font-family:var(--font-display,inherit);font-weight:800;font-size:5rem;line-height:.9;margin-top:.4rem}
.tx-pl{font-family:Georgia,serif;font-style:italic;color:rgba(255,255,255,.8);font-size:1rem;margin-top:.3rem}
.tx-ps{font-size:.85rem;color:rgba(255,255,255,.6);margin-top:.5rem}.tx-ps span{color:var(--highlight);font-weight:700}
@media(min-width:1024px){.tx-plans{grid-template-columns:repeat(4,1fr);gap:1rem 2rem}.tx-pnum{font-size:8.5rem}.tx-plan:nth-child(even){margin-top:2.5rem}.tx-pl{font-size:1.15rem}}
/* showreel */
.rl-head{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem}
.rl-mono{font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.rl-say{font-size:3rem;line-height:.95;color:var(--highlight);transform:rotate(-2deg);transform-origin:0 50%}
@media(min-width:640px){.rl-say{font-size:7.5rem}.rl-mono{font-size:.8rem}}
.rl-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.35rem}
@media(min-width:640px){.rl-grid{gap:.6rem}}
.rl-t{position:relative;aspect-ratio:1/1;overflow:hidden;border-radius:.5rem;opacity:calc(var(--rp,1));transform:scale(calc(.7 + var(--rp,1)*.3));transition:transform .35s,outline-color .3s;outline:1px solid transparent}
.rl-t img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72;transition:opacity .3s,transform .6s}
.rl-t:hover{outline-color:var(--highlight);z-index:2}.rl-t:hover img{opacity:1;transform:scale(1.08)}
.rl-core{grid-column:2/6;grid-row:2/4}
.rl-dot{position:absolute;left:.35rem;top:.35rem;width:.4rem;height:.4rem;border-radius:99px;background:var(--highlight);animation:hp-pulse 1.8s ease-in-out infinite}
.rl-tag{position:absolute;right:.3rem;bottom:.2rem;font:normal .55rem ui-monospace,Menlo,monospace;color:#fff;opacity:.85}
.rl-seg{display:block;width:1.2rem;height:2px;background:rgba(255,255,255,.35)}.rl-seg.on{background:var(--highlight)}
.hp-live .rl{--rp0:0}
.hp-live .rl-t{--rp:clamp(0, calc(var(--p)*3.2 - var(--d)*.28), 1);opacity:calc(var(--rp)*(1 - clamp(0, calc((var(--p) - .78)*4), 1)*.7))}
@media(prefers-reduced-motion:reduce){.rl-t{transform:none!important;opacity:1!important}}

/* hero craft */
.hp-hero{--rx:0;--ry:0;--gx:0px}
.hx{transform:perspective(1300px) rotateY(calc(var(--ry)*1deg)) rotateX(calc(var(--rx)*1deg));transition:transform .25s ease-out;transform-style:preserve-3d}
.hp-hero-body{filter:blur(calc(var(--hp)*9px));transform:translateY(calc(var(--hp)*-40px)) scale(calc(1 + var(--hp)*.1))}
.hx-tun{mix-blend-mode:screen;opacity:.85}
.hx-giant::before{content:attr(data-t);position:absolute;left:0;top:0;color:var(--highlight);-webkit-text-stroke:0;transform:translate(var(--gx),0);clip-path:inset(0 0 62% 0);z-index:1;opacity:0;animation:hx-gl 5.2s 2.2s infinite steps(1)}
.hx-giant::after{content:attr(data-t);position:absolute;left:0;top:0;color:#fff;transform:translate(calc(var(--gx)*-1),0);clip-path:inset(58% 0 12% 0);z-index:1;opacity:0;animation:hx-gl2 5.2s 2.2s infinite steps(1)}
.hx-outline::after{content:attr(data-t);position:absolute;left:0;top:0;color:var(--highlight);-webkit-text-stroke:0;clip-path:inset(40% 0 38% 0);transform:translateX(calc(var(--gx)*-.7));opacity:0;animation:hx-gl2 6.1s 3s infinite steps(1)}
@keyframes hx-gl{0%,86%,100%{opacity:0;transform:translate(0,0)}87%{opacity:1;transform:translate(.06em,0)}89%{opacity:1;transform:translate(-.05em,0)}91%{opacity:1;transform:translate(.09em,0)}93%{opacity:0}}
@keyframes hx-gl2{0%,87%,100%{opacity:0}88%{opacity:1;transform:translate(-.07em,0)}90%{opacity:1;transform:translate(.04em,0)}92%{opacity:0}}
.hx-giant:hover::before,.hx-giant:hover::after{animation-duration:.6s;animation-delay:0s}
.hx-meta{position:absolute;z-index:2;font-family:ui-monospace,Menlo,monospace;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);display:none}
.hx-meta span,.hx-meta b{color:var(--highlight)}
.hx-m3 i{display:inline-block;width:1.6rem;height:1px;background:var(--highlight);vertical-align:middle;margin-right:.5rem;animation:hx-sc 2s ease-in-out infinite;transform-origin:0 50%}
@keyframes hx-sc{0%,100%{transform:scaleX(.3)}50%{transform:scaleX(1)}}
@media(min-width:640px){.hx-meta{display:block}.hx-m1{left:1.5rem;top:5.5rem}.hx-m2{right:1.5rem;top:5.5rem}.hx-m3{left:1.5rem;bottom:1.5rem}.hx-m4{right:1.5rem;bottom:1.5rem}}
@media(prefers-reduced-motion:reduce){.hx-giant::before,.hx-giant::after,.hx-outline::after{display:none}.hx-tun{display:none}.hx-m3 i{animation:none}}
/* blur-in text + image-forward */
.hp-live .hp-w{filter:blur(4px)}.hp-live .hp-w.on{filter:none}
.hp-live .rl-t{filter:blur(calc((1 - var(--rp))*5px + clamp(0, calc((var(--p) - .62)*10), 1)*3px))}
.hp-live .rl-core{transform:scale(calc(.9 + var(--p)*.14));z-index:3;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 40px 120px -20px rgba(0,0,0,.9),0 0 90px -30px var(--highlight)}
.hp-live .about-x{}
`;
