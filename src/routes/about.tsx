import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GotaOfferr — Why We Built a Resume Rewriter" },
      {
        name: "description",
        content:
          "GotaOfferr was built for job seekers tired of manually rewriting the same resume for every company they apply to.",
      },
      { property: "og:title", content: "About GotaOfferr — Why We Built a Resume Rewriter" },
      {
        property: "og:description",
        content:
          "GotaOfferr was built for job seekers tired of manually rewriting the same resume for every company they apply to.",
      },
      { property: "og:url", content: "https://gotaofferr.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/about" }],
  }),
  component: About,
});


const AB_CSS = `
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
.abp{--y:oklch(0.86 0.19 96);--cream:oklch(0.86 0.19 96);background:#fffffd;color:var(--cream);padding-bottom:70px}
.abp *{box-sizing:border-box}
.abp .site-container-x{max-width:1180px;margin:0 auto}
.ab-hero{position:relative;padding:48px 20px 34px;text-align:center;background:radial-gradient(55% 60% at 50% 0%,rgba(7,63,137,.16),transparent 72%)}
.ab-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(7,63,137,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(7,63,137,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(#fffffd 20%,transparent);mask-image:linear-gradient(#fffffd 20%,transparent)}
.ab-hero>*{position:relative}
.ab-mono{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.ab-sticker{display:inline-block;margin-bottom:14px;background:var(--y);color:#fffffd;font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:999px;transform:rotate(-2deg);box-shadow:3px 3px 0 oklch(0.86 0.19 96),0 0 0 2px var(--y);transition:transform .25s}
.ab-sticker:hover{animation:ab-wig .55s}
@keyframes ab-wig{25%{transform:rotate(-8deg) scale(1.08)}60%{transform:rotate(6deg) scale(1.08)}100%{transform:rotate(-2deg)}}
.ab-h1{margin:16px auto 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.3rem,7.4vw,4.8rem);max-width:15em}
.ab-h1 span{display:block}
.ab-h1 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.ab-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);font-weight:400;font-size:1.06em;line-height:.9;display:inline-block;transition:transform .3s}
.ab-h1:hover .ab-cur{transform:rotate(-2deg) scale(1.05)}
.ab-sub{max-width:36rem;margin:18px auto 0;font-size:1.05rem;line-height:1.55;color:rgba(0,0,0,.72);text-wrap:balance}
.ab-rise{opacity:0;transform:translateY(.6em);animation:ab-rise .6s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes ab-rise{to{opacity:1;transform:none}}
.ab-mq{border-block:1px solid rgba(7,63,137,.15);background:var(--y);color:#fffffd;overflow:hidden;white-space:nowrap;transform:rotate(-1deg);margin:0 -2%}
.ab-mq-in{display:inline-flex;animation:ab-mq 28s linear infinite}
.ab-mq-in span{font-family:var(--font-display,inherit);font-weight:800;font-size:1.25rem;padding:13px 0;letter-spacing:.02em}
.ab-mq-in b{margin:0 .7em}
@keyframes ab-mq{to{transform:translateX(-50%)}}
.ab-js .ab-rv{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
.ab-js .ab-rv.ab-in{opacity:1;transform:none}
.ab-sec{padding:76px 0 8px}
.ab-mq+.ab-sec,.ab-sec:first-of-type{padding-top:84px}
.ab-eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;color:var(--y);letter-spacing:.04em}
.ab-h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:-.01em;font-size:clamp(1.9rem,4.4vw,3.2rem);margin:10px 0 0}
.ab-h2 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.ab-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:56px}
.ab-stat{border:1px solid rgba(7,63,137,.2);border-radius:22px;padding:26px 22px;background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));transition:transform .25s,border-color .25s}
.ab-stat:hover{transform:translateY(-5px);border-color:rgba(7,63,137,.7)}
.ab-stat b{display:block;font-family:var(--font-display,inherit);font-size:clamp(2.6rem,4.6vw,4rem);line-height:1;color:var(--y)}
.ab-stat span{display:block;margin-top:8px;color:rgba(0,0,0,.72);font-size:.95rem;line-height:1.4}
.ab-story{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:34px;margin-top:34px;align-items:stretch}
.ab-tabs{display:flex;flex-direction:column;gap:10px}
.ab-tab{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:14px;align-items:center;padding:16px 18px;border:1px solid rgba(7,63,137,.12);border-radius:18px;color:rgba(0,0,0,.7);transition:all .25s}
.ab-tab i{font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:.8rem;color:var(--y)}
.ab-tab:hover{border-color:rgba(7,63,137,.5);transform:translateX(4px)}
.ab-tab:focus-visible{outline:2px solid var(--y);outline-offset:2px}
.ab-tab[aria-selected=true]{background:var(--y);color:#fffffd;border-color:var(--y);font-weight:700}
.ab-tab[aria-selected=true] i{color:#fffffd}
.ab-stage{position:relative;border:1px solid rgba(7,63,137,.3);border-radius:26px;padding:42px 40px;background:linear-gradient(160deg,rgba(7,63,137,.1),rgba(7,63,137,.015));overflow:hidden;min-height:300px}
.ab-big{position:absolute;right:22px;top:-18px;font-family:var(--font-display,inherit);font-weight:800;font-size:11rem;line-height:1;color:rgba(7,63,137,.1);pointer-events:none}
.ab-stage h3{position:relative;font-family:var(--font-display,inherit);text-transform:uppercase;font-size:clamp(1.6rem,3vw,2.4rem);line-height:1.05;margin:0}
.ab-stage h3 em{font-family:"HPInst",Georgia,serif;text-transform:none;color:var(--y);font-weight:400}
.ab-stage p{position:relative;margin:18px 0 0;font-size:1.12rem;line-height:1.7;color:rgba(0,0,0,.82);max-width:44rem}
.ab-swap{animation:ab-swap .45s cubic-bezier(.2,.8,.2,1)}
@keyframes ab-swap{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.ab-bar{position:absolute;left:0;bottom:0;height:4px;background:var(--y);width:0;transition:width .4s}
.ab-calc{margin-top:34px;border:1px solid rgba(7,63,137,.3);border-radius:26px;padding:34px 38px;background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015))}
.ab-calc-top{display:flex;flex-wrap:wrap;gap:18px 40px;align-items:center;justify-content:space-between}
.ab-calc label{font-size:1.05rem}
.ab-calc output{font-family:var(--font-display,inherit);font-size:2rem;color:var(--y);margin-left:8px}
.ab-range{-webkit-appearance:none;appearance:none;width:min(520px,100%);height:8px;border-radius:99px;background:rgba(7,63,137,.14);outline:none}
.ab-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:var(--y);border:3px solid oklch(0.86 0.19 96);box-shadow:0 0 0 2px var(--y);cursor:grab}
.ab-range::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:var(--y);border:3px solid oklch(0.86 0.19 96);box-shadow:0 0 0 2px var(--y);cursor:grab}
.ab-race{margin-top:26px;display:grid;gap:14px}
.ab-row{display:grid;grid-template-columns:150px minmax(0,1fr) 150px;gap:16px;align-items:center;font-size:.95rem}
.ab-track{height:30px;border-radius:99px;background:rgba(7,63,137,.07);overflow:hidden}
.ab-fill{height:100%;border-radius:99px;transition:width .5s cubic-bezier(.2,.8,.2,1)}
.ab-row b{font-family:var(--font-display,inherit);font-size:1.2rem;text-align:right}
.ab-note{margin:18px 0 0;font-size:.82rem;color:rgba(0,0,0,.5)}
.ab-coco{display:grid;grid-template-columns:auto minmax(0,1fr);gap:34px;align-items:center;margin-top:34px;border:1px dashed rgba(7,63,137,.45);border-radius:26px;padding:34px 38px}
.ab-cat{all:unset;cursor:pointer;width:150px;height:150px;border-radius:50%;background:var(--y);display:grid;place-items:center;font-size:76px;box-shadow:0 0 0 6px oklch(0.86 0.19 96),0 0 0 8px var(--y);transition:transform .25s}
.ab-cat:hover{transform:rotate(-6deg) scale(1.06)}
.ab-cat:focus-visible{outline:3px solid oklch(0.86 0.19 96);outline-offset:6px}
.ab-cat.ab-pop{animation:ab-pop .45s}
@keyframes ab-pop{30%{transform:scale(1.18) rotate(8deg)}100%{transform:none}}
.ab-say{font-family:var(--font-display,inherit);text-transform:uppercase;font-size:clamp(1.4rem,3vw,2.3rem);line-height:1.1;min-height:2.3em}
.ab-say em{font-family:"HPInst",Georgia,serif;text-transform:none;color:var(--y);font-weight:400}
.ab-hint{margin-top:10px;font-size:.85rem;color:rgba(0,0,0,.55)}
.ab-gets{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:34px}
.ab-card{position:relative;display:flex;flex-direction:column;border:1px solid rgba(7,63,137,.2);border-radius:24px;padding:26px 24px;background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));transition:transform .25s,border-color .25s,box-shadow .25s;text-decoration:none;color:inherit}
.ab-card:hover{transform:translateY(-6px) rotate(-.6deg);border-color:rgba(7,63,137,.8);box-shadow:0 18px 44px -22px rgba(7,63,137,.5)}
.ab-card .n{font-family:var(--font-display,inherit);font-size:2.4rem;color:var(--y);line-height:1}
.ab-card h3{margin:14px 0 0;font-family:var(--font-display,inherit);text-transform:uppercase;font-size:1.25rem;line-height:1.1}
.ab-card p{margin:12px 0 0;color:rgba(0,0,0,.75);line-height:1.6;font-size:.96rem;flex:1}
.ab-card .go{margin-top:18px;color:var(--y);font-weight:700;font-size:.9rem}
.ab-card:hover .go{letter-spacing:.03em}
.ab-more{margin-top:34px;display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center}
.ab-chip{border:1px solid rgba(7,63,137,.4);color:var(--y);border-radius:999px;padding:7px 16px;font-size:.9rem;text-decoration:none;transition:all .2s}
.ab-chip:hover{background:var(--y);color:#fffffd;transform:translateY(-2px)}
.ab-end{margin-top:60px;border-top:1px solid rgba(7,63,137,.12);padding-top:28px;display:flex;flex-wrap:wrap;gap:22px;align-items:center;justify-content:space-between}
.ab-end p{max-width:46rem;margin:0;color:rgba(0,0,0,.6);font-size:.9rem;line-height:1.6}
.ab-cta{display:inline-block;background:var(--y);color:#fffffd;font-weight:800;border-radius:999px;padding:14px 28px;text-decoration:none;transition:transform .2s}
.ab-cta:hover{transform:translateY(-3px) rotate(-1deg)}
@media (min-width:900px){.ab-h1{max-width:1700px;font-size:clamp(2.2rem,4.1vw,4.6rem)}.ab-h1 span{display:inline}.ab-h1 span+span{margin-left:.25em}.ab-h1{white-space:nowrap}}
@media (min-width:1500px){.abp.site-container{max-width:1780px;width:min(1780px,calc(100% - 2rem));padding-left:40px;padding-right:40px}}
@media (max-width:1000px){.ab-stats,.ab-gets{grid-template-columns:repeat(2,minmax(0,1fr))}.ab-story{grid-template-columns:minmax(0,1fr)}.ab-tabs{flex-direction:row;overflow-x:auto;padding-bottom:4px}.ab-tab{flex:0 0 auto;padding:12px 16px}.ab-tab:hover{transform:none}}
@media (max-width:640px){.ab-hero,.ab-hero *{text-align:left}.ab-hero{padding:30px 14px 22px}.ab-h1{margin:16px 0 0;max-width:none}.ab-sub{margin:14px 0 0;font-size:.95rem}.ab-sec{padding-top:52px}.ab-stats,.ab-gets{grid-template-columns:minmax(0,1fr)}.ab-stage{padding:28px 22px;min-height:0}.ab-big{font-size:7rem}.ab-stage p{font-size:1rem}.ab-calc{padding:24px 20px}.ab-row{grid-template-columns:minmax(0,1fr) 90px;gap:6px 10px}.ab-row .lbl{grid-column:1/-1}.ab-coco{grid-template-columns:minmax(0,1fr);padding:26px 22px;gap:22px}.ab-cat{width:120px;height:120px;font-size:60px}.ab-mq-in span{font-size:1rem;padding:10px 0}.ab-end{flex-direction:column;align-items:flex-start}}
@media (prefers-reduced-motion:reduce){.ab-mq-in{animation:none}.ab-rise{animation:none;opacity:1;transform:none}.ab-js .ab-rv{opacity:1;transform:none;transition:none}.ab-swap,.ab-cat.ab-pop{animation:none}}
`;

const CHAPTERS = [
  {
    t: "The reply that never comes",
    e: "never comes",
    p: "Most people apply to dozens of roles with the same generic resume, then wonder why the replies never come. Recruiters and applicant tracking systems both look for a direct match between what the posting asks for and what your resume says, and a one-size-fits-all CV rarely provides it.",
  },
  {
    t: "The hour you don't have",
    e: "don't have",
    p: "Tailoring by hand works, but it's slow. Rewriting your summary, reordering skills, and reframing every bullet for one application can take an hour. Multiply that by twenty applications and most people simply give up and send the default version.",
  },
  {
    t: "One master resume",
    e: "resume",
    p: "GotaOfferr closes that gap. You keep one master resume. We rebuild it for each specific company and role, complete with a cover letter, a match score, and the keywords you're missing.",
  },
  {
    t: "Same truth, new angle",
    e: "new angle",
    p: "Same truth about your experience, framed for the job in front of you. We reword and reorder what is already yours. No fake skills, ever.",
  },
];

const COCO = [
  "Coco approves this resume.",
  "Tailored today. Nap tomorrow.",
  "Coco only trusts real skills.",
  "Apply first. Coffee after.",
  "One master resume. Zero tab chaos.",
  "You got this. Coco said so.",
];

const GETS = [
  {
    n: "01",
    h: "Tailored kit",
    p: "A tailored resume and cover letter for each job, with a match score, an ATS score, the keywords you are missing, and tips to close the gap.",
    to: "/tailor",
    c: "Tailor my resume",
  },
  {
    n: "02",
    h: "11 job markets",
    p: "Country-aware formatting for 11 job markets, so a resume for Dubai, Germany or the UK follows local conventions instead of one generic template.",
    to: "/guides/dubai-resume-format",
    c: "See a market guide",
  },
  {
    n: "03",
    h: "Job finder",
    p: "A job finder that searches major job boards for roles that fit your resume, ranks the searched city first, and lets you tailor your resume to a listing in one click.",
    to: "/jobs",
    c: "Find jobs",
  },
  {
    n: "04",
    h: "Free starters",
    p: "A free resume builder and ATS checker if you are starting from scratch.",
    to: "/resume-builder",
    c: "Build a resume",
  },
];

function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add("ab-js");
    const items = Array.from(el.querySelectorAll<HTMLElement>(".ab-rv"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("ab-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ab-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [root]);
}

function About() {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root);
  const [ch, setCh] = useState(0);
  const [swapKey, setSwapKey] = useState(0);
  const [apps, setApps] = useState(10);
  const [coco, setCoco] = useState(0);
  const [pop, setPop] = useState(false);
  const pick = (i: number) => {
    setCh(i);
    setSwapKey((k) => k + 1);
  };
  const cur = CHAPTERS[ch];
  const before = cur.t.slice(0, cur.t.length - cur.e.length);
  const mq = "ONE MASTER RESUME + TAILORED FOR EVERY JOB + NO FAKE SKILLS + APPLY FIRST, COFFEE AFTER + ";
  const mqParts = mq.split(" + ").filter(Boolean);
  const mqNode = (
    <>
      {mqParts.map((s, i) => (
        <span key={i} style={{ display: "contents" }}>
          {s}
          <b>+</b>
        </span>
      ))}
    </>
  );
  return (
    <main ref={root} className="abp site-container pb-14 pt-6 sm:pb-20">
      <style>{AB_CSS}</style>
      <section className="ab-hero">
        <span className="ab-sticker" aria-hidden>
          Built for job seekers, fuelled by coffee 🐾 (Coco approved)
        </span>
        <span className="ab-mono ab-rise" style={{ ["--d" as string]: "0s" }}>
          ( about terbey, the short story )
        </span>
        <h1 className="ab-h1" aria-label="About GotaOfferr. Built for people who hate waiting for replies.">
          <span className="ab-rise" style={{ ["--d" as string]: ".06s" }}>
            Built for people who hate <mark>waiting</mark>
          </span>
          <span className="ab-rise" style={{ ["--d" as string]: ".16s" }}>
            <em className="ab-cur">for replies.</em>
          </span>
        </h1>
        <p className="ab-sub ab-rise" style={{ ["--d" as string]: ".26s" }}>
          GotaOfferr was built for job seekers tired of waiting for replies that never come.
        </p>
      </section>

      <div style={{ overflow: "hidden", padding: "10px 0 6px" }}>
        <div aria-hidden className="ab-mq">
          <div className="ab-mq-in">
            {[0, 1].map((n) => (
              <span key={n}>
                {mqNode}
                {mqNode}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="ab-sec">
        <div className="ab-rv">
          <span className="ab-eyebrow">( why we built it )</span>
          <h2 className="ab-h2">
            The <mark>story</mark> in four taps
          </h2>
        </div>
        <div className="ab-story ab-rv">
          <div className="ab-tabs" role="tablist" aria-label="Our story">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.t}
                role="tab"
                aria-selected={ch === i}
                className="ab-tab"
                onClick={() => pick(i)}
                type="button"
              >
                <i>0{i + 1}</i>
                {c.t}
              </button>
            ))}
          </div>
          <div className="ab-stage" aria-live="polite">
            <span className="ab-big" aria-hidden>
              0{ch + 1}
            </span>
            <div key={swapKey} className="ab-swap">
              <h3>
                {before}
                <em>{cur.e}</em>
              </h3>
              <p>{cur.p}</p>
            </div>
            <span className="ab-bar" style={{ width: `${((ch + 1) / CHAPTERS.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <section className="ab-sec">
        <div className="ab-rv">
          <span className="ab-eyebrow">( do the maths )</span>
          <h2 className="ab-h2">
            Your <mark>time</mark>, side by side
          </h2>
        </div>
        <div className="ab-calc ab-rv">
          <div className="ab-calc-top">
            <label htmlFor="ab-apps">
              Applications I plan to send:<output htmlFor="ab-apps">{apps}</output>
            </label>
            <input
              id="ab-apps"
              className="ab-range"
              type="range"
              min={1}
              max={20}
              value={apps}
              onChange={(e) => setApps(Number(e.target.value))}
            />
          </div>
          <div className="ab-race">
            <div className="ab-row">
              <span className="lbl">By hand, about 1 hour each</span>
              <div className="ab-track">
                <div className="ab-fill" style={{ width: `${(apps / 20) * 100}%`, background: "rgba(0,0,0,.5)" }} />
              </div>
              <b>
                {apps} {apps === 1 ? "hour" : "hours"}
              </b>
            </div>
            <div className="ab-row">
              <span className="lbl">With GotaOfferr</span>
              <div className="ab-track">
                <div className="ab-fill" style={{ width: "9%", background: "var(--y)" }} />
              </div>
              <b style={{ color: "var(--y)" }}>minutes</b>
            </div>
          </div>
          <p className="ab-note">By-hand time is our rough estimate of one hour per tailored application.</p>
        </div>
      </section>

      <section className="ab-sec">
        <div className="ab-rv">
          <span className="ab-eyebrow">( meet the boss )</span>
          <h2 className="ab-h2">
            Coco is a <mark>kitten</mark>
          </h2>
        </div>
        <div className="ab-coco ab-rv">
          <button
            type="button"
            className={`ab-cat${pop ? " ab-pop" : ""}`}
            aria-label="Ask Coco for a message"
            onClick={() => {
              setCoco((c) => (c + 1) % COCO.length);
              setPop(false);
              requestAnimationFrame(() => setPop(true));
            }}
          >
            🐱
          </button>
          <div>
            <div className="ab-say" aria-live="polite">
              {COCO[coco]}
            </div>
            <div className="ab-hint">Tap Coco. She has opinions.</div>
          </div>
        </div>
      </section>

      <section className="ab-sec">
        <div className="ab-rv">
          <span className="ab-eyebrow">( what you get )</span>
          <h2 className="ab-h2">
            Four things, <mark>zero</mark> fluff
          </h2>
        </div>
        <div className="ab-gets">
          {GETS.map((g) => (
            <Link key={g.n} to={g.to} className="ab-card ab-rv">
              <span className="n">{g.n}</span>
              <h3>{g.h}</h3>
              <p>{g.p}</p>
              <span className="go">{g.c} →</span>
            </Link>
          ))}
        </div>
        <div className="ab-more ab-rv">
          <span className="ab-eyebrow">where to go next:</span>
          <a className="ab-chip" href="/how-it-works">
            how it works
          </a>
          <a className="ab-chip" href="/faq">
            FAQ
          </a>
          <a className="ab-chip" href="/guides/india-resume-format">
            India guide
          </a>
          <a className="ab-chip" href="/guides/uk-resume-format">
            UK guide
          </a>
          <a className="ab-chip" href="/guides/dubai-resume-format">
            Dubai guide
          </a>
          <a className="ab-chip" href="/contact">
            contact
          </a>
        </div>
      </section>

      <div className="ab-end ab-rv">
        <p>
          GotaOfferr is a sole proprietorship business.
        </p>
        <Link to="/tailor" className="ab-cta">
          Tailor my resume
        </Link>
      </div>
    </main>
  );
}

