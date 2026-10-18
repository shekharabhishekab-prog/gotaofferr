import { useEffect } from "react";
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

const TL_CSS = `
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
.tlp{--y:oklch(0.86 0.19 96);--cream:oklch(0.86 0.19 96);background:#fffffd;color:var(--cream)}
.tl-hero{position:relative;padding:44px 20px 40px;text-align:center;background:radial-gradient(55% 60% at 50% 0%,rgba(7,63,137,.14),transparent 72%)}
.tl-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(7,63,137,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(7,63,137,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(#fffffd 20%,transparent);mask-image:linear-gradient(#fffffd 20%,transparent)}
.tl-hero>*{position:relative}
.tl-hero,.tl-hero *{text-align:center}.tl-mono,.tl-sub{display:block;text-wrap:balance}.tl-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.tl-h1{margin:16px auto 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.3rem,7vw,4.6rem);max-width:15em}
.tl-h1 span{display:block}
.tl-h1 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);font-weight:400;font-size:1.06em;line-height:.9;vertical-align:baseline;letter-spacing:-.01em}
.tl-sub{max-width:34rem;margin:18px auto 0;font-size:1.05rem;line-height:1.5;color:rgba(0,0,0,.72)}
.tl-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:30px}
.tl-chips i{font-style:normal;font-size:.78rem;border:1px solid rgba(7,63,137,.4);color:var(--y);border-radius:999px;padding:5px 12px}
.tl-rise{opacity:0;transform:translateY(.6em);animation:tl-rise .6s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes tl-rise{to{opacity:1;transform:none}}
.tl-wrap{max-width:1180px;margin:0 auto;padding-left:20px;padding-right:20px}
.tl-card{background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));border:1px solid rgba(7,63,137,.35);border-radius:22px;box-shadow:none}
.tl-ic{background:var(--y)!important;color:#fffffd!important}
.tl-h{font-family:var(--font-display,inherit)}
.tl-drop{border:2px dashed rgba(7,63,137,.55)!important;background:rgba(7,63,137,.04)!important;border-radius:16px!important;transition:background .2s,transform .2s}
.tl-drop:hover{background:rgba(7,63,137,.1)!important;transform:scale(1.01)}
.tl input,.tl textarea{background:rgba(255,255,253,.6)}
.tl input:focus,.tl textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(7,63,137,.2)}
.tl [role=tablist]{border:1px solid rgba(7,63,137,.3)}
.tl-seo{border-top:1px solid rgba(7,63,137,.2)}
.tl-seo h2{font-family:var(--font-display,inherit)}
.tl-chips i{transition:transform .2s}
.tl-chips i:nth-child(odd){transform:rotate(-1.5deg)}
.tl-chips i:nth-child(even){transform:rotate(1.5deg)}
.tl-chips i:hover{transform:rotate(0) scale(1.08);background:rgba(7,63,137,.12)}
.tl-card{transition:transform .25s,box-shadow .25s}
.tl-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px -18px rgba(7,63,137,.35)}
.tl button.rounded-full{transition:transform .2s}
.tl button.rounded-full:not(:disabled):hover{transform:translateY(-3px) scale(1.02)}
.tl-cur{display:inline-block;transition:transform .3s}
.tl-h1:hover .tl-cur{transform:rotate(-2deg) scale(1.04)}
.tl-sticker{display:inline-block;margin-bottom:14px;background:var(--y);color:#fffffd;font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:999px;transform:rotate(-2deg);box-shadow:3px 3px 0 oklch(0.86 0.19 96),0 0 0 2px var(--y);transition:transform .25s}
.tl-sticker:hover{animation:tl-wig .55s}
@keyframes tl-wig{25%{transform:rotate(-8deg) scale(1.08)}60%{transform:rotate(6deg) scale(1.08)}100%{transform:rotate(-2deg)}}
.tl-card:hover .tl-ic{transform:rotate(-10deg) scale(1.12)}
.tl-ic{transition:transform .25s}
.tl-drop:hover svg{animation:tl-hop .5s}
@keyframes tl-hop{40%{transform:translateY(-7px)}}
.tl button.rounded-full:not(:disabled):hover{animation:tl-wig2 .5s}
@keyframes tl-wig2{25%{transform:translateY(-3px) rotate(-1.2deg)}60%{transform:translateY(-3px) rotate(1.2deg)}100%{transform:translateY(-3px) rotate(0)}}
#result{animation:tl-rise .7s cubic-bezier(.2,.8,.2,1) both}
#result .bg-hero{animation:tl-pop .7s cubic-bezier(.3,1.6,.5,1) .15s backwards}
@keyframes tl-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@keyframes tl-pop{from{transform:scale(.3) rotate(-12deg);opacity:0}}
.tl-ins-hero{display:flex;align-items:center;gap:18px;padding:20px 22px;border:1px solid rgba(7,63,137,.5);border-radius:22px;background:linear-gradient(135deg,rgba(7,63,137,.16),rgba(7,63,137,.03))}
.tl-ins-score small{display:block;font-size:.8rem;line-height:1;font-weight:800;opacity:.8}.tl-ins-score{flex-direction:column !important;flex:none;width:76px;height:76px;border-radius:20px;background:var(--y);color:#fffffd;font-family:var(--font-display,inherit);font-weight:800;font-size:2.4rem;display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);box-shadow:4px 4px 0 oklch(0.86 0.19 96),0 0 0 2px var(--y)}
.tl-ins-verdict{font-family:var(--font-display,inherit);font-weight:700;font-size:1.35rem;line-height:1.15}
.tl-ins-sub{margin-top:4px;font-size:.85rem;color:rgba(0,0,0,.65)}
.tl-ins-card{background:linear-gradient(160deg,rgba(7,63,137,.06),rgba(7,63,137,.012));border:1px solid rgba(7,63,137,.3);border-radius:20px;padding:22px;box-shadow:none;transition:transform .2s,border-color .2s}
.tl-ins-card:hover{transform:translateY(-2px);border-color:rgba(7,63,137,.6)}
.tl-ins-warn{border-color:rgba(255,160,60,.5);background:rgba(255,160,60,.06)}
.tl-ins-h{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-family:var(--font-display,inherit);font-weight:700;font-size:1rem;color:var(--y)}
.tl-ins-h-gap,.tl-ins-warn .tl-ins-h{color:#ffa94d}
.tl-ins-num{font-family:ui-monospace,Menlo,monospace;color:var(--y)}
.tl-ins-bar{margin-top:5px;height:9px;border-radius:99px;background:rgba(7,63,137,.08);overflow:hidden}
.tl-ins-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,oklch(0.86 0.19 96),var(--y));transform-origin:left;animation:tl-grow .8s cubic-bezier(.2,.8,.2,1) calc(var(--i,0)*.1s + .2s) backwards}
@keyframes tl-grow{from{transform:scaleX(0)}}
.tl-chip{display:inline-block;font-size:.8rem;padding:4px 11px;border-radius:999px;transition:transform .15s}
.tl-chip:hover{transform:scale(1.08) rotate(-2deg)}
.tl-chip-yes{background:var(--y);color:#fffffd;font-weight:600}
.tl-chip-no{border:1.5px dashed rgba(255,169,77,.8);color:#ffc078}
.tl-tip{display:flex;gap:12px;align-items:flex-start;font-size:.92rem;line-height:1.45}
.tl-tip b{flex:none;width:26px;height:26px;border-radius:50%;background:var(--y);color:#fffffd;display:flex;align-items:center;justify-content:center;font-size:.8rem}
@media (max-width:640px){.tl-ins-hero{gap:14px;padding:16px}.tl-ins-score{width:62px;height:62px;font-size:2rem}.tl-ins-verdict{font-size:1.1rem}}
@supports (animation-timeline:view()){.tl-grid>*{animation:tl-rise linear backwards;animation-timeline:view();animation-range:entry 0% entry 45%}}
@media (min-width:900px){.tl-h1{max-width:1440px;font-size:clamp(2.6rem,4.6vw,4.4rem);white-space:nowrap}.tl-sub{max-width:46rem}.tl-sub{max-width:46rem}}
@media (min-width:1280px){.tl-wrap{max-width:1480px;padding-left:32px;padding-right:32px}}
@media (min-width:1700px){.tl-wrap{max-width:1780px;padding-left:40px;padding-right:40px}.tl-h1{max-width:1700px;font-size:4.9rem}.tl-sub{max-width:54rem;font-size:1.15rem}}
@media (max-width:640px){.tl-hero,.tl-hero *{text-align:left}.tl-h1{margin:16px 0 0;max-width:none}.tl-h1 span{text-wrap:wrap}.tl-sub{margin:14px 0 0;text-wrap:pretty;font-size:.78rem!important;line-height:1.5}.tl-chips{justify-content:flex-start}.tl-sticker,.tl-chips i:nth-child(n),.tl-sticker{transform:none}.tl-chips{gap:6px;flex-wrap:wrap}.tl-chips i{font-size:.7rem;padding:4px 8px;white-space:nowrap}.tl-hero{padding-left:14px!important;padding-right:14px!important}.tl-mono{font-size:.66rem;letter-spacing:0}.tl-hero{padding:32px 16px 26px}.tl-wrap{padding-left:14px;padding-right:14px}.tl-h1{font-size:10.5vw;white-space:normal}.tl-h1 span{text-wrap:balance}.tl-sub{font-size:.86rem;line-height:1.5;color:rgba(0,0,0,.55);max-width:19rem}}
.tl{overflow-x:clip}.tl-grid>*{min-width:0}.tl-drop{overflow:hidden;max-width:100%}.tl-drop span{max-width:100%;overflow-wrap:anywhere;word-break:break-word}.tl textarea,.tl input{max-width:100%;min-width:0}
@media (prefers-reduced-motion:reduce){.tl-ins-fill{animation:none}.tl-ins-card:hover,.tl-chip:hover{transform:none}.tl-sticker:hover,.tl-drop:hover svg,.tl button.rounded-full:hover,#result,#result .bg-hero{animation:none}.tl-chips i,.tl-card,.tl button.rounded-full{transition:none}.tl-card:hover,.tl button.rounded-full:hover{transform:none}.tl-rise{animation:none;opacity:1;transform:none}.tl-grid>*{animation:none}}
.tl-br{display:flex;flex-direction:column;align-items:center;padding:34px 16px 6px}
.tl-bl{display:block;width:1px;height:64px;background:linear-gradient(to bottom,transparent,var(--y))}
.tl-bp{display:inline-flex;align-items:center;gap:8px;margin-top:8px;border:1px solid rgba(7,63,137,.18);background:rgba(255,255,253,.7);color:var(--y);border-radius:99px;padding:6px 16px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:1.15rem;text-decoration:none;transition:border-color .2s,transform .2s}
.tl-bp:hover{border-color:rgba(7,63,137,.7);transform:translateY(-2px)}
.tl-bp i{width:7px;height:7px;border-radius:99px;background:var(--y);display:block}
.tl-strip{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:22px auto 0;max-width:34rem}
.tl-strip span{font-size:.78rem;border:1px solid rgba(7,63,137,.35);color:var(--cream);border-radius:99px;padding:5px 12px;background:rgba(7,63,137,.06)}
.tl-strip span:nth-child(odd){transform:rotate(-1.5deg)}.tl-strip span:nth-child(even){transform:rotate(1.5deg);border-color:rgba(7,63,137,.25);background:transparent}
.tl-seo2{max-width:1100px;margin:0 auto;padding:44px 20px 80px;color:rgba(0,0,0,.72)}
.tl-seo2 h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:-.01em;font-size:clamp(1.7rem,4.2vw,2.8rem);color:var(--cream);margin:0;text-wrap:balance}
.tl-seo2 h2 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-seo2 .tl-lead{margin:18px 0 0;font-size:1.02rem;line-height:1.7;max-width:46rem;overflow-wrap:anywhere}
.tl-seo2 h3{margin:40px 0 14px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:400;font-size:1.5rem;color:var(--y)}
.tl-gets{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.tl-gets li{background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));border:1px solid rgba(7,63,137,.3);border-radius:20px;padding:18px;line-height:1.55;transition:transform .25s,border-color .25s;overflow-wrap:anywhere}
.tl-gets li:hover{transform:translateY(-4px) rotate(-.4deg);border-color:rgba(7,63,137,.7)}
.tl-gets b{display:block;font-size:1.7rem;margin-bottom:6px;font-weight:400}
.tl-more{margin:30px 0 0;padding:20px;border:1px dashed rgba(7,63,137,.35);border-radius:20px;line-height:1.9;max-width:100%;overflow-wrap:anywhere}
.tl-more a{color:var(--y);text-decoration:none;border-bottom:1px solid rgba(7,63,137,.5);padding:0 2px;transition:background .2s,color .2s}
.tl-more a:hover{background:var(--y);color:#fffffd}
@supports (animation-timeline:view()){.tl-bl{animation:tl-grow linear both;animation-timeline:view();animation-range:entry 0% cover 40%}@keyframes tl-grow{from{height:8px}to{height:64px}}.tl-gets li{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 55%}}
@media (max-width:760px){.tl-gets{grid-template-columns:minmax(0,1fr)}.tl-seo2{padding:30px 14px 56px}.tl-seo2 .tl-lead{font-size:.95rem}.tl-br{padding-top:24px}.tl-bl{height:44px}.tl-more{padding:16px}.tl-seo2 h3{font-size:1.3rem;margin-top:30px}}
@media (min-width:1280px){.tl-seo2{max-width:1480px;padding-left:32px;padding-right:32px}}
@media (min-width:1700px){.tl-seo2{max-width:1780px;padding-left:40px;padding-right:40px}.tl-seo2 .tl-lead{font-size:1.12rem;max-width:56rem}}
@media (prefers-reduced-motion:reduce){.tl-bl,.tl-gets li{animation:none}.tl-gets li:hover,.tl-bp:hover{transform:none}}
.tl-gap{display:none}
@media (min-width:761px){
.tl-br{display:none}
.tl-gap{display:block;position:relative;overflow:hidden;margin:0 0 20px;padding:0}
.tl-bw{white-space:nowrap;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(3rem,8.4vw,8.2rem);line-height:.98;color:var(--cream);margin-left:0;width:max-content;will-change:transform}
.tl-bw b{color:var(--y);display:inline-block}
.tl-bw.out{color:transparent;-webkit-text-stroke:2px var(--cream)}
.tl-gchips{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin:18px 0;padding:0 20px}
.tl-gchip{font-family:ui-monospace,Menlo,monospace;font-weight:800;text-transform:uppercase;font-size:1rem;padding:11px 16px;border:2px solid var(--cream);border-radius:999px;transition:transform .2s}
.tl-gchip.y{background:var(--y);color:#fffffd;border-color:var(--y)}
.tl-gchip:hover{transform:translateY(-3px) rotate(-1.5deg)}
@supports (animation-timeline:view()){.tl-gchip{animation:tl-pop linear backwards;animation-timeline:view();animation-range:entry 0% entry 60%}.tl-gchip:nth-child(2){animation-range:entry 5% entry 65%}.tl-gchip:nth-child(3){animation-range:entry 10% entry 70%}.tl-gchip:nth-child(4){animation-range:entry 15% entry 75%}.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 50%}@keyframes tl-pop{from{opacity:0;transform:translateY(26px) scale(.85)}to{opacity:1;transform:none}}}
.tl-seo2 h2{font-size:clamp(2.4rem,4.6vw,5rem);line-height:.98}
.tl-seo2 h2 mark{padding:.02em .2em;transform:rotate(-1.5deg);box-shadow:7px 7px 0 rgba(0,0,0,.9);transition:transform .25s}
.tl-seo2 h2:hover mark{transform:rotate(0) scale(1.03)}
.tl-seo2 h2:after{content:"";display:block;width:min(100%,520px);height:6px;margin-top:20px;border-radius:9px;background:linear-gradient(90deg,var(--y),rgba(7,63,137,0))}
}
@media (prefers-reduced-motion:reduce){.tl-bw,.tl-gchip,.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:none}.tl-gchip:hover{transform:none}}
`;

function TailorPage() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".tl-bw"));
    if (!rows.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      rows.forEach((el, i) => {
        const host = el.parentElement as HTMLElement;
        const r = host.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const travel = Math.max(0, el.scrollWidth - host.clientWidth);
        const x = i % 2 === 0 ? -travel + p * travel : -p * travel;
        el.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <main className="tlp bg-background">
      <style>{TL_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Coco approved 🐾 (our kitten)</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( resume tailor, ~30 seconds, no fake skills )</span>
        <h1 className="tl-h1" aria-label="Tailored paperwork so good, even you would hire yourself.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}><mark>Tailored</mark> paperwork so good,</span>
          <span className="tl-rise" style={{ ["--d" as string]: ".16s" }}>even YOU would <em className="tl-cur">hire yourself.</em></span>
        </h1>
        <p className="tl-sub tl-rise" style={{ ["--d" as string]: ".3s" }}>
          Drop in your resume and the job post. We rebuild your resume and cover letter for that exact role, in a plain ATS-safe layout. Gaps stay gaps, we never invent skills.
        </p>
        <div className="tl-chips tl-rise" style={{ ["--d" as string]: ".38s" }} aria-hidden>
          <i>ATS-safe ✅</i><i>Resume + cover letter ✉️</i><i>Match score 🎯</i>
        </div>
      </section>
      <ResumeTailor />

      <section aria-hidden className="tl-gap">
        <div className="tl-bw">One column <b>+</b> Real text <b>+</b> Real months <b>+</b> One column <b>+</b> Real text <b>+</b> Real months <b>+</b> One column <b>+</b> Real text <b>+</b> Real months <b>+</b></div>
        <div className="tl-gchips">
          <span className="tl-gchip">&#10003; one column</span>
          <span className="tl-gchip y">&#10003; real text</span>
          <span className="tl-gchip">&#10003; no fake skills</span>
          <span className="tl-gchip y">! gaps stay gaps</span>
        </div>
        <div className="tl-bw out">No tables <b>+</b> No text boxes <b>+</b> No pictures <b>+</b> No tables <b>+</b> No text boxes <b>+</b> No pictures <b>+</b> No tables <b>+</b> No text boxes <b>+</b> No pictures <b>+</b></div>
      </section>

      <div className="tl-br">
        <span aria-hidden className="tl-bl" />
        <a href="#tl-how" className="tl-bp"><i aria-hidden />how the magic works</a>
        <div className="tl-strip" aria-hidden>
          <span>one column</span><span>real text</span><span>no fake skills</span><span>no tables</span>
        </div>
      </div>

      <section id="tl-how" className="tl-seo2">
        <h2>What happens when you <mark>tailor</mark> a resume</h2>
        <p className="tl-lead">
          GotaOfferr reads the job description, finds the skills, keywords and responsibilities the
          employer cares about, and rewrites your summary, skills and experience bullets around
          them. It keeps your real experience. Anything the job asks for that your resume does not
          show appears in a missing keywords list, so you know what to add honestly.
        </p>
        <h3>What you get back</h3>
        <ul className="tl-gets">
          <li><b aria-hidden>📄</b>A rewritten resume in a single-column, ATS-friendly layout, ready to download as a PDF.</li>
          <li><b aria-hidden>✉️</b>A cover letter written for that company and role.</li>
          <li><b aria-hidden>🎯</b>A match score, the missing keywords and tips to improve your fit for the job.</li>
        </ul>
        <p className="tl-more">
          Applying in another country? Tailoring follows the resume conventions of 11 job markets.
          Read the <a href="/guides/dubai-resume-format">Dubai</a>, <a href="/guides/india-resume-format">India</a> or{" "}
          <a href="/guides/uk-resume-format">UK</a> resume format guides. No resume yet? Start with the{" "}
          <a href="/resume-builder">resume builder</a>, or <a href="/jobs">find jobs</a> first. See{" "}
          <a href="/how-it-works">how it works</a> or the <a href="/faq">FAQ</a>.
        </p>
      </section>
    </main>
  );
}

