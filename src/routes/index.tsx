import { InterviewBand } from "@/components/InterviewBand";
import { createFileRoute, Link } from "@tanstack/react-router";
import { WipSplash } from "@/components/WipSplash";
import { WIP_ENABLED, WIP_HEAD_SCRIPT } from "@/lib/wip";
import { ArrowRight, ArrowUpRight, Clock, Hourglass, Sparkles, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { resumeExamples } from "@/lib/resume-examples";
import { SITE_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find Jobs & Tailor Your Resume in One Click | Terbey" },
      {
        name: "description",
        content:
          "Terbey finds matching jobs across top boards, then rebuilds your resume and cover letter for each company as ATS-ready PDFs. 5 free applications a month.",
      },
      { property: "og:title", content: "Find Jobs & Tailor Your Resume in One Click | Terbey" },
      {
        property: "og:description",
        content:
          "We find the jobs and tailor your existing resume plus cover letter for every application. ATS-safe PDFs, ready to apply.",
      },

      { property: "og:url", content: "https://terbey.com/" },
      {
        property: "og:image",
        content:
          "https://terbey.com/og-image.png",
      },
      {
        name: "twitter:image",
        content:
          "https://terbey.com/og-image.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://terbey.com/" }],
    scripts: [
      ...(WIP_ENABLED ? [{ children: WIP_HEAD_SCRIPT }] : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": "https://terbey.com/#software",
          name: "Terbey",
          url: "https://terbey.com",
          applicationCategory: "BusinessApplication",
          applicationSubCategory: "Resume & Cover Letter Builder",
          operatingSystem: "Web browser",
          description:
            "Terbey finds matching jobs, then rewrites your resume and cover letter for each job description as ATS-ready PDFs.",
          image: SITE_IMAGE,
          featureList: [
            "Tailor an existing resume to a job description",
            "AI cover letter matched to the posting",
            "ATS resume checker with a diagnostic score",
            "Resume builder (India and international templates)",
            "Job finder across major job boards",
          ],
          publisher: { "@id": "https://terbey.com/#organization" },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            description: "Free plan: 5 tailored resumes per month. Paid plans start at INR 49 (Limited Launch Offer, India).",
            url: "https://terbey.com/pricing",
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
    tag: "Build",
    title: "Make resume from scratch",
    body: "Build an ATS-friendly resume with AI help on every field, then download the PDF.",
  },
  {
    n: "04",
    tag: "Check",
    title: "ATS score checker",
    body: "Drop your resume and see what the robot reads: score, missing keywords and fixes. It runs in your browser, nothing is stored.",
  },
  {
    n: "05",
    tag: "Practice",
    title: "AI Interview",
    body: "Practice with Coco, our AI interviewer. She asks 10 questions from your resume and the job description, then gives honest feedback you can download. Nothing is saved.",
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



const showcaseExamples = resumeExamples.filter((example) => example.builtWithAi).slice(0, 3);
/* Corner brackets: the framed-panel detail from the reference. */
function HeroReel() {
  const names = ["g1", "g2", "g3"];
  const [cur, setCur] = useState(0);
  const [seen, setSeen] = useState(1);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setCur((c) => (c + 1) % names.length), 6500);
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
const reelPos: [number, number][] = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[0,1],[5,1],[0,2],[5,2],[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]];
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
    <div className="rl-core relative overflow-hidden rounded-xl border border-primary/25">
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
      <div className="absolute inset-0 flex items-end justify-between gap-3 bg-gradient-to-t from-background/80 via-transparent to-transparent p-3 sm:p-4">
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
    return () => io.disconnect(); document.removeEventListener("scroll", onS, true);
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
void rowImgs;
const aboutLines: { t: string; c: string; m?: boolean }[][] = [
  [{ t: "One", c: "s" }, { t: "resume.", c: "xl y" }],
  [{ t: "Twenty", c: "xl", m: true }, { t: "jobs.", c: "xl o" }],
  [{ t: "Twenty", c: "xs" }, { t: "different", c: "s" }, { t: "applications,", c: "l y", m: true }],
  [{ t: "without", c: "xs" }, { t: "twenty", c: "m" }, { t: "evenings", c: "l" }, { t: "of", c: "xs" }, { t: "editing.", c: "xl y" }],
];

/* Stats from the current live site. Edit the wording here (second entry: 10 hrs a week shown as 600+ min). */
const stats = [
  { to: 1000, pre: "", suf: "+", label: "applications automated", body: "The reality of getting hired: hundreds of applications. We do the searching and tailoring for you.", Icon: Target },
  { to: 100, pre: "", suf: "s", label: "of interview rejections avoided", body: "Practice with Coco, our AI interviewer, so the real interview feels familiar.", Icon: Sparkles },
  { to: 600, pre: "", suf: "+ min", label: "saved weekly", body: "Stop spending 1-2 hours every day hunting jobs and rewriting CVs.", Icon: Hourglass },
  { to: 30, pre: "", suf: " sec", label: "to a tailored resume", body: "Upload once. Rebuild for every company instantly.", Icon: Clock },
] as const;


const flow = [
  { n: "01", tag: "Find", title: "Find the jobs", cta: "Open job finder", clip: "k1" },
  { n: "02", tag: "Tailor", title: "Tailor the application", cta: "Tailor a resume", clip: "k2" },
  { n: "03", tag: "Build", title: "Make resume from scratch", cta: "Open the builder", clip: "k3" },
  { n: "04", tag: "Check", title: "ATS score checker", cta: "Check my resume", clip: "k2" },
  { n: "05", tag: "Practice", title: "AI Interview", cta: "Start an interview", clip: "k1" },
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
        className="hp-hand hp-mag relative z-10 mt-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/60 px-4 py-1.5 text-lg text-highlight backdrop-blur transition-colors hover:border-highlight/60 sm:text-xl"
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
  if (i === 4)
    return (
      <div aria-hidden className="hp-art hp-art-3">
        {["10 questions", "Your feedback"].map((f, k) => (
          <div key={f} className="hp-file" style={{ ["--k" as string]: k }}>
            <span>{f}</span>
            <em>with Coco</em>
          </div>
        ))}
      </div>
    );
  if (i === 3)
    return (
      <div aria-hidden className="hp-art hp-art-3">
        {["Keywords", "Layout"].map((f, k) => (
          <div key={f} className="hp-file" style={{ ["--k" as string]: k }}>
            <span>{f}</span>
            <em>checked</em>
          </div>
        ))}
        <ArrowRight className="hp-down size-6 rotate-90 text-highlight" />
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



function HeroStaticBg() {
  return (
    <div aria-hidden className="absolute inset-0 -z-20 bg-white">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs><radialGradient id="m1-wt" cx="0.82" cy="0.06" r="0.6"><stop offset="0" stopColor="#073f89" stopOpacity="0.08"/><stop offset="1" stopColor="#073f89" stopOpacity="0"/></radialGradient><radialGradient id="m1-wb" cx="0.1" cy="0.98" r="0.65"><stop offset="0" stopColor="#073f89" stopOpacity="0.06"/><stop offset="1" stopColor="#073f89" stopOpacity="0"/></radialGradient></defs><rect width="1440" height="900" fill="url(#m1-wt)"/><rect width="1440" height="900" fill="url(#m1-wb)"/>
        <svg x="-120" y="72" width="1680" height="724" viewBox="0 0 1440 620" className="hmap-fit">
          <image href="/hero/world-dots.svg" x="0" y="0" width="1440" height="620" className="hmap-img" />
          <g className="hmap-arc"><path d="M230,222 Q324,161 424,209" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M424,209 Q559,104 720,163" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M720,163 Q901,126 1029,261" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M1029,261 Q1114,289 1135,376" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M1135,376 Q1272,398 1325,526" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M424,209 Q555,315 534,482" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M720,163 Q780,255 734,355" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><path d="M230,222 Q703,181 1135,376" fill="none" stroke="#073f89" strokeOpacity="0.4" strokeWidth="2"/><circle cx="230" cy="222" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="230" cy="222" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="424" cy="209" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="424" cy="209" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="534" cy="482" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="534" cy="482" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="720" cy="163" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="720" cy="163" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="734" cy="355" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="734" cy="355" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="1029" cy="261" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="1029" cy="261" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="1135" cy="376" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="1135" cy="376" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/><circle cx="1325" cy="526" r="5" fill="#073f89" fillOpacity="0.75"/><circle cx="1325" cy="526" r="10" fill="none" stroke="#073f89" strokeOpacity="0.3" strokeWidth="1.5"/></g>
        </svg>
      </svg>
    </div>
  );
}

function HeroVideo() {
  return <HeroStaticBg />;
}

function HeroDemo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("bg"));
    if (v >= 1 && v <= 3) setN(v);
  }, []);
  if (!n) return null;
  const words = ["RESUME", "JOB", "OFFER", "TAILORED", "HIRED", "INTERVIEW"];
  return (
    <div aria-hidden className={`hdemo hdemo-${n} absolute inset-0 overflow-hidden bg-black`} style={{ zIndex: -15 }}>
      {n === 1 && (
        <svg className="hdm-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 11 }, (_, i) => {
            const y = 220 + i * 46;
            const a = 40 + (i % 4) * 22;
            let d = `M-800,${y} Q-600,${y - a} -400,${y}`;
            for (let k = 0; k < 8; k++) d += ` T${-400 + (k + 1) * 400},${y}`;
            return (
              <path key={i} d={d} className="hdm-line" style={{ animationDuration: `${26 + i * 3}s`, animationDirection: i % 2 ? "reverse" : "normal", stroke: i === 5 ? "#073f89" : "#fffffd", opacity: i === 5 ? 1 : 0.14 + (i % 3) * 0.06 }} />
            );
          })}
        </svg>
      )}
      {n === 2 && (
        <div className="hdm-rows">
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <div key={r} className={`hdm-row ${r % 2 ? "hdm-rr" : "hdm-rl"}${r === 2 ? " hdm-fill" : ""}`} style={{ animationDuration: `${70 + r * 14}s` }}>
              {[0, 1, 2, 3].map((c) => words.map((w, i) => <span key={`${c}-${i}`}>{words[(i + r * 2) % words.length]}</span>))}
            </div>
          ))}
        </div>
      )}
      {n === 3 && (
        <div className="hdm-orb">
          <div className="hdm-glow" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="hdm-ring" style={{ width: `${22 + i * 13}vmin`, height: `${22 + i * 13}vmin`, animationDuration: `${50 + i * 22}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
              <span className="hdm-dot" style={{ background: i % 3 === 1 ? "#073f89" : "#fffffd" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const popTexts = ["92% match", "Cover letter ready", "Applied in 30 sec", "Resume tailored", "New match found", "ATS score 94"];
function HeroPops() {
  useEffect(() => {
    const root = document.documentElement;
    const upd = () => {
      const h = document.querySelector("[data-hero]") as HTMLElement | null;
      const end = h ? h.offsetTop + h.offsetHeight : 600;
      root.style.setProperty("--hd", String(Math.max(0, Math.min(1, window.scrollY / Math.max(end, 1)))));
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => { window.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); root.style.removeProperty("--hd"); };
  }, []);
  const [items, setItems] = useState<{ id: number; t: string; l: number; tp: number }[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0, last = "";
    const mobile = window.innerWidth < 640;
    if (mobile) return;
    const spawn = () => {
      let t = last;
      while (t === last) t = popTexts[Math.floor(Math.random() * popTexts.length)];
      last = t;
      const l = mobile ? 4 + Math.random() * 46 : (Math.random() < 0.5 ? 2 + Math.random() * 9 : 85 + Math.random() * 5);
      const tp = mobile ? (Math.random() < 0.5 ? 9 + Math.random() * 12 : 76 + Math.random() * 12) : 16 + Math.random() * 66;
      const my = ++id;
      setItems((a) => [...a.slice(-3), { id: my, t, l, tp }]);
      setTimeout(() => setItems((a) => a.filter((x) => x.id !== my)), 2900);
    };
    const first = setTimeout(spawn, 300);
    const iv = setInterval(spawn, 520);
    return () => { clearTimeout(first); clearInterval(iv); };
  }, []);
  return (<>{items.map((x) => (<div key={x.id} aria-hidden className="hx-pop" style={{ left: x.l + "%", top: x.tp + "%" }}>{x.t}</div>))}</>);
}
function HeroCounter() {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 48213;
    const id = window.setInterval(() => {
      n += 1 + Math.floor(Math.random() * 4);
      if (el.current) el.current.textContent = n.toLocaleString("en-US");
    }, 900);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      <div aria-hidden className="i3-meta i3-bl">Jobs matched <b ref={el}>48,213</b></div>
      <div aria-hidden className="i3-meta i3-br">This month</div>
    </>
  );
}

const GI_CSS = `
.gi{position:fixed;inset:0;z-index:2147483000;background:#fffffd;overflow:hidden;cursor:pointer;animation:gi-auto .7s 3.5s forwards}
.gi-glow{position:absolute;left:50%;top:50%;width:min(110vw,900px);height:min(110vw,900px);transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle,rgba(7,63,137,.5) 0,transparent 62%);opacity:0;animation:gi-glow 3s .1s ease-out forwards}
.gi-dot{position:absolute;left:50%;top:50%;width:12px;height:12px;border-radius:50%;background:#073f89;transform:translate(-50%,-50%) scale(0);box-shadow:0 0 40px 10px rgba(7,63,137,.7);animation:gi-dot 1.1s .05s cubic-bezier(.2,.8,.2,1) forwards}
.gi-p{position:absolute;border-radius:50%;background:#073f89;box-shadow:0 0 6px #073f89;opacity:0;animation:gi-p 2.3s calc(.5s + var(--dl)) ease-in-out forwards}
.gi-mark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.9);font-weight:800;font-size:clamp(2.2rem,7vw,4.5rem);letter-spacing:-.04em;color:#073f89;opacity:0;animation:gi-mark 2.6s .7s cubic-bezier(.2,.8,.2,1) forwards;white-space:nowrap}
.gi-mark b{color:#073f89}
.gi-m{position:absolute;font:500 .7rem ui-monospace,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:rgba(0,0,0,.65);opacity:0;animation:gi-fade .5s .3s forwards}
.gi-m b{color:#073f89;font-weight:500}
.gi-tl{left:1.2rem;top:1.2rem}.gi-tr{right:1.2rem;top:1.2rem}.gi-bl{left:1.2rem;bottom:1.2rem}
@keyframes gi-glow{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}35%{opacity:1;transform:translate(-50%,-50%) scale(.8)}100%{opacity:.35;transform:translate(-50%,-50%) scale(1.2)}}
@keyframes gi-dot{0%{transform:translate(-50%,-50%) scale(0)}40%{transform:translate(-50%,-50%) scale(1.4)}70%{transform:translate(-50%,-50%) scale(1)}100%{transform:translate(-50%,-50%) scale(1);opacity:.0}}
@keyframes gi-p{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:1;transform:translate(0,0) scale(1)}70%{opacity:.9;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.4)}}
@keyframes gi-mark{0%{opacity:0;transform:translate(-50%,-50%) scale(.9);filter:blur(10px)}25%{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.15)}}
@keyframes gi-fade{to{opacity:1}}
@keyframes gi-auto{to{opacity:0;visibility:hidden;pointer-events:none}}
.gi-end{animation:gi-auto .6s forwards}
.gi-skip{animation:gi-auto .25s forwards!important}
.hx-rp{position:absolute;z-index:1;pointer-events:none;width:min(52vw,460px);aspect-ratio:1;transform:translate(-50%,-50%)}
.hx-rp i{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(7,63,137,.85);opacity:0;transform:scale(.15);animation:hx-wave 5.4s cubic-bezier(.2,.6,.3,1) infinite;animation-delay:calc(var(--w)*1.35s)}
.hx-rp1{left:24%;top:42%}.hx-rp2{left:78%;top:68%;width:min(36vw,300px)}.hx-rp2 i{animation-duration:6.4s}
@keyframes hx-wave{0%{opacity:0;transform:scale(.15)}12%{opacity:.95}100%{opacity:0;transform:scale(1.5)}}
@media(max-width:639px){.hx-rp1{left:30%;top:36%;width:70vw}.hx-rp2{left:72%;top:74%;width:46vw}}
.hx-pop{position:absolute;z-index:2;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#0f172a;border:1px solid rgba(7,63,137,.14);border-radius:999px;padding:.18rem .5rem;font-size:.58rem;font-weight:600;pointer-events:none;white-space:pre;opacity:0;animation:hx-pop 1.6s ease-out forwards}
@media(max-width:639px){.hx-pop{display:none!important}}
@keyframes hx-pop{0%{opacity:0;transform:scale(.4)}10%{opacity:1;transform:scale(1.08)}16%{transform:scale(1)}78%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.85)}}
@media(prefers-reduced-motion:reduce){.hx-rp i,.hx-pop{animation:none!important}.hx-rp i{opacity:.35;transform:scale(.8)}}
.hx-ring,.hx-chip,.hx-rp{display:none!important}
.hp-hero{margin-top:-3.6rem;padding-top:3.6rem}
.i3-pill{margin-bottom:.9rem;font-size:.64rem!important;padding:.15rem .6rem!important}
@media(max-width:639px){.pill-d{display:none}.i3-pill{font-size:7.5px!important;padding:.15rem .42rem!important;white-space:nowrap;gap:.25rem!important;letter-spacing:-.01em}.i3-pill svg{width:.6rem!important;height:.6rem!important}}
.i3-tag{margin:0 auto 1.1rem;max-width:34rem;font-family:ui-monospace,Menlo,monospace;font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.78);line-height:1.7}
.i3-tag b{color:#fffffd;font-weight:600}
@media(min-width:900px){.i3-tag{max-width:none;font-size:.7rem}}
header.sticky,header.sticky>div{border-bottom-width:0!important;border-color:transparent!important}
header.sticky{color:#334155!important;background-color:rgba(255,255,255,.92)!important;background-image:none!important;-webkit-backdrop-filter:blur(10px)!important;backdrop-filter:blur(10px)!important;box-shadow:0 1px 0 rgba(7,63,137,.08)!important}
header.sticky :is(a,button):not([class*="bg-primary"]){color:#334155!important}
header.sticky :is(a,button):not([class*="bg-primary"]):hover{color:#0f172a!important}
.hx-ring{position:absolute;z-index:1;width:min(46vw,420px);aspect-ratio:1;border-radius:50%;border:3px solid rgba(255,214,0,.65);pointer-events:none;left:62%;top:18%;opacity:0;animation:hx-ring 6s .6s ease-out infinite}

.hx-ring2{left:12%;top:58%;animation-delay:6.2s;width:min(30vw,260px)}
@keyframes hx-ring{0%{opacity:0;transform:scale(.3)}15%{opacity:.9}100%{opacity:0;transform:scale(1.5)}}
.hx-chip{position:absolute;z-index:2;background:rgba(255,255,255,.92);color:#000;border-radius:999px;padding:.35rem .8rem;font-size:.72rem;font-weight:700;pointer-events:none;opacity:0;animation:hx-chip 7s ease-in-out infinite}
.hx-c1{left:8%;top:30%;animation-delay:3.4s}.hx-c2{right:8%;top:38%;animation-delay:5.2s}.hx-c3{left:14%;bottom:24%;animation-delay:7s}
@keyframes hx-chip{0%{opacity:0;transform:translateY(14px)}12%{opacity:1;transform:translateY(0)}60%{opacity:1;transform:translateY(-10px)}75%,100%{opacity:0;transform:translateY(-22px)}}
@media(max-width:639px){.hx-c1{left:4%;top:20%}.hx-c2{right:4%;top:14%}.hx-c3{left:6%;bottom:30%}}

.hx-meta,.hx-m3{display:none!important}
.hp-hero .i3-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.05) brightness(.52)}@media(max-width:639px){.hp-hero .i3-vid{filter:grayscale(1) contrast(1.05) brightness(.4)}}
.i3{margin:0;font-family:Inter,"Helvetica Neue",Arial,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.055em;line-height:.92;color:#0f172a;font-size:clamp(2.9rem,14.2vw,5rem);display:flex;flex-direction:column;align-items:center;text-shadow:none}
@media(max-width:639px){.i3{font-size:clamp(2.05rem,10.6vw,3rem);line-height:.96;letter-spacing:-.045em}.hp-t-m{margin-top:.7rem!important}}
.hmap-img{opacity:.22}@media(max-width:639px){.hmap-img{opacity:.1}.hmap-arc{opacity:.6}.hmap-fit{transform:translateY(-70px) scale(.55);transform-box:fill-box;transform-origin:center}}
.i3-l{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:.14em;white-space:nowrap}
.i3-y{background:#073f89;color:#fff;padding:.02em .12em .06em;margin:.02em 0;border-radius:.1em;text-shadow:none;display:inline-block;animation:i3-in .7s cubic-bezier(.2,.8,.2,1) both}
.i3-y2{animation-delay:.15s}
.nd-h{margin:0 auto;max-width:none;font-family:"HPInst",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em;line-height:1;font-size:min(7.4vw,13.5vh);color:#0f172a;text-align:left;text-shadow:none}
.hp h2,.hp h3{color:#073f89}.nd-t{white-space:nowrap;position:relative;display:block;width:max-content;max-width:100%;margin:0 auto;padding:.1em .22em .16em;background:transparent;will-change:transform,opacity;animation:ndbox 1.1s cubic-bezier(.7,0,.2,1) .25s backwards}
.nd-t b{font-weight:800;color:#fff;background:linear-gradient(#073f89,#073f89);padding:.02em .14em .08em;margin:0 -.04em;border-radius:.09em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.nd-l1::before,.nd-l1::after,.nd-l2::before,.nd-l2::after{content:attr(data-t);position:absolute;left:0;top:0;right:0;bottom:0;white-space:pre;opacity:0;pointer-events:none;background:transparent;color:#fffffd}
.nd-l1::before,.nd-l2::before{text-shadow:-.035em 0 #ff2d55}
.nd-l1::after,.nd-l2::after{text-shadow:.035em 0 #00d4ff}
.nd-on .nd-l1::before,.nd-on .nd-l2::before{opacity:1;animation:ndg1 .42s steps(1,end) both}
.nd-on .nd-l1::after,.nd-on .nd-l2::after{opacity:1;animation:ndg2 .42s steps(1,end) both}
@keyframes ndg1{0%{clip-path:inset(8% 0 70% 0);transform:translateX(-.05em)}20%{clip-path:inset(40% 0 38% 0);transform:translateX(.07em)}40%{clip-path:inset(70% 0 8% 0);transform:translateX(-.04em)}60%{clip-path:inset(20% 0 55% 0);transform:translateX(.05em)}80%{clip-path:inset(55% 0 25% 0);transform:translateX(-.06em)}100%{clip-path:inset(0 0 100% 0)}}
@keyframes ndg2{0%{clip-path:inset(60% 0 22% 0);transform:translateX(.06em)}25%{clip-path:inset(12% 0 66% 0);transform:translateX(-.07em)}50%{clip-path:inset(46% 0 34% 0);transform:translateX(.04em)}75%{clip-path:inset(78% 0 4% 0);transform:translateX(-.05em)}100%{clip-path:inset(0 0 100% 0)}}
@keyframes ndin{0%{opacity:0;transform:scaleY(.2);filter:blur(8px)}100%{opacity:1;transform:none;filter:none}}
.nd-cv{-webkit-mask-image:linear-gradient(#fffffd 70%,transparent 100%);mask-image:linear-gradient(#fffffd 70%,transparent 100%)}.nd-l1,.nd-l2{display:inline-block;position:relative;will-change:transform}.nd-l1{transform:translate3d(calc(var(--nd,0)*-10vw),0,0)}.nd-l2{transform:translate3d(calc(var(--nd,0)*10vw),0,0)}
.nd-h{transform:translate3d(0,calc(var(--nd,0)*-11vh),0) scale(calc(1 - var(--nd,0)*.1));opacity:calc(1 - var(--nd,0)*1.15);will-change:transform,opacity}
.nd-cv{transform:translate3d(0,calc(var(--nd,0)*14vh),0) scale(calc(1 + var(--nd,0)*.06));will-change:transform}
.hp-hero:has(.nd-h) .hp-hero-body>div>*:not(h1){transform:translate3d(0,calc(var(--nd,0)*-5vh),0);opacity:calc(1 - var(--nd,0)*1.4)}
.nd-t b{font-family:Inter,"Helvetica Neue",Arial,sans-serif;font-style:normal;font-weight:900;letter-spacing:-.05em;font-size:.92em}
@media(max-width:899px){.nd-h{font-size:11.4vw;letter-spacing:-.01em}.nd-t{padding:.1em .16em .14em}.nd-h{margin-top:1.25rem}}
@media(min-width:640px){.hp-hero:has(.nd-h) .hp-grid{display:none!important}}.hp-t-d{display:none}@media(min-width:640px){.hp-hero .hp-t-m{display:none!important}.hp-t-d{display:block}}
@keyframes ndbox{0%{clip-path:inset(0 50% 0 50%);filter:brightness(2.2)}60%{filter:brightness(1.3)}100%{clip-path:inset(0 0 0 0);filter:none}}
@keyframes ndrise{from{translate:0 .7em;opacity:0}to{translate:0 0;opacity:1}}
@keyframes ndbar{from{background-size:0% 100%}to{background-size:100% 100%}}
@keyframes ndsky{from{opacity:0}to{opacity:1}}
.nd-w{display:inline-block;animation:ndword 1s cubic-bezier(.2,.8,.2,1) calc(.9s + var(--i,0)*.11s) backwards}
.nd-t b{background-repeat:no-repeat}.nd-t b{font-family:"Space Grotesk",ui-sans-serif,system-ui,sans-serif;font-weight:700;letter-spacing:-.01em;font-size:.9em;text-transform:uppercase}.nd-h:not(.nd-go) .nd-w{opacity:0!important;animation:none!important}.nd-h:not(.nd-go){animation:none!important}@media(min-width:640px){.hp-hero .hp-sub.hp-sub{font-size:.5rem;letter-spacing:.12em;white-space:nowrap;margin-top:1.6rem;position:relative}.hp-hero ul.hp-rise.hp-rise{margin-top:2.4rem}}.nd-go .nd-l1 .nd-w{animation-delay:calc(var(--i,0)*.08s),calc(.35s + var(--i,0)*.08s)!important}
.nd-t b.nd-w{animation:ndword 1s cubic-bezier(.2,.8,.2,1) calc(.9s + var(--i,0)*.11s) backwards,ndbar .8s cubic-bezier(.7,0,.2,1) calc(1.5s + var(--i,0)*.11s) backwards}
@keyframes ndword{from{translate:0 .8em;opacity:0;filter:blur(12px);scale:1.15}to{translate:0 0;opacity:1;filter:blur(0);scale:1}}
.nd-h{animation:ndpush 2.4s cubic-bezier(.2,.7,.2,1) backwards}
@keyframes ndpush{from{scale:1.12}to{scale:1}}
.nd-cv{background-image:radial-gradient(1.2px 1.2px at 23px 41px,#fff,transparent),radial-gradient(1px 1px at 97px 130px,#ddd,transparent),radial-gradient(1.4px 1.4px at 171px 77px,#fff,transparent),radial-gradient(1px 1px at 60px 180px,#bcd,transparent);background-size:210px 210px,170px 170px,250px 250px,190px 190px}
.nd-l2 .nd-w{animation:none}
.nd-h:not(.nd-s1) .nd-l2{opacity:0}
.nd-s1 .nd-l2 .nd-w{animation:ndword .7s cubic-bezier(.2,.8,.2,1) calc((var(--i,0) - 4)*.09s) backwards}
.nd-s1 .nd-l2 b.nd-w{animation:ndword .7s cubic-bezier(.2,.8,.2,1) calc((var(--i,0) - 4)*.09s) backwards,ndbar .6s cubic-bezier(.7,0,.2,1) .3s backwards}
.nd-cv{background-image:none!important;background:#000}
@media(prefers-reduced-motion:reduce){.nd-t{animation:none}.nd-on .nd-t::before,.nd-on .nd-l1::after,.nd-on .nd-l2::after{animation:none;opacity:0}}

.i3-w{display:inline-block;animation:i3-up .8s cubic-bezier(.2,.8,.2,1) both}
.i3-l:nth-child(2) .i3-w{animation-delay:.08s}.i3-l:nth-child(3) .i3-w{animation-delay:.16s}
@keyframes i3-in{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0 0 0)}}
@keyframes i3-up{0%{opacity:0;transform:translateY(.35em)}100%{opacity:1;transform:none}}
@media(min-width:640px){.i3{font-size:min(9.6vw,15.5vh)}}
.i3-meta{position:absolute;z-index:3;font-family:ui-monospace,Menlo,monospace;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(15,23,42,.72);pointer-events:none}
.i3-meta b{color:var(--highlight,#073f89);font-weight:500;margin-left:.5em}
.i3-tl{left:1.2rem;top:5.2rem}.i3-tr{right:1.2rem;top:5.2rem}.i3-bl{left:1.2rem;bottom:1.2rem}.i3-br{right:1.2rem;bottom:1.2rem}
@media(max-width:639px){.i3-tl,.i3-tr{display:none}}
.hx-ring{border-color:rgba(7,63,137,.8)!important;opacity:.9!important;animation:i3-drift 12s ease-in-out infinite alternate!important;left:6%!important;top:24%!important}
.hx-ring2{left:auto!important;right:6%!important;top:48%!important;animation-duration:15s!important;animation-delay:-4s!important}
@keyframes i3-drift{0%{transform:translate(0,0) scale(.85)}50%{transform:translate(38vw,6vh) scale(1.1)}100%{transform:translate(70vw,-4vh) scale(.9)}}
.hx-ring2{animation-name:i3-drift2!important}
@keyframes i3-drift2{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-30vw,-8vh) scale(.8)}100%{transform:translate(-60vw,4vh) scale(1.05)}}
.hx-chip{opacity:1!important;animation:i3-float 6s ease-in-out infinite alternate!important}
.hx-c1{left:5%!important;top:20%!important;right:auto!important;bottom:auto!important}
.hx-c2{right:4%!important;left:auto!important;top:13%!important;bottom:auto!important;animation-duration:7.5s!important;animation-delay:-2s!important}
.hx-c3{left:6%!important;top:64%!important;right:auto!important;bottom:auto!important;animation-duration:8.5s!important;animation-delay:-4s!important}
@keyframes i3-float{0%{transform:translate(0,0)}50%{transform:translate(18px,-14px)}100%{transform:translate(-14px,10px)}}
@media(max-width:639px){.hx-ring{width:56vw!important}.hx-c1{top:16%!important}.hx-c2{top:72%!important;right:4%!important}.hx-c3{display:none}}
@media(prefers-reduced-motion:reduce){.hx-ring,.hx-chip,.i3-y,.i3-w{animation:none!important}.hx-ring2{display:none}}
@media(prefers-reduced-motion:reduce){.gi{display:none}.hx-ring,.hx-chip{animation:none;opacity:0}}
`;

function HeroNedan() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = window.matchMedia("(max-width: 899px)").matches;
    let w = 0, h = 0, raf = 0, vis = true;
    const W0 = 200, H0 = 260;
    const body = (x: CanvasRenderingContext2D, v: number) => {
      x.fillStyle = v % 3 === 1 ? "#efe6cf" : v % 3 === 2 ? "#f7f2e4" : "#f4f0e7"; x.fillRect(0, 0, W0, H0);
      if (v === 3 || v === 6) {
        x.strokeStyle = "#a38b3a"; x.lineWidth = 3; x.strokeRect(8, 8, W0 - 16, H0 - 16);
        x.fillStyle = "#fffffd"; x.fillRect(40, 34, 120, 9);
        x.fillStyle = "rgba(30,30,30,0.5)"; x.fillRect(24, 58, 44, 52);
        for (let r = 0; r < 6; r++) { x.fillStyle = "rgba(30,30,30,0.4)"; x.fillRect(78, 62 + r * 9, 90 - (r % 3) * 14, 3); }
        for (let r = 0; r < 4; r++) { x.fillStyle = "rgba(30,30,30,0.35)"; x.fillRect(24, 128 + r * 12, 150 - (r % 2) * 30, 3); }
        x.fillStyle = "#073f89"; x.beginPath(); x.arc(W0 / 2, H0 - 46, 22, 0, 6.283); x.fill();
        x.fillStyle = "#b08d00"; x.beginPath(); x.arc(W0 / 2, H0 - 46, 14, 0, 6.283); x.fill();
        return;
      }
      x.fillStyle = v % 2 === 0 ? "#fffffd" : "#073f89"; x.fillRect(14, 14, v % 2 === 0 ? 96 : 64, 10);
      x.fillStyle = "#fffffd"; x.fillRect(14, 32, 118, 8);
      for (let r = 0; r < 14; r++) {
        if (r % 5 === 0) { x.fillStyle = "#fffffd"; x.fillRect(14, 54 + r * 13, 40, 4); }
        else { x.fillStyle = "rgba(30,30,30,0.45)"; x.fillRect(14, 54 + r * 13, 70 + ((r * 37) % 110), 3); }
      }
    };
    const mkPage = (v: number, blur: number, curl: number) => {
      const pad = blur ? 22 : 6;
      const base = document.createElement("canvas"); base.width = W0; base.height = H0;
      body(base.getContext("2d")!, v);
      const k = document.createElement("canvas"); k.width = W0 + pad * 2; k.height = H0 + pad * 2 + 40;
      const x = k.getContext("2d")!;
      if (blur) x.filter = "blur(" + blur + "px)";
      const S = 2;
      for (let i = 0; i < W0; i += S) {
        const t = i / W0;
        const dy = Math.sin(t * 3.4 + v) * curl + t * t * curl * 0.8;
        x.drawImage(base, i, 0, S + 1, H0, pad + i, pad + 20 + dy, S + 1, H0 - Math.abs(Math.cos(t * 3.4 + v)) * curl * 0.35);
        if (curl) { const sh = Math.cos(t * 3.4 + v); x.fillStyle = sh > 0 ? "rgba(0,0,0," + (sh * 0.22).toFixed(2) + ")" : "rgba(255,255,255," + (-sh * 0.2).toFixed(2) + ")"; x.fillRect(pad + i, pad + 20 + dy, S + 1, H0 - 8); }
      }
      return k;
    };
    const mkRibbon = (v: number, blur: number) => {
      const k = document.createElement("canvas"); k.width = 120; k.height = 300;
      const x = k.getContext("2d")!;
      if (blur) x.filter = "blur(" + blur + "px)";
      for (let y = 0; y < 280; y += 4) {
        const t = y / 280, cx = 60 + Math.sin(t * 5 + v) * 28, wd = 6 + Math.sin(t * Math.PI) * (14 + v * 2);
        x.fillStyle = "rgba(" + (236 - t * 30) + "," + (232 - t * 30) + "," + (216 - t * 40) + "," + (0.55 + 0.4 * Math.sin(t * Math.PI)).toFixed(2) + ")";
        x.fillRect(cx - wd / 2, 10 + y, wd, 5);
      }
      return k;
    };
    const NV = 7;
    const flat: HTMLCanvasElement[] = [], curled: HTMLCanvasElement[] = [], soft: HTMLCanvasElement[] = [], rib: HTMLCanvasElement[] = [], ribSoft: HTMLCanvasElement[] = [];
    for (let v = 0; v < NV; v++) { flat.push(mkPage(v, 0, 0)); curled.push(mkPage(v, 0, 16 + (v % 3) * 6)); soft.push(mkPage(v, 9, 18)); }
    for (let v = 0; v < 4; v++) { rib.push(mkRibbon(v, 0)); ribSoft.push(mkRibbon(v, 5)); }
    type P = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rot: number; rs: number; fl: number; fs: number; tl: number; v: number; k: number; life: number; max: number; kind: number; sw: number };
    let ps: P[] = [];
    const F = 700;
    // kind 0 curled/flat page, 1 ribbon, 2 big soft foreground sheet, 3 sharp small certificate in center cluster
    const spawn = (burst: boolean, kind?: number): P => {
      const kd = kind !== undefined ? kind : Math.random() < 0.22 ? 1 : 0;
      const a = Math.random() * 6.283;
      const R = Math.max(w, h);
      let r = burst ? 20 + Math.random() * 80 : (0.2 + Math.random() * 0.8) * R * 0.5;
      let z = burst ? -150 + Math.random() * 500 : -250 + Math.random() * 1300;
      let k = 0.7 + Math.random() * 0.8;
      if (kd === 2) { z = -560 + Math.random() * 120; r = (0.2 + Math.random() * 0.5) * R * 0.5; k = 1.1 + Math.random() * 0.7; }
      if (kd === 3) { z = 250 + Math.random() * 450; r = Math.random() * R * 0.13; k = 0.32 + Math.random() * 0.2; }
      const sp = burst ? 380 + Math.random() * 700 : 6 + Math.random() * 22;
      const o = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7, z, vx: kd === 3 ? 0 : Math.cos(a) * sp * (kd === 2 ? 0.25 : 1), vy: kd === 3 ? 0 : Math.sin(a) * sp * 0.7 * (kd === 2 ? 0.25 : 1), vz: burst ? (Math.random() - 0.2) * 500 : (Math.random() - 0.5) * 30, rot: Math.random() * 6.283, rs: (Math.random() - 0.5) * (burst ? 3 : 0.8), fl: Math.random() * 6.283, fs: 0.4 + Math.random() * (burst ? 2.2 : 1.2), tl: (Math.random() - 0.5) * 0.5, v: Math.floor(Math.random() * (kd === 1 ? 4 : NV)), k, life: 0, max: burst ? 5 + Math.random() * 4 : 18 + Math.random() * 20, kind: kd, sw: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5) }; if (kd === 2) { const s0 = F / (F + z); o.x = (-w * 0.6 + Math.random() * w * 0.6) / s0; o.y = (-h * 0.7 + Math.random() * h * 0.9) / s0; o.vx = (320 + Math.random() * 300) / s0; o.vy = (130 + Math.random() * 200) / s0; o.vz = 0; o.max = 6 + Math.random() * 3; o.rs = (Math.random() - 0.5) * 0.6; } else if (!burst && kd < 2) { o.vx += 60; o.vy += 40; } return o;
    };
    const NB = mobile ? 10 : 14, NS = mobile ? 1 : 3, NC = mobile ? 6 : 10;
    const fill = () => {
      const cnt = [0, 0, 0, 0]; for (const p of ps) if (p.max > 12 || p.kind === 2) cnt[p.kind]++;
      while (cnt[0] + cnt[1] < NB) { const p = spawn(false); ps.push(p); cnt[p.kind]++; }
      while (cnt[2] < NS) { ps.push(spawn(false, 2)); cnt[2]++; }
      while (cnt[3] < NC) { ps.push(spawn(false, 3)); cnt[3]++; }
    };
    const resize = () => {
      const r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      w = r.width; h = r.height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!ps.length) fill();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const dust: Array<[number, number, number, number]> = [];
    for (let i = 0; i < (mobile ? 50 : 110); i++) dust.push([Math.random(), Math.random(), 0.4 + Math.random() * 1.2, Math.random() * 6.28]);
    let cam = -1000, scr = 0, mx = 0, my = 0, tmx = 0, tmy = 0, px = -9999, py = -9999;
    const onM = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2;
      px = e.clientX - r.left - r.width / 2; py = e.clientY - r.top - r.height / 2;
    };
    window.addEventListener("pointermove", onM, { passive: true });
    const hero = c.closest("[data-hero]") as HTMLElement | null;
    let tick = false;
    const onS = () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => {
        tick = false;
        const y = (document.scrollingElement || document.documentElement).scrollTop;
        const hh = hero ? hero.offsetHeight : window.innerHeight;
        vis = y < hh * 1.05; scr = Math.max(0, Math.min(1.2, y / hh));
        if (hero) hero.style.setProperty("--nd", Math.max(0, Math.min(1, y / (hh * 0.6))).toFixed(3));
      });
    };
    document.addEventListener("scroll", onS, { passive: true, capture: true });
    onS();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let burstDone = false, last = t0, boost = 0;
    const burst = () => { const n = mobile ? 12 : 26; for (let i = 0; i < n; i++) ps.push(spawn(true, i % 4 === 0 ? 1 : 0)); boost = 1; };
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (document.hidden || !vis || w < 2) return;
      if (!burstDone && now - t0 > 600 && !reduce) { burstDone = true; burst(); }
      { const tt = Math.min(1, (now - t0) / 2600), e = 1 - Math.pow(1 - tt, 3); cam = -1000 * (1 - e) + scr * 520; } mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      boost *= 0.985;
      const cx = w / 2, cy = h / 2, t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      const gl = ctx.createRadialGradient(cx + mx * 60, h * 0.12, 0, cx + mx * 60, h * 0.12, Math.max(w, h) * 0.7);
      gl.addColorStop(0, "rgba(245,204,0," + (0.3 + 0.14 * boost).toFixed(3) + ")"); gl.addColorStop(0.5, "rgba(190,140,0,0.1)"); gl.addColorStop(1, "rgba(7,63,137,0)");
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,246,200,0.55)";
      for (const d of dust) { ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.8 + d[3])); ctx.fillRect(((d[0] * w + t * 6 * d[2] - mx * 12 * d[2]) % w + w) % w, ((d[1] * h - t * 4 * d[2]) % h + h) % h, d[2], d[2]); }
      ctx.globalAlpha = 1;
      ps = ps.filter((p) => p.life < p.max);
      fill();
      for (const p of ps) {
        p.life += dt;
        const s0 = F / (F + p.z - cam);
        const sx0 = cx + p.x * s0 + mx * 40 * s0 * (1 - p.z / 1500), sy0 = cy + p.y * s0 + my * 30 * s0;
        const dx = sx0 - (px + cx), dy = sy0 - (py + cy), d2 = dx * dx + dy * dy, R = 200;
        if (d2 < R * R && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / R) * 900 * dt; p.vx += (dx / d) * f / s0; p.vy += (dy / d) * f / s0; p.rs += (dx > 0 ? 1 : -1) * (1 - d / R) * 2 * dt * 10; }
        if (p.kind === 3) {
          const a = Math.atan2(p.y, p.x) + p.sw * dt * 0.5, r = Math.hypot(p.x, p.y);
          p.x = Math.cos(a) * r + p.vx * dt; p.y = Math.sin(a) * r * 1 + p.vy * dt;
          p.vx *= 0.95; p.vy *= 0.95;
        } else {
          const drag = p.kind === 2 ? 1 : p.life < 4 && p.max < 12 ? 0.985 : 0.999;
          p.vx *= drag; p.vy *= drag; p.vz *= drag;
          p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(t * 0.7 + p.fl) * 6 * dt; p.z += p.vz * dt;
        }
        p.rot += p.rs * dt; p.fl += p.fs * dt;
      }
      const order = ps.filter((p) => F + p.z - cam > 60).sort((a, b) => b.z - a.z);
      for (const p of order) {
        const s = F / (F + p.z - cam);
        const x = cx + p.x * s + mx * 40 * s * (1 - p.z / 1500), y = cy + p.y * s + my * 30 * s;
        const size = 260 * p.k * s * (mobile ? 0.5 : 0.9);
        if (x < -size * 1.2 || x > w + size * 1.2 || y < -size * 1.2 || y > h + size * 1.2) { if (p.max > 12 && p.kind !== 2) p.life += 0.5; continue; }
        const fadeIn = Math.min(1, p.life / 0.6), fadeOut = Math.min(1, (p.max - p.life) / 1.2);
        const fog = 0.3 + 0.7 * Math.max(0, Math.min(1, 1 - (p.z + 100) / 1700));
        let spr: HTMLCanvasElement, al = 0.9;
        if (p.kind === 1) spr = (s > 1.15 ? ribSoft : rib)[p.v % 4];
        else if (p.kind === 2) { spr = soft[p.v]; al = 0.55; }
        else if (p.kind === 3) { spr = flat[p.v % 2 === 0 ? 3 : 6]; al = 0.95; }
        else spr = s > 1.15 ? soft[p.v] : curled[p.v];
        const sq = p.kind === 3 ? 0.55 + 0.45 * Math.abs(Math.cos(p.fl * 0.6)) : 0.3 + 0.7 * Math.abs(Math.cos(p.fl));
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.transform(1, p.tl * Math.sin(p.fl), 0, 1, 0, 0); ctx.scale(sq, 1);
        ctx.globalAlpha = (mobile ? 0.26 : 0.32) * al * fadeIn * fadeOut * (p.kind === 3 ? 1 : fog);
        const sc = size / 260;
        const ww = spr.width * sc, hh = spr.height * sc;
        ctx.drawImage(spr, -ww / 2, -hh / 2, ww, hh);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("scroll", onS, true); window.removeEventListener("pointermove", onM); };
  }, []);
  return <canvas ref={ref} aria-hidden className="nd-cv absolute inset-0 -z-20 h-full w-full" />;
}

function NedanTitle() {
  const [g, setG] = useState(false);
  const [s1, setS1] = useState(false);
  const [go, setGo] = useState(false);
  useEffect(() => { let done = false; const f = () => { if (done) return; done = true; requestAnimationFrame(() => requestAnimationFrame(() => setGo(true))); }; const t = window.setTimeout(f, 1500); (document.fonts ? document.fonts.ready : Promise.resolve()).then(f); return () => window.clearTimeout(t); }, []);
  useEffect(() => { const to = window.setTimeout(() => setS1(true), 600); return () => window.clearTimeout(to); }, []);
  useEffect(() => {
    let to = 0;
    const loop = () => {
      setG(true);
      to = window.setTimeout(() => { setG(false); to = window.setTimeout(loop, 1800 + Math.random() * 2200); }, 420);
    };
    to = window.setTimeout(loop, 1400);
    return () => window.clearTimeout(to);
  }, []);
  const T = "The job you want. The resume it needs.";
  return (
    <h1 className={"nd-h mt-5" + (go ? " nd-go" : "") + (g ? " nd-on" : "") + (s1 ? " nd-s1" : "")} aria-label={T} onPointerEnter={() => setG(true)} onPointerLeave={() => setG(false)}>
      <span aria-hidden className="nd-t" data-t={"The JOB you want.\nThe RESUME it needs."}><span className="nd-l1" data-t="The JOB you want."><span className="nd-w" style={{ "--i": 0 } as never}>The</span> <b className="nd-w" style={{ "--i": 1 } as never}>JOB</b> <span className="nd-w" style={{ "--i": 2 } as never}>you</span> <span className="nd-w" style={{ "--i": 3 } as never}>want.</span></span><br /><span className="nd-l2" data-t="The RESUME it needs."><span className="nd-w" style={{ "--i": 4 } as never}>The</span> <b className="nd-w" style={{ "--i": 5 } as never}>RESUME</b> <span className="nd-w" style={{ "--i": 6 } as never}>it</span> <span className="nd-w" style={{ "--i": 7 } as never}>needs.</span></span></span>
    </h1>
  );
}

function Index() {
  const wide = true;
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
      const ftEl = document.querySelector("footer.sf");
      const ftTop = ftEl ? ftEl.getBoundingClientRect().top : Infinity;
      setShowBar(pastHero && ctaTop > vh * 0.6 && ftTop > vh);
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
      document.querySelectorAll<HTMLElement>(".hp-row,.tx-ex").forEach((el) => {
        const mv = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--rx", `${(ev.clientX - r.left).toFixed(0)}px`);
          el.style.setProperty("--ry", `${(ev.clientY - r.top).toFixed(0)}px`);
        };
        el.addEventListener("pointermove", mv);
        cleanups.push(() => el.removeEventListener("pointermove", mv));
      });
      {
        const grid = document.querySelector<HTMLElement>(".rl-grid");
        const num = document.querySelector<HTMLElement>(".rl-n[data-to]");
        if (grid) {
          const mv = (ev: PointerEvent) => {
            const r = grid.getBoundingClientRect();
            grid.style.setProperty("--gmx", (((ev.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
            grid.style.setProperty("--gmy", (((ev.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
          };
          const sc = () => {
            const r = grid.getBoundingClientRect();
            const v = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / window.innerHeight - 0.5) * 2));
            grid.style.setProperty("--rs", v.toFixed(3));
          };
          grid.addEventListener("pointermove", mv);
          addEventListener("scroll", sc, { passive: true });
          sc();
          cleanups.push(() => { grid.removeEventListener("pointermove", mv); removeEventListener("scroll", sc); });
        }
        if (num) {
          let done = false;
          const io = new IntersectionObserver((es) => {
            es.forEach((e) => {
              if (!e.isIntersecting || done) return;
              done = true;
              const t0 = performance.now();
              const tick = (now: number) => {
                const k = Math.min(1, (now - t0) / 1300);
                num.textContent = String(Math.round(30 * (1 - Math.pow(1 - k, 3))));
                if (k < 1) requestAnimationFrame(tick); else num.classList.add("done");
              };
              requestAnimationFrame(tick);
            });
          }, { threshold: 0.4 });
          io.observe(num);
          cleanups.push(() => io.disconnect());
        }
      }
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
    <main ref={rootRef} className={`hp bg-background text-foreground ${rv ? "hp-rv hp-live" : ""}`}>
      <style>{HP_CSS}</style>
      <style>{GI_CSS}</style>
      <WipSplash />
      <div aria-hidden className="hp-prog">
        <span data-bar />
      </div>

      {/* Hero */}
      <section data-hero className="hp-hero relative isolate overflow-hidden">
        {wide ? <HeroVideo /> : <HeroNedan />}
        <HeroDemo />
        <div aria-hidden className="hp-grid absolute inset-0 -z-10" />
        <div aria-hidden className="hp-cursor absolute inset-0 -z-10" />

        <HeroPops />
        <HeroCounter />
        <div aria-hidden className="hx-meta hx-m1"><span>(01)</span> find / tailor / apply</div>
        <div aria-hidden className="hx-meta hx-m2">global roles <b>/</b> free to start</div>
        <div aria-hidden className="hx-meta hx-m3"><i /> scroll</div>
        <div aria-hidden className="hx-meta hx-m4">terbey&reg; 2026</div>
        <div className="site-container relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-10">
          <div className="hp-hero-body relative text-center">
            
            

            <div className="relative mx-auto max-w-6xl">
              <span className="animate-pulse-ring i3-pill inline-flex items-center gap-1.5 rounded-full border border-slate-900/15 bg-white/60 px-3 py-1 text-xs backdrop-blur">
                <Sparkles className="size-3 animate-twinkle text-highlight" /> Find jobs · <span className="pill-d">Make resume from scratch · </span>Tailor resume · Apply — 5 free a month
              </span>
              <div className="hp-t-d"><NedanTitle /></div>{(
<h1 className="i3 mt-5 hp-t-m" aria-label="The job you want. The resume it needs.">
                <span aria-hidden className="i3-l"><span className="i3-w">THE</span> <mark className="i3-y">JOB</mark> <span className="i3-w">YOU WANT.</span></span>
                <span aria-hidden className="i3-l"><span className="i3-w">THE</span> <mark className="i3-y i3-y2">RESUME</mark> <span className="i3-w">IT NEEDS.</span></span>
              </h1>
)}
            </div>

            <p className="hp-rise mx-auto mt-5 hidden max-w-md text-[0.68rem] uppercase leading-relaxed tracking-[0.16em] text-slate-600 [animation-delay:140ms] sm:block sm:max-w-none">
              Works with resumes from Indeed, Naukri, Glassdoor and more
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
                  className="hp-btn rounded-full border-primary/30 bg-background px-7 text-primary hover:bg-background hover:text-primary"
                >
                  <Link to="/ats-checker">ATS score checker</Link>
                </Button>
                <small className="hp-sub">Free ATS score in 20 seconds</small>
              </span>
            </div>

            <p className="hp-rise mt-4 text-[0.68rem] uppercase tracking-[0.2em] text-slate-600 sm:hidden"><span className="text-highlight">5 free</span> a month / no card</p>
            <p className="hp-rise mt-2 text-[0.5rem] uppercase tracking-[0.1em] text-slate-500 whitespace-nowrap sm:hidden">Works with Indeed, Glassdoor, Naukri</p>

            <ul className="hp-rise mt-6 hidden flex-wrap justify-center gap-2 sm:flex text-[0.66rem] uppercase tracking-[0.16em] text-slate-700 [animation-delay:320ms] sm:text-xs">
              <li><Link to="/jobs" search={{ alert: undefined }} className="hp-chip">Job finder</Link></li>
              <li><Link to="/tailor" className="hp-chip">Resume tailor</Link></li>
              <li><Link to="/resume-builder" className="hp-chip">Resume builder</Link></li>
              <li className="hp-chip hp-chip-y">5 free a month</li>
              <li className="hp-chip hidden sm:block">No card needed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roles ticker */}
      <div className="overflow-hidden py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 text-sm uppercase tracking-[0.2em] text-black/70">
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
          <p data-rv className="hp-r mt-5 max-w-xs text-sm text-foreground/60 sm:ml-auto sm:max-w-sm sm:text-base">
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
                <p className="mt-1 hidden max-w-xs text-sm text-foreground/60 sm:block">{st.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scope: rows with a hover image */}
      <section id="jobfinder" data-p className="jf site-container py-16 sm:py-28">
        <div className="jf-grid">
          <div className="jf-l">
            <span data-rv className="hp-r jf-chip">AI job finder</span>
            <h2 data-rv className="hp-r jf-h">
              <span className="jf-a">Stop opening ten job boards.</span>
              <span className="jf-b">Get one merged list.</span>
            </h2>
            <p data-rv className="hp-r jf-p">
              Type the role, location, experience and salary once. Our AI searches Indeed, Glassdoor, Naukri and more at the same time, filters out the mismatches, and hands you one clean list — then tailors your resume for any listing in a click.
            </p>
            <div data-rv className="hp-r jf-cta">
              <Link to="/jobs" search={{ alert: undefined }} className="jf-btn jf-btn-y">Try the job finder free <ArrowRight className="size-4" /></Link>
              <Link to="/pricing" className="jf-btn jf-btn-o">See plans</Link>
            </div>
            <p data-rv className="hp-r jf-note">One free search on any account — no card needed.</p>
          </div>
          <ol className="jf-r">
            {[
              ["Every major board, one search", "Results merged and de-duplicated across job boards, sorted by how well they fit you."],
              ["Filters that actually hold", "Role, seniority, location, remote and salary band in your own currency — mismatches are dropped."],
              ["Daily alerts by email", "Save a search and get fresh roles every morning at the hour and timezone you pick."],
              ["One click to tailor", "Send any listing straight into the builder for a rewritten resume and cover letter."],
            ].map(([t, d], i) => (
              <li key={t} data-rv className="hp-r jf-it" style={{ ["--k" as string]: i }}>
                <span className="jf-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="jf-t">{t}</span>
                <span className="jf-d">{d}</span>
              </li>
            ))}
          </ol>
        </div>
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
                          ) : i === 3 ? (
                            <Link to="/ats-checker" className={titleCls}>{titleIn}</Link>
                          ) : (
                            <Link to={i === 1 ? "/tailor" : i === 4 ? "/ai-interview" : "/resume-builder"} className={titleCls}>{titleIn}</Link>
                          )}
                        </h3>
                        <p className="mt-3 hidden max-w-lg text-sm text-white/70 sm:block sm:text-base">{body}</p>
                        {i === 0 ? (
                          <Link to="/jobs" search={{ alert: undefined }} className={ctaCls}>
                            {s.cta} <ArrowRight className="size-3.5" />
                          </Link>
                        ) : i === 3 ? (
                          <Link to="/ats-checker" className={ctaCls}>
                            {s.cta} <ArrowRight className="size-3.5" />
                          </Link>
                        ) : (
                          <Link to={i === 1 ? "/tailor" : i === 4 ? "/ai-interview" : "/resume-builder"} className={ctaCls}>
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

      {/* Examples */}
      {showcaseExamples.length > 0 ? (
        <section className="site-container pb-16 sm:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 data-rv className="hp-r font-display text-4xl font-bold uppercase leading-none sm:text-6xl">
              Resume examples
            </h2>
            <Link to="/examples/resumes" className="hp-r inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-highlight">
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
                <span className="tx-for"><span className="tx-tf">Tailored for</span> <span className="tx-role" data-t={example.role}>{example.role}</span></span>
                <span className="tx-exname">{example.role} resume</span>
                <ArrowUpRight className="tx-arr size-7 shrink-0 sm:size-10" />
              </Link>
            ))}
          </div>
          <div className="sae-wrap mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-14">
            <Link to="/examples/resumes" data-rv className="hp-r sae-btn group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-highlight px-8 py-4 text-base font-bold text-primary-foreground">
              <span className="sae-dot" aria-hidden />
              <span className="relative z-10">See all examples</span>
              <ArrowRight className="sae-arrow relative z-10 size-5" />
              <span className="sae-shine" aria-hidden />
            </Link>
            <span className="sae-note text-xs uppercase tracking-[.18em] text-foreground/55">Search, preview and download every resume</span>
          </div>
        </section>
      ) : null}

      {/* Split headline + moving image strips */}
      <section id="tools" data-p className="relative overflow-hidden py-10 sm:py-20">
        <div className="site-container">
          <div className="wy relative font-display font-bold uppercase">
            <div className="wy-l">
              <span data-rv className="hp-wd" style={{ ["--k" as string]: 0 }}>Your next application,</span>
            </div>
            <div className="wy-l">
              <span data-rv className="hp-wd text-highlight" style={{ ["--k" as string]: 1 }}>tailored</span>{" "}
              <span data-rv className="hp-wd" style={{ ["--k" as string]: 2 }}>in 30 seconds</span>
            </div>
            <div aria-hidden className="wy-badge absolute right-0 top-1/2 -translate-y-1/2">
              <svg viewBox="0 0 120 120" className="wy-b1">
                <defs>
                  <path id="hpc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text fontSize="12" letterSpacing="3.4" fill="currentColor">
                  <textPath href="#hpc">FIND • TAILOR • APPLY • REPEAT •</textPath>
                </text>
              </svg>
              <svg viewBox="0 0 120 120" className="wy-b2">
                <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
              </svg>
              <i className="wy-core" />
            </div>
          </div>
<ul className="mt-6 flex flex-wrap gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/70 sm:mt-10 sm:text-xs">
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
              <div key={i} className="hp-tl relative overflow-hidden rounded-lg border border-primary/10">
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div aria-hidden className="gap-mq gap-a"><div className="gap-mq-in">{[0, 1].map((n) => (<span key={n}>FIND <b>*</b> TAILOR <b>*</b> APPLY <b>*</b> REPEAT <b>*</b> FIND <b>*</b> TAILOR <b>*</b> APPLY <b>*</b> REPEAT <b>*</b> </span>))}</div></div>

      {/* About: text only, full width, rows slide left and right on scroll */}
      <section id="about" data-p className="ab2s relative overflow-hidden py-16 sm:py-24">
        <p className="hp-hand relative z-10 px-5 text-2xl text-highlight sm:px-10 sm:text-3xl">about</p>
        <div className="ab2-rows mt-4 font-display font-bold uppercase">
          {aboutLines.map((ln, li) => (
            <div key={li} className={`ab2-row ${li % 2 ? "ab2-rr" : "ab2-rl"}`} style={{ ["--k" as string]: li }}>
              <span className="ab2-in">
                {ln.map((w, i) => (
                  <span key={i} className={`ab2-w ab2-${w.c.split(" ").join(" ab2-")} ${w.m ? "hp-mark" : ""}`}>
                    {w.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div aria-hidden className="gap-mq gap-b"><div className="gap-mq-in">{[0, 1].map((n) => (<span key={n}>ONE RESUME <b>*</b> TWENTY JOBS <b>*</b> ONE RESUME <b>*</b> TWENTY JOBS <b>*</b> ONE RESUME <b>*</b> TWENTY JOBS <b>*</b> </span>))}</div></div>

      {/* AI interview band (replaced the old Built for applying at scale section) */}
      <InterviewBand />

      <Bridge label="real people, real applications" href="#reel" />

      {/* Showreel */}
      <section id="reel" data-p className="rl relative overflow-hidden py-12 sm:py-28">
        <div className="site-container">
          <div className="rl-head">
            <span className="rl-mono">( hiring, in motion )</span>
            <p className="rl-say" aria-label="Real people. Real offers."><span aria-hidden className="rl-n rl-w">Real</span><span aria-hidden className="rl-sec">people.</span><span aria-hidden className="rl-aj">Real offers.</span></p>
          </div>
          <div className="rl-grid mt-6 sm:mt-10">
            {reelTiles.map((n, k) => (
              <div key={n} aria-hidden className="rl-t" style={{ ["--k" as string]: k, ["--d" as string]: reelRing[k], ["--dx" as string]: reelPos[k][0] - 2.5, ["--dy" as string]: reelPos[k][1] - 1.5, ["--rd" as string]: reelPos[k][1] % 2 ? 1 : -1 }}>
                <img src={`/m/${n}.webp`} alt="" loading="lazy" decoding="async" />
                {k % 5 === 2 ? <i className="rl-dot" /> : null}
                {k % 4 === 1 ? <em className="rl-tag">{String(k + 1).padStart(2, "0")}</em> : null}
              </div>
            ))}
            <ReelCentre />
          </div>
        </div>
      </section>


      <div className={`hp-bar bg-background sm:hidden ${showBar ? "show" : ""}`}>
        <Link
          to="/tailor"
          className="flex items-center justify-center gap-2 rounded-full bg-highlight px-6 py-3 text-sm font-semibold text-highlight-foreground shadow-[0_8px_30px_rgba(255,255,253,.6)]"
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
.hp-hero{--hp:0;--mx:0;--my:0;color:#0f172a}
.hp-hero .hp-chip{border-color:rgba(7,63,137,.22);background:rgba(255,255,255,.7);color:#334155}
.hp-hero .hp-chip:hover{border-color:var(--highlight)}
.hp-hero-body{transform:translateY(calc(var(--hp)*-40px));opacity:calc(1 - var(--hp)*1.1)}
.hp-vid{background:#000}
.hp-hero .hp-vid{transform:scale(calc(1 + var(--hp)*.12)) translateY(calc(var(--hp)*60px))}
.hp-echo{position:absolute;left:0;right:0;top:0;color:transparent;-webkit-text-stroke:1px rgba(7,63,137,.28);pointer-events:none;user-select:none}
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
.hp-chip{border:1px solid rgba(7,63,137,.18);border-radius:999px;padding:.4rem .8rem;background:rgba(7,63,137,.35);backdrop-filter:blur(6px);transition:border-color .3s,transform .3s}
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
.hp-grid{background-image:linear-gradient(to right,rgba(7,63,137,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(7,63,137,.04) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 40%,#fffffd 20%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at 50% 40%,#fffffd 20%,transparent 75%)}
.hp-br{position:absolute;width:12px;height:12px;border-color:rgba(0,0,0,.5)}
.hp-fl{position:absolute;bottom:1.5rem;width:11rem;transition:transform .2s linear}
.hp-fl-a{left:0;transform:translate(calc(var(--mx)*14px),calc(var(--my)*10px)) rotate(-6deg)}
.hp-fl-b{right:0;transform:translate(calc(var(--mx)*-22px),calc(var(--my)*-14px)) rotate(6deg)}
.hp-doc{border:1px solid rgba(7,63,137,.18);background:rgba(8,8,8,.85);backdrop-filter:blur(6px);border-radius:12px;padding:14px;text-align:left;box-shadow:0 20px 60px rgba(255,255,253,.6)}
.hp-doc b{display:block;font-size:.6rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(0,0,0,.55);margin-bottom:12px;line-height:1.5}
.hp-doc.hot b{color:var(--highlight)}
.hp-doc b u{text-decoration:none;display:block;margin-top:2px;color:rgba(0,0,0,.55)}
.hp-doc i{display:block;height:6px;border-radius:9px;background:rgba(7,63,137,.16);margin-top:7px}
.hp-doc i.s{width:60%}
.hp-doc i.y{background:var(--highlight)}
.hp-scroll{animation:hp-pulse 2.4s ease-in-out infinite}
@keyframes hp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
.hp-rise{animation:hp-rise .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes hp-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
.hp-mag{transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.hp-btn{transition:background-color .4s}
.hp-btn:focus-visible,.hp-row:focus-visible,.hp-spot:focus-visible{outline:2px solid var(--highlight);outline-offset:3px}
.hp-live .hp-w{color:rgba(7,63,137,.28);transition:color .35s}
.hp-live .hp-w.on{color:#073f89}
.hp-sl{transform:translateX(calc((var(--p) - .5)*-26vw))}
.hp-sr{transform:translateX(calc((var(--p) - .5)*26vw))}
.hp-strip{will-change:transform}
.hp-strip-a{transform:translateX(calc(var(--p)*-22%))}
.hp-strip-b{transform:translateX(calc(-22% + var(--p)*22%))}
[data-p]{--p:.5}
.hp-row{transition:padding-left .45s cubic-bezier(.2,.7,.2,1)}
.hp-row:hover{padding-left:1rem}
.hp-row:hover .font-display{color:var(--highlight)}
.hp-rowimg{position:absolute;right:0;top:0;height:100%;width:45%;object-fit:cover;opacity:0;transform:translateX(30px);transition:opacity .5s,transform .5s;-webkit-mask-image:linear-gradient(to left,#fffffd 30%,transparent);mask-image:linear-gradient(to left,#fffffd 30%,transparent);pointer-events:none}
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
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.hp-roleword,.hp-dot,.hp-about-doc{animation:none}.hp-about-card,.hp-about-doc,.hp-about-note{transform:none}.hp-prog{display:none}.hp-rise,.hp-scroll{animation:none}.hp-rv .hp-r{opacity:1;transform:none;transition:none}.hp-live .hp-w{color:#073f89}.hp-hero-body,.hp-hero .hp-vid,.hp-sl,.hp-sr,.hp-strip-a,.hp-strip-b,.hp-tile,.hp-core{transform:none!important;opacity:1}.hp-stack{position:static}}

.hp-w{display:inline-block;margin-right:.28em}
.hp-live .hp-w{transform:translateY(.22em);transition:color .35s,transform .45s cubic-bezier(.2,.7,.2,1)}
.hp-live .hp-w.on{transform:none}
.hp-w:hover{color:var(--highlight)!important}
.hp-mark{background-image:linear-gradient(var(--highlight),var(--highlight));background-repeat:no-repeat;background-position:0 92%;background-size:0 .12em;transition:color .35s,transform .45s cubic-bezier(.2,.7,.2,1),background-size .7s .15s}
.hp-live .hp-mark.on{background-size:100% .12em}
.hp-pecho{position:absolute;inset:0;margin:0;color:transparent;-webkit-text-stroke:1px rgba(7,63,137,.13);pointer-events:none;user-select:none;display:none}
.hp-live .hp-pecho{display:block;transform:translate(calc((.5 - var(--p))*40px),calc((var(--p) - .5)*-30px))}
.hp-pnote{transform:rotate(-5deg)}
.hp-wd{display:inline-block}
.hp-rv .hp-wd{opacity:0;transform:translateY(70%) rotate(5deg);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--k)*.11s)}
.hp-rv .hp-wd.in{opacity:1;transform:none}
.hp-badge{color:var(--highlight);animation:hp-spin 18s linear infinite}
@keyframes hp-spin{to{transform:rotate(360deg)}}
.hp-art{position:absolute;right:1rem;top:50%;transform:translateY(-50%);width:11.5rem;pointer-events:none}
@media(min-width:640px){.hp-art{right:2.5rem;width:16rem}}
.hp-job{display:flex;align-items:center;gap:.5rem;border:1px solid rgba(7,63,137,.16);background:rgba(255,255,253,.7);border-radius:10px;padding:.5rem .65rem;margin-bottom:.5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;animation:hp-slide 4.8s ease-in-out infinite;animation-delay:calc(var(--k)*.5s)}
.hp-job em{margin-left:auto;font-style:normal;color:var(--highlight);font-size:.6rem;white-space:nowrap}
.hp-pulse{width:7px;height:7px;border-radius:9px;background:var(--highlight);flex:none;animation:hp-ping 1.8s infinite}
@keyframes hp-slide{0%,100%{transform:translateX(0)}50%{transform:translateX(-14px)}}
.hp-art-2 .hp-doc{transform:rotate(4deg)}
.hp-sweep{position:relative;overflow:hidden}
.hp-sweep::after{content:"";position:absolute;inset:0;background:var(--highlight);transform:translateX(-101%);animation:hp-fill 4s ease-in-out infinite;animation-delay:calc(var(--k)*.45s)}
@keyframes hp-fill{0%,15%{transform:translateX(-101%)}45%,85%{transform:translateX(0)}100%{transform:translateX(101%)}}
.hp-file{display:flex;align-items:center;justify-content:space-between;gap:.5rem;border:1px solid rgba(7,63,137,.2);background:rgba(255,255,253,.72);border-radius:10px;padding:.6rem .75rem;margin-bottom:.5rem;font-size:.7rem;animation:hp-slide 5s ease-in-out infinite;animation-delay:calc(var(--k)*.6s)}
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
.hp-core{transform:none;box-shadow:0 0 0 1px rgba(7,63,137,.08),0 30px 80px -30px color-mix(in oklab,var(--highlight) 35%,transparent)}
.hp-hw{margin-right:.26em}
.hp-bignum{position:absolute;right:1rem;bottom:-1.5rem;font-family:var(--font-display,inherit);font-weight:800;font-size:9rem;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(7,63,137,.14);transform:translateY(calc((1 - var(--p))*70px));pointer-events:none}
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
.hx-outline{font-size:4.4rem;color:transparent;-webkit-text-stroke:2px #073f89}
.hx-giant{font-size:5.2rem;color:var(--highlight)}

.hx-outline::before{content:attr(data-t);position:absolute;left:0;top:0;transform:translate(-.04em,.04em);color:rgba(7,63,137,.16);z-index:-1}
.hx-mid{font-size:2.2rem;font-weight:500;font-family:Georgia,"Times New Roman",serif;font-style:italic;text-transform:none;letter-spacing:0;opacity:0;animation:hx-in .8s .5s forwards}
.hx-tiny{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;letter-spacing:.3em;color:rgba(0,0,0,.65);opacity:0;animation:hx-in .8s .8s forwards}
.hx-under{position:absolute;left:0;right:0;bottom:.02em;height:.07em;background:#073f89;transform:scaleX(0);transform-origin:0 50%;animation:hx-line 1s 1.4s cubic-bezier(.2,.7,.2,1) forwards}
.hx-l2{margin-top:.1em}.hx-l3{margin-top:.5rem;gap:1rem}
.hx-track{position:relative;display:inline-block;width:min(34vw,12rem);height:10px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.5) 0 2px,transparent 2px 12px);background-size:12px 10px;animation:hx-run 1s linear infinite;opacity:.7;align-self:center}
.hx-track em{position:absolute;left:0;right:0;top:4px;height:2px;background:rgba(7,63,137,.35)}
.hx-stop{font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.2em;color:rgba(0,0,0,.6);opacity:0;animation:hx-in .8s 2.1s forwards}
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
.nx-m{font-size:2rem;color:transparent;-webkit-text-stroke:1.5px rgba(0,0,0,.7);font-family:Georgia,serif;font-style:italic;text-transform:none;font-weight:400}
.nx-act{font-size:3.6rem;transform:rotate(-5deg);display:inline-block}
@media(min-width:640px){.nx-a{font-size:8rem}.nx-b{padding-left:6rem}.nx-m{font-size:5.5rem}.nx-act{font-size:7rem}}
.nx-list{display:flex;flex-direction:column;gap:1.8rem}
.nx-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.4rem 1.5rem}
.nx-r{justify-content:flex-end;text-align:right}
.nx-num{font-size:5rem;display:flex;align-items:baseline;gap:.15em}
.nx-suf{font-size:.34em;font-family:Georgia,serif;font-style:italic;font-weight:400;color:#073f89;opacity:.85}
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
.tx-sm{font-size:.9rem;color:rgba(0,0,0,.6);max-width:20rem}
.tx-why{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem 1.2rem;padding:.9rem 0;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.tx-why:hover{transform:translateX(1.2rem)}
.tx-big{font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;line-height:.95;font-size:2rem;transition:color .3s}
.tx-out{color:transparent;-webkit-text-stroke:1.5px #073f89;font-family:Georgia,serif;font-style:italic;text-transform:none;font-weight:400}
.tx-yel{color:var(--highlight)}
.tx-why:hover .tx-big{color:var(--highlight)}.tx-why:hover .tx-out{color:transparent;-webkit-text-stroke-color:var(--highlight)}
@media(min-width:640px){.tx-big{font-size:5.2rem}.tx-why{padding:1.2rem 0 1.2rem 0}.tx-why:nth-child(2){margin-left:8%}.tx-why:nth-child(3){margin-left:16%}.tx-sm{font-size:1rem}}
.tx-ex{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem 1rem;padding:.9rem 0;transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.tx-ex:hover{transform:translateX(1rem)}
.tx-for{font-size:1.3rem;color:var(--highlight);transform:rotate(-2deg);display:inline-block}
.tx-exname{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;font-size:1.6rem;flex:1 1 100%;order:3;color:transparent;-webkit-text-stroke:1px rgba(0,0,0,.75);transition:color .3s,-webkit-text-stroke-color .3s}
.tx-arr{color:rgba(7,63,137,.4);transition:transform .3s,color .3s;order:4}
.tx-ex:hover .tx-exname{color:#073f89;-webkit-text-stroke-color:#073f89}
.tx-ex:hover .tx-arr{color:var(--highlight);transform:translate(4px,-4px)}
@media(min-width:640px){.tx-ex{flex-wrap:nowrap;align-items:center;gap:1.5rem;padding:1.4rem 0}.tx-exname{flex:1;order:0;font-size:3.6rem}.tx-for{font-size:1.9rem;min-width:15rem;order:-1}.tx-n{order:-2}.tx-arr{order:0}}
.tx-plans{display:grid;grid-template-columns:1fr 1fr;gap:2.2rem 1rem}
.tx-pn{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;letter-spacing:.25em;text-transform:uppercase;color:rgba(0,0,0,.6)}
.tx-pnum{font-family:var(--font-display,inherit);font-weight:800;font-size:5rem;line-height:.9;margin-top:.4rem}
.tx-pl{font-family:Georgia,serif;font-style:italic;color:rgba(0,0,0,.8);font-size:1rem;margin-top:.3rem}
.tx-ps{font-size:.85rem;color:rgba(0,0,0,.6);margin-top:.5rem}.tx-ps span{color:var(--highlight);font-weight:700}
@media(min-width:1024px){.tx-plans{grid-template-columns:repeat(4,1fr);gap:1rem 2rem}.tx-pnum{font-size:8.5rem}.tx-plan:nth-child(even){margin-top:2.5rem}.tx-pl{font-size:1.15rem}}
/* showreel */
.rl-head{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem}
.rl-mono{font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(0,0,0,.7)}
.rl-say{font-size:3rem;line-height:.95;color:var(--highlight);transform:rotate(-2deg);transform-origin:0 50%}
@media(min-width:640px){.rl-say{font-size:7.5rem}.rl-mono{font-size:.8rem}}
.rl-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.35rem}
@media(min-width:640px){.rl-grid{gap:.6rem}}
.rl-t{position:relative;aspect-ratio:1/1;overflow:hidden;border-radius:.5rem;opacity:calc(var(--rp,1));transform:scale(calc(.7 + var(--rp,1)*.3));transition:transform .35s,outline-color .3s;outline:1px solid transparent}
.rl-t img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72;transition:opacity .3s,transform .6s}
.rl-t:hover{outline-color:var(--highlight);z-index:2}.rl-t:hover img{opacity:1;transform:scale(1.08)}
.rl-core{grid-column:2/6;grid-row:2/4}
.rl-dot{position:absolute;left:.35rem;top:.35rem;width:.4rem;height:.4rem;border-radius:99px;background:var(--highlight);animation:hp-pulse 1.8s ease-in-out infinite}
.rl-tag{position:absolute;right:.3rem;bottom:.2rem;font:normal .55rem ui-monospace,Menlo,monospace;color:#073f89;opacity:.85}
.rl-seg{display:block;width:1.2rem;height:2px;background:rgba(7,63,137,.35)}.rl-seg.on{background:var(--highlight)}
.hp-live .rl{--rp0:0}
.hp-live .rl-t{--rp:clamp(0, calc(var(--p)*3.2 - var(--d)*.28), 1);opacity:calc(var(--rp)*(1 - clamp(0, calc((var(--p) - .78)*4), 1)*.7))}
@media(prefers-reduced-motion:reduce){.rl-t{transform:none!important;opacity:1!important}}

/* hero craft */
.hp-hero{--rx:0;--ry:0;--gx:0px}
.hx{transform:perspective(1300px) rotateY(calc(var(--ry)*1deg)) rotateX(calc(var(--rx)*1deg));transition:transform .25s ease-out;transform-style:preserve-3d}
.hp-hero-body{filter:blur(calc(var(--hp)*9px));transform:translateY(calc(var(--hp)*-40px)) scale(calc(1 + var(--hp)*.1))}
.hx-tun{mix-blend-mode:multiply;opacity:.85}
.hx-giant::before{content:attr(data-t);position:absolute;left:0;top:0;color:var(--highlight);-webkit-text-stroke:0;transform:translate(var(--gx),0);clip-path:inset(0 0 62% 0);z-index:1;opacity:0;animation:hx-gl 5.2s 2.2s infinite steps(1)}
.hx-giant::after{content:attr(data-t);position:absolute;left:0;top:0;color:#073f89;transform:translate(calc(var(--gx)*-1),0);clip-path:inset(58% 0 12% 0);z-index:1;opacity:0;animation:hx-gl2 5.2s 2.2s infinite steps(1)}
.hx-outline::after{content:attr(data-t);position:absolute;left:0;top:0;color:var(--highlight);-webkit-text-stroke:0;clip-path:inset(40% 0 38% 0);transform:translateX(calc(var(--gx)*-.7));opacity:0;animation:hx-gl2 6.1s 3s infinite steps(1)}
@keyframes hx-gl{0%,86%,100%{opacity:0;transform:translate(0,0)}87%{opacity:1;transform:translate(.06em,0)}89%{opacity:1;transform:translate(-.05em,0)}91%{opacity:1;transform:translate(.09em,0)}93%{opacity:0}}
@keyframes hx-gl2{0%,87%,100%{opacity:0}88%{opacity:1;transform:translate(-.07em,0)}90%{opacity:1;transform:translate(.04em,0)}92%{opacity:0}}
.hx-giant:hover::before,.hx-giant:hover::after{animation-duration:.6s;animation-delay:0s}
.hx-meta{position:absolute;z-index:2;font-family:ui-monospace,Menlo,monospace;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(0,0,0,.6);display:none}
.hx-meta span,.hx-meta b{color:var(--highlight)}
.hx-m3 i{display:inline-block;width:1.6rem;height:1px;background:var(--highlight);vertical-align:middle;margin-right:.5rem;animation:hx-sc 2s ease-in-out infinite;transform-origin:0 50%}
@keyframes hx-sc{0%,100%{transform:scaleX(.3)}50%{transform:scaleX(1)}}
@media(min-width:640px){.hx-meta{display:block}.hx-m1{left:1.5rem;top:5.5rem}.hx-m2{right:1.5rem;top:5.5rem}.hx-m3{left:1.5rem;bottom:1.5rem}.hx-m4{right:1.5rem;bottom:1.5rem}}
@media(prefers-reduced-motion:reduce){.hx-giant::before,.hx-giant::after,.hx-outline::after{display:none}.hx-tun{display:none}.hx-m3 i{animation:none}}
/* blur-in text + image-forward */
.hp-live .hp-w{filter:blur(4px)}.hp-live .hp-w.on{filter:none}
.hp-live .rl-t{filter:blur(calc((1 - var(--rp))*5px + clamp(0, calc((var(--p) - .62)*10), 1)*3px))}
.hp-live .rl-core{transform:scale(calc(.9 + var(--p)*.14));z-index:3;box-shadow:0 0 0 1px rgba(7,63,137,.12),0 40px 120px -20px rgba(255,255,253,.9),0 0 90px -30px var(--highlight)}
.hp-live .about-x{}

@media(min-width:640px){.hx-outline{font-size:min(9vw,13vh)}.hx-giant{font-size:min(12vw,17vh)}.hx-mid{font-size:min(5vw,7.5vh)}.hx-first{font-size:min(3.4vw,5vh)}.hx-jobs{font-size:min(4vw,6vh)}.hx-apply{font-size:min(3.2vw,5vh)}}
.hx-under{height:.035em;background:var(--highlight)}

/* about connect */
.ab-line{gap:0 .28em;margin-bottom:.2em;line-height:.95}
.ab-t{letter-spacing:-.01em}
.hp-live .hp-w.ab-y,.ab-y{color:var(--highlight)}
.hp-live .hp-w.ab-y:not(.on){color:rgba(7,63,137,.35)}
.ab-card{-webkit-mask-image:linear-gradient(90deg,transparent 0,#fffffd 32%);mask-image:linear-gradient(90deg,transparent 0,#fffffd 32%);border-color:transparent}
.ab-t{text-shadow:0 2px 24px rgba(255,255,253,.85)}
.ab-arrow{position:absolute;left:62%;bottom:-.5rem;width:11rem;height:3rem;z-index:11;overflow:visible;fill:none;stroke:var(--highlight);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.ab-arrow path{stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--p)*2.2);}
.hp-pnote{position:relative;z-index:11}
@media(prefers-reduced-motion:reduce){.ab-arrow path{stroke-dashoffset:0}}

/* v4e: motion */
.wy-badge{width:5.5rem;height:5.5rem;color:var(--highlight)}
.wy-badge svg{position:absolute;inset:0;width:100%;height:100%}
.wy-b1{animation:hp-spin 9s linear infinite}
.wy-b2{animation:hp-spin 6s linear infinite reverse}
.wy-core{position:absolute;left:50%;top:50%;width:.9rem;height:.9rem;margin:-.45rem;border-radius:99px;background:var(--highlight);animation:wy-pulse 1.6s ease-in-out infinite}
@keyframes wy-pulse{0%,100%{transform:scale(.7);box-shadow:0 0 0 0 rgba(7,63,137,.5)}50%{transform:scale(1.15);box-shadow:0 0 0 .9rem rgba(7,63,137,0)}}
@media(min-width:640px){.wy-badge{width:8.5rem;height:8.5rem}}
.hp-grid2.hp-strip-a{animation-duration:26s}
.rl-say{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .3em;line-height:.95;transform:none}
.rl-fs{font-size:3rem;background:linear-gradient(100deg,var(--highlight) 0 40%,#fff6bf 50%,var(--highlight) 60% 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:rl-shim 3.2s linear infinite;display:inline-block;transform:rotate(-2deg)}
.rl-aj{font-family:Georgia,serif;font-style:italic;font-size:1.5rem;color:rgba(0,0,0,.65)}
@media(min-width:640px){.rl-fs{font-size:7rem}.rl-aj{font-size:3rem}}
@keyframes rl-shim{from{background-position:120% 0}to{background-position:-120% 0}}
.hp-live .rl-t{--fly:calc(1 - var(--rp) + clamp(0, calc((var(--p) - .68)*3.4), 1));transform:translate(calc(var(--dx)*var(--fly)*6vw),calc(var(--dy)*var(--fly)*9vh)) rotate(calc(var(--dx)*var(--fly)*9deg)) scale(calc(.7 + var(--rp)*.3));animation:rl-float 5s ease-in-out infinite;animation-delay:calc(var(--k)*-.45s)}
@keyframes rl-float{0%,100%{translate:0 0}50%{translate:0 -.35rem}}
@media(prefers-reduced-motion:reduce){.rl-fs,.wy-b1,.wy-b2,.wy-core{animation:none}.hp-live .rl-t{animation:none;translate:none}}

/* v4f: about full-bleed rows + why motion */
.ab2s{min-height:100vh;display:flex;flex-direction:column;justify-content:center}
.ab2-rows{display:flex;flex-direction:column;gap:.2rem}
.ab2-row{white-space:nowrap;line-height:.92;will-change:transform}
.ab2-in{display:inline-flex;align-items:baseline;gap:.25em;font-size:clamp(2.6rem,11.5vw,12rem)}
.ab2-rl{transform:translateX(calc(var(--p)*-26vw + 8vw))}
.ab2-rr{transform:translateX(calc(var(--p)*26vw - 26vw))}
.ab2-w{display:inline-block;color:#073f89}
.ab2-xs{font-size:.34em;font-family:ui-monospace,Menlo,monospace;letter-spacing:.2em;color:rgba(0,0,0,.6);font-weight:500}
.ab2-s{font-size:.5em;font-family:Georgia,serif;font-style:italic;text-transform:none;color:rgba(0,0,0,.85);font-weight:400}
.ab2-m{font-size:.7em}
.y-why{overflow-x:clip}
.ab2-xl{font-size:1em}
.ab2-o{color:transparent;-webkit-text-stroke:2px #073f89}
.ab2-y{color:var(--highlight)}
.ab2-w.hp-mark{background:none}
.ab2-row:nth-child(2) .ab2-w:first-child{color:var(--highlight)}
.ab2-row::after{content:"";display:block;height:0}
.y-why .tx-why{transform:translateX(calc((var(--p) - .5)*var(--dir,1)*14vw))}
.y-why .tx-why:nth-child(odd){--dir:-1}
.y-why .tx-why:hover{transform:translateX(calc((var(--p) - .5)*var(--dir,1)*14vw + 1rem))}
.y-why .tx-big{background:linear-gradient(100deg,currentColor 0 45%,var(--highlight) 50%,currentColor 55% 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:y-sw 5s linear infinite;animation-delay:calc(var(--k,0)*-1.4s)}
.y-why .tx-out{-webkit-text-fill-color:transparent;background:none;-webkit-text-stroke:2px #073f89;animation:none}
.y-why .tx-yel{background:linear-gradient(100deg,var(--highlight) 0 45%,#073f89 50%,var(--highlight) 55% 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
@keyframes y-sw{from{background-position:120% 0}to{background-position:-120% 0}}
.y-why .tx-n{display:inline-block;animation:hp-spin 8s linear infinite}
@media(prefers-reduced-motion:reduce){.y-why .tx-big,.y-why .tx-n{animation:none}}

/* v4f mobile */
.hp-bar{background:#fffffd;visibility:hidden}
.hp-bar.show{visibility:visible}
html,body{background:#fffffd}
@media(max-width:639px){.hx-stop,.hp-hero .hp-btn:not(.bg-highlight){display:none}.hx-tiny{font-size:.62rem;letter-spacing:.2em}.hx-hand.hx-first{font-size:1.4rem}.hp-hero-body .hp-rise a[href="/resume-builder"]{display:none}}

/* v5d */
.hx-giant i,.hx-outline i{translate:calc(var(--mx)*(var(--d) - 5)*3px) calc(var(--my)*(var(--d) - 5)*2px);transition:translate .25s ease-out}
.rl-fs{background:none;-webkit-text-fill-color:var(--highlight);color:var(--highlight);animation:none;transform:rotate(-2deg)}
.rl-fs i{display:inline-block;font-style:normal;animation:rl-wave 2.2s ease-in-out infinite;animation-delay:calc(var(--c)*-.14s)}
@keyframes rl-wave{0%,100%{transform:translateY(0) rotate(0);color:var(--highlight)}35%{transform:translateY(-.16em) rotate(-5deg);color:#073f89}70%{transform:translateY(.05em) rotate(3deg)}}
.rl-aj{animation:rl-aj 3s ease-in-out infinite}
@keyframes rl-aj{0%,100%{opacity:.5;transform:translateX(0)}50%{opacity:1;transform:translateX(.35em)}}
.rl-grid{align-items:center}
.rl-t:nth-child(3n+1){aspect-ratio:4/5}
.rl-t:nth-child(3n+2){aspect-ratio:1/1;margin-top:.8rem}
.rl-t:nth-child(3n){aspect-ratio:5/4;margin-top:-.4rem}
.hp-live .rl-t{clip-path:inset(calc((1 - var(--rp))*46%) round .5rem);transform:translate(calc(var(--dx)*var(--fly)*8vw),calc(var(--dy)*var(--fly)*12vh)) rotate(calc(var(--dx)*var(--fly)*12deg)) scale(calc(.5 + var(--rp)*.5))}
.gap-mq{overflow:hidden;white-space:nowrap;padding:1.2rem 0;user-select:none}
.gap-mq-in{display:inline-flex;gap:1.5rem;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;font-size:clamp(3.2rem,12vw,9rem);line-height:1;color:transparent;-webkit-text-stroke:1.5px rgba(0,0,0,.55);animation:gap-l 28s linear infinite}
.gap-mq-in b{color:var(--highlight);-webkit-text-stroke:0;font-weight:800;padding:0 .2em}
.gap-b .gap-mq-in{animation-name:gap-r;-webkit-text-stroke-color:rgba(7,63,137,.7)}
.gap-b .gap-mq-in b{color:#073f89}
@keyframes gap-l{to{transform:translateX(-50%)}}
@keyframes gap-r{from{transform:translateX(-50%)}to{transform:none}}
.tx-ex .tx-exname{-webkit-text-stroke:0;color:rgba(0,0,0,.5);font-size:1.1rem;font-family:ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.14em;font-weight:500;transition:color .3s}
.tx-ex .tx-for{font-size:2.4rem;line-height:1;color:var(--highlight)}
@media(min-width:640px){.tx-ex .tx-for{font-size:5.2rem;min-width:0;flex:1.4}.tx-ex .tx-exname{font-size:1rem;flex:1}}
.tx-ex:hover .tx-exname{color:#073f89}.tx-ex:hover .tx-for{transform:translateX(.5rem) rotate(-1.5deg)}
.tx-ex .tx-for{transition:transform .35s cubic-bezier(.2,.7,.2,1)}
@media(prefers-reduced-motion:reduce){.rl-fs i,.rl-aj,.gap-mq-in{animation:none}}
.rl-grid>.rl-core{align-self:stretch;min-height:16rem}

/* v6c */
@font-face{font-family:"HPBric";src:url("/m/bric.ttf") format("truetype");font-weight:800;font-display:swap}
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-weight:400;font-display:swap}
.hx{display:grid;grid-template-columns:auto auto auto;justify-content:center;align-items:baseline;column-gap:.35em}
.hx-l1,.hx-l2{display:contents}
.hx-l3{grid-column:1/-1;display:flex;justify-content:center}
.hx-l1 .hx-first{grid-column:1;justify-self:end;rotate:-3deg}
.hx-l1 .hx-outline{grid-column:2;justify-self:start}
.hx-l1 .hx-jobs{grid-column:3;justify-self:start;rotate:-2deg}
.hx-pre{grid-column:1;grid-row:2;justify-self:end;display:inline-flex;align-items:baseline;gap:.35em}
.hx-l2 .hx-giant{grid-column:2;grid-row:2;justify-self:start}
.hx-l1 .hx-first,.hx-l1 .hx-outline,.hx-l1 .hx-jobs{grid-row:1}
.hx-giant,.hx-outline{font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;letter-spacing:-.025em}
@media(max-width:639px){.hx-giant{font-size:min(16vw,4.2rem)!important;white-space:nowrap}}
.hx-outline::before,.hx-outline::after{display:none}
@media(min-width:640px){.hx-m1{left:2rem;top:4.3rem}.hx-m2{right:2rem;top:4.3rem}.hx-m3{left:2rem;bottom:2.8rem}.hx-m4{right:2rem;bottom:2.8rem}}
/* four tools */
.hp-row{--rx:50%;--ry:50%}
.hp-row::before{content:"";position:absolute;inset:0;background:radial-gradient(20rem circle at var(--rx) var(--ry),rgba(7,63,137,.16),transparent 62%);opacity:0;transition:opacity .35s;pointer-events:none}
.hp-row:hover::before{opacity:1}
.hp-rowimg{opacity:.12;transform:translateX(calc(var(--rx)*.05 - 18px)) scale(1.05);transition:opacity .5s,transform .25s ease-out}
.hp-row:hover .hp-rowimg{opacity:.55;transform:translateX(calc(var(--rx)*.05 - 18px)) scale(1.05)}
.hp-row .font-display{transition:transform .45s cubic-bezier(.2,.7,.2,1),color .3s,letter-spacing .45s}
.hp-row:hover .font-display{transform:translateX(1.2rem) skewX(-7deg);letter-spacing:.03em}
.hp-row>span:first-child{transition:transform .4s}
.hp-row:hover>span:nth-child(2){transform:scale(1.5) rotate(-8deg);display:inline-block}
/* examples */
.tx-ex{position:relative;overflow:hidden;--rx:50%;--ry:50%}
.tx-ex::before{content:"";position:absolute;inset:0;background:radial-gradient(22rem circle at var(--rx) var(--ry),rgba(7,63,137,.13),transparent 62%);opacity:0;transition:opacity .35s;pointer-events:none}
.tx-ex:hover::before{opacity:1}
.tx-ex .tx-for{font-family:"HPInst",Georgia,serif;font-style:italic;font-weight:400;transform:none;color:#073f89;font-size:2.2rem;line-height:1;display:inline-block;min-width:0;flex:1 1 100%}
.tx-tf{color:#073f89;font-family:"HPInst",Georgia,serif;font-style:italic;font-size:1em;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.tx-role{position:relative;display:inline-block;font-family:"HPBric",var(--font-display,inherit),sans-serif;font-style:normal;font-weight:800;color:var(--highlight);font-size:.9em;letter-spacing:-.02em}
.tx-role::after{content:attr(data-t);position:absolute;left:0;top:0;color:#073f89;clip-path:inset(0 100% 0 0);transition:clip-path .6s cubic-bezier(.7,0,.2,1);white-space:nowrap}
.tx-ex:hover .tx-role::after{clip-path:inset(0 0 0 0)}
.tx-ex:hover .tx-tf{transform:translateX(.4em);color:var(--highlight)}
@media(min-width:640px){.tx-ex .tx-for{font-size:4.2rem;flex:1.6}}
/* showreel */
.rl-say{align-items:flex-end;gap:0 .4em;transform:none}
.rl-n{font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;font-size:8.5rem;line-height:.8;color:var(--highlight);letter-spacing:-.05em;display:inline-block;font-variant-numeric:tabular-nums;transform-origin:0 100%;transition:transform .6s cubic-bezier(.2,.9,.2,1.4)}
.rl-n.done{transform:scale(1.04) rotate(-3deg)}
.rl-sec{font-family:"HPInst",Georgia,serif;font-style:italic;font-size:3.2rem;line-height:1;color:#073f89;position:relative;padding-bottom:.1em}
.rl-sec::after{content:"";position:absolute;left:0;right:0;bottom:-.02em;height:2px;background:var(--highlight);transform-origin:0 50%;animation:rl-ul 3.6s cubic-bezier(.7,0,.2,1) infinite}
@keyframes rl-ul{0%{transform:scaleX(0)}45%,70%{transform:scaleX(1);transform-origin:0 50%}71%{transform-origin:100% 50%}100%{transform:scaleX(0);transform-origin:100% 50%}}
.rl-aj{font-family:"HPInst",Georgia,serif;font-style:italic;animation:none;color:rgba(0,0,0,.6);font-size:1.8rem}
@media(min-width:640px){.rl-n{font-size:20rem}.rl-sec{font-size:7rem}.rl-aj{font-size:3.4rem}}
.rl-grid{--gmx:0;--gmy:0;--rs:0}
.rl-t{position:relative;animation:none!important;rotate:none;top:0;translate:calc(var(--rs)*var(--rd,1)*11vw) 0;transition:translate .5s cubic-bezier(.2,.7,.2,1)}

.rl-head{gap:.9rem;margin-bottom:1.4rem}.rl-say{padding-bottom:.25em;line-height:1;position:relative;z-index:2}.rl-n{padding-top:.08em;margin-bottom:-.1em}.rl-aj{white-space:nowrap;position:relative;top:0;margin-bottom:.35em}
@keyframes rl-fl-old{0%,100%{translate:0 0}50%{translate:calc(var(--gmx)*var(--z)*8px) -9px}}
@media(prefers-reduced-motion:reduce){.rl-t{animation:none}}
.hx-outline{color:#073f89;-webkit-text-stroke:0}
.hp-sub{display:none}
.sae-btn{transition:transform .25s ease,box-shadow .25s ease}.sae-btn:hover{transform:translateY(-3px);box-shadow:0 14px 40px -10px rgba(245,205,0,.55)}.sae-dot{width:8px;height:8px;border-radius:9999px;background:#fffffd;position:relative;z-index:10;animation:saePulse 1.8s ease-in-out infinite}.sae-arrow{animation:saeNudge 1.6s ease-in-out infinite}.sae-btn:hover .sae-arrow{animation-duration:.7s}.sae-shine{position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(0,0,0,.55),transparent);transform:skewX(-20deg);animation:saeShine 3.6s ease-in-out infinite}@keyframes saePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}@keyframes saeNudge{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}@keyframes saeShine{0%,55%{left:-60%}100%{left:130%}}@media(prefers-reduced-motion:reduce){.sae-dot,.sae-arrow,.sae-shine{animation:none}}
.rl-n.rl-w{font-size:5.5rem;letter-spacing:-.04em;line-height:.85}@media(min-width:640px){.rl-n.rl-w{font-size:13rem}.rl-sec{font-size:5.5rem}.rl-aj{font-size:3rem}}
@media(min-width:640px){.hp-sub{display:block;margin-top:.55rem;text-align:center;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(71,85,105,.9);white-space:nowrap}.hp-hero-body div.hp-rise.flex{align-items:flex-start}}
@media(max-width:639px){.hp-note{display:none!important}}
.hp-note{position:absolute;left:50%;bottom:-.2rem;transform:translateX(250px) rotate(-3deg);pointer-events:none;z-index:3;display:flex;flex-direction:column;align-items:flex-start;color:rgba(0,0,0,.8)}
.hp-note svg{margin:.1rem 0 0 1.6rem}
.hp-note em{font-family:"HPHand","Caveat Brush",cursive;font-style:normal;font-size:1.25rem;line-height:1;white-space:nowrap;color:rgba(0,0,0,.8);text-shadow:0 1px 8px rgba(255,255,253,.6)}
@media(max-width:639px){
.hp-hero .hp-btn:not(.bg-highlight){display:inline-flex!important}
.hp-hero-body .hp-rise a[href="/resume-builder"]{display:inline-flex!important}
.hp-hero-body div.hp-rise.flex .hp-mag{display:flex;flex-direction:column;align-items:stretch;text-align:center}
.hp-hero-body div.hp-rise.flex .hp-btn{width:100%;justify-content:center}
.hp-sub{display:block;margin-top:.35rem;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.65)}
.hp-hero-body .hp-rolebox{margin-top:.5rem}
.hp-hero-body div.hp-rise.flex{margin-top:1rem;flex-direction:row!important;flex-wrap:nowrap!important;gap:.6rem!important;align-items:flex-start}
.hp-hero-body div.hp-rise.flex .hp-mag{flex:1 1 0;min-width:0}
.hp-hero-body div.hp-rise.flex .hp-btn{height:2.6rem;padding-left:.5rem!important;padding-right:.5rem!important;font-size:.82rem;white-space:nowrap}
.hp-sub{font-size:.44rem;letter-spacing:.06em;margin-top:.3rem;text-align:center;white-space:nowrap;max-width:100%;overflow:hidden}
}
.hx-bgR{position:absolute;z-index:-5;right:-3vw;bottom:-14vh;font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;font-size:92vh;line-height:.8;letter-spacing:-.06em;color:rgba(7,63,137,.13);-webkit-text-stroke:2px rgba(7,63,137,.22);pointer-events:none;user-select:none;transform:translate(calc(var(--mx)*-18px),calc(var(--my)*-12px));transition:transform .3s ease-out;mix-blend-mode:multiply}
.hx-giant{text-transform:lowercase}
.hx-first{font-size:1.9rem}
@media(max-width:639px){.hx-giant{font-size:min(16vw,4.2rem);white-space:nowrap}}
.hx-fj{grid-column:2;grid-row:1;justify-self:start;display:inline-flex;align-items:baseline;gap:.35em}
.hx-l1 .hx-outline,.hx-l1 .hx-jobs{grid-column:auto;grid-row:auto}
.hx{row-gap:.14em}
/* mobile fixes */
html,body{overflow-x:clip}
@media(max-width:639px){
.gap-mq{display:none}
.ab2s{min-height:0;padding-top:2.5rem;padding-bottom:2.5rem;justify-content:flex-start}
.ab2-row{white-space:normal;padding:0 1.6rem}.ab2-rl{transform:translateX(calc((var(--p) - .5)*-9vw))!important}.ab2-rr{transform:translateX(calc((var(--p) - .5)*9vw))!important}
.ab2-in{flex-wrap:wrap;font-size:clamp(2rem,9.5vw,3rem)}
.rl-n{font-size:7rem}
.hx-l1 .hx-outline{font-size:3.6rem}
}
@media(min-width:640px){
header .site-container{max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important;padding-left:1rem!important;padding-right:1rem!important}
@media(min-width:768px){header .site-container{padding-left:clamp(1.5rem,4.4vw,3.5rem)!important;padding-right:clamp(1.5rem,4.4vw,3.5rem)!important}}
.hx-m1,.hx-m3{left:1rem}.hx-m2,.hx-m4{right:1rem}
.hx-m1,.hx-m2{top:5rem;line-height:1}
.hx-m1,.hx-m2{display:none!important}
.hx-mid{font-family:"HPInst",Georgia,serif!important;font-style:italic;font-weight:400}
}
@media(max-width:639px){#about,.y-why{display:none!important}}
.jf-grid{display:grid;gap:2.2rem}
.jf-chip{display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:#fffffd;background:var(--highlight);padding:.35rem .7rem;border-radius:999px;font-weight:700}
.jf-h{margin-top:1.1rem;font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;text-transform:uppercase;line-height:.92;letter-spacing:-.03em;font-size:clamp(2.1rem,10.5vw,3.2rem);color:#073f89}
.jf-a{display:block}.jf-b{display:block;color:var(--highlight);font-family:"HPInst",Georgia,serif;font-style:italic;font-weight:400;text-transform:none;letter-spacing:-.01em;font-size:1.2em;margin-top:.1em}
.jf-p{margin-top:1.3rem;max-width:34rem;font-size:.95rem;line-height:1.55;color:rgba(0,0,0,.72)}
.jf-cta{margin-top:1.6rem;display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}
.jf-btn{display:inline-flex;align-items:center;gap:.5rem;border-radius:999px;padding:.7rem 1.2rem;font-size:.9rem;font-weight:600;transition:transform .25s,background .25s}
.jf-btn:hover{transform:translateY(-2px)}
.jf-btn-y{background:var(--highlight);color:#fffffd}
.jf-btn-o{border:1.5px solid var(--highlight);color:#073f89}.jf-btn-o:hover{background:rgba(7,63,137,.12)}
.jf-note{margin-top:.9rem;font-size:.78rem;color:rgba(0,0,0,.5)}
.jf-r{list-style:none;margin:0;padding:0;display:grid;gap:1.6rem;align-content:center}
.jf-it{display:grid;grid-template-columns:3.2rem 1fr;column-gap:.8rem;row-gap:.25rem;align-items:baseline;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.jf-it:hover{transform:translateX(10px)}
.jf-n{grid-row:1/3;font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;font-size:2.4rem;line-height:.9;color:var(--highlight);letter-spacing:-.05em;transition:transform .35s}
.jf-it:hover .jf-n{transform:scale(1.15) rotate(-4deg)}
.jf-t{font-family:"HPBric",var(--font-display,inherit),sans-serif;font-weight:800;font-size:1.15rem;color:#073f89;letter-spacing:-.01em}
.jf-d{font-size:.88rem;line-height:1.5;color:rgba(0,0,0,.62)}
@media(min-width:900px){.jf-grid{grid-template-columns:1.1fr 1fr;gap:5rem;align-items:center}.jf-h{font-size:clamp(3rem,5.2vw,5rem)}.jf-p{font-size:1.05rem}.jf-n{font-size:3.6rem}.jf-it{grid-template-columns:5rem 1fr}.jf-t{font-size:1.4rem}.jf-d{font-size:.95rem}}
@font-face{font-family:"HPSyne";src:url("/m/syne2.ttf") format("truetype");font-weight:400 800;font-display:swap}
.hx-giant,.hx-outline{font-family:"HPSyne","HPBric",sans-serif!important;font-weight:800!important;letter-spacing:-.04em!important}
@media(min-width:640px){.hx-giant{font-size:min(9.6vw,14.5vh)!important}.hx-outline{font-size:min(7.4vw,11.5vh)!important}}
.hx-word,.hx-giant,.hx-outline{white-space:nowrap!important;overflow-wrap:normal!important;word-break:keep-all!important}.hx-l2 .hx-pre{white-space:nowrap}
@media(max-width:639px){
.hx{display:flex!important;flex-direction:column;align-items:flex-start;padding:0 1.6rem;text-align:left;row-gap:.3rem;transform:none!important}
.hx-line{display:flex!important;flex-direction:column;align-items:flex-start;gap:.15rem;width:100%}
.hx-fj{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap}
.hx-pre{display:inline-flex;align-items:baseline;gap:.4em}
.hx-l1 .hx-first{font-size:1.5rem}
.hx-l1 .hx-outline{font-size:min(17vw,4.2rem)!important}
.hx-l1 .hx-jobs{font-size:1.6rem}
.hx-giant{font-size:min(13.5vw,3.5rem)!important;white-space:nowrap}
.hx-l3{flex-direction:row!important;align-items:baseline;gap:.6rem}
.hx-track{display:none}.hx-l2{margin-top:1rem}.hx-l3{margin-top:.6rem}
.hx-mid{font-size:1.8rem}
}
.hp-live .jf-a{transform:translateX(calc((var(--p) - .5)*-10vw))}
.hp-live .jf-b{transform:translateX(calc((var(--p) - .5)*10vw))}
.hp-live .jf-it{--q:clamp(0,calc(var(--p)*3.4 - .6 - var(--k)*.28),1);opacity:calc(.15 + var(--q)*.85);translate:calc((1 - var(--q))*14vw) 0;filter:blur(calc((1 - var(--q))*4px))}
.hp-live .jf-n{display:inline-block;transform:rotate(calc((1 - var(--q))*-14deg))}
.hp-live .jf-chip{animation:jf-pulse 2.8s ease-in-out infinite}
@keyframes jf-pulse{0%,100%{box-shadow:0 0 0 0 rgba(7,63,137,.0)}50%{box-shadow:0 0 0 .5rem rgba(7,63,137,.16)}}
.jf-btn-y::after{content:"";position:absolute}
@media(prefers-reduced-motion:reduce){.hp-live .jf-a,.hp-live .jf-b{transform:none}.hp-live .jf-it{translate:none;opacity:1;filter:none}.hp-live .jf-chip{animation:none}}
`;


