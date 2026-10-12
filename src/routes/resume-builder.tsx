import { createFileRoute } from "@tanstack/react-router";

import { ResumeBuilder } from "@/components/ResumeBuilder";
import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";

const TITLE = "Free Resume Builder, Indian & International | GotaOfferr";
const DESCRIPTION =
  "Build an ATS-friendly resume in minutes. Pick the Indian or international format, let AI polish your bullets, and download a clean PDF.";
const CANONICAL = "https://gotaofferr.com/resume-builder";

export const Route = createFileRoute("/resume-builder")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "GotaOfferr Resume Builder",
          applicationCategory: "BusinessApplication",
          description: DESCRIPTION,
          url: CANONICAL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }),
      },
    ],
  }),
  component: ResumeBuilderPage,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});


const RB_CSS = `
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
.tlp{--y:#ffd600;--cream:#f6f1d6;background:#000;color:var(--cream)}
.tl-hero{position:relative;padding:44px 20px 40px;text-align:center;background:radial-gradient(55% 60% at 50% 0%,rgba(255,214,0,.14),transparent 72%)}
.tl-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(#000 20%,transparent);mask-image:linear-gradient(#000 20%,transparent)}
.tl-hero>*{position:relative}
.tl-hero,.tl-hero *{text-align:center}.tl-mono,.tl-sub{display:block;text-wrap:balance}.tl-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.tl-h1{margin:16px auto 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.3rem,7vw,4.6rem);max-width:15em}
.tl-h1 span{display:block}
.tl-h1 mark{background:var(--y);color:#000;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);font-weight:400;font-size:1.06em;line-height:.9;vertical-align:baseline;letter-spacing:-.01em}
.tl-sub{max-width:34rem;margin:18px auto 0;font-size:1.05rem;line-height:1.5;color:rgba(246,241,214,.72)}
.tl-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:30px}
.tl-chips i{font-style:normal;font-size:.78rem;border:1px solid rgba(255,214,0,.4);color:var(--y);border-radius:999px;padding:5px 12px}
.tl-rise{opacity:0;transform:translateY(.6em);animation:tl-rise .6s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes tl-rise{to{opacity:1;transform:none}}
.tl-chips i{transition:transform .2s}
.tlp .grid>*{min-width:0}
.tl-chips i:nth-child(odd){transform:rotate(-1.5deg)}
.tl-chips i:nth-child(even){transform:rotate(1.5deg)}
.tl-chips i:hover{transform:rotate(0) scale(1.08);background:rgba(255,214,0,.12)}
.tl-cur{display:inline-block;transition:transform .3s}
.tl-h1:hover .tl-cur{transform:rotate(-2deg) scale(1.04)}
.tl-sticker{display:inline-block;margin-bottom:14px;background:var(--y);color:#000;font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:999px;transform:rotate(-2deg);box-shadow:3px 3px 0 #000,0 0 0 2px var(--y);transition:transform .25s}
.tl-sticker:hover{animation:tl-wig .55s}
@keyframes tl-wig{25%{transform:rotate(-8deg) scale(1.08)}60%{transform:rotate(6deg) scale(1.08)}100%{transform:rotate(-2deg)}}
.tl button.rounded-full:not(:disabled):hover{animation:tl-wig2 .5s}
@keyframes tl-wig2{25%{transform:translateY(-3px) rotate(-1.2deg)}60%{transform:translateY(-3px) rotate(1.2deg)}100%{transform:translateY(-3px) rotate(0)}}
@keyframes tl-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@keyframes tl-pop{from{transform:scale(.3) rotate(-12deg);opacity:0}}
@keyframes tl-grow{from{transform:scaleX(0)}}
@supports (animation-timeline:view()){.tl-grid>*{animation:tl-rise linear backwards;animation-timeline:view();animation-range:entry 0% entry 45%}}
@media (min-width:900px){.tl-h1{max-width:1440px;font-size:clamp(2.6rem,4.6vw,4.4rem);white-space:nowrap}.tl-sub{max-width:46rem}.tl-sub{max-width:46rem}}
@media (min-width:1700px){.tl-wrap{max-width:1780px;padding-left:40px;padding-right:40px}.tl-h1{max-width:1700px;font-size:4.9rem}.tl-sub{max-width:54rem;font-size:1.15rem}}
@media (max-width:640px){.tl-hero,.tl-hero *{text-align:left}.tl-h1{margin:16px 0 0;max-width:none}.tl-h1 span{text-wrap:wrap}.tl-sub{margin:14px 0 0;text-wrap:pretty;font-size:.78rem!important;line-height:1.5}.tl-chips{justify-content:flex-start}.tl-sticker,.tl-chips i:nth-child(n),.tl-sticker{transform:none}.tl-chips{gap:6px;flex-wrap:wrap}.tl-chips i{font-size:.7rem;padding:4px 8px;white-space:nowrap}.tl-hero{padding-left:14px!important;padding-right:14px!important}.tl-mono{font-size:.66rem;letter-spacing:0}.tl-hero{padding:32px 16px 26px}.tl-wrap{padding-left:14px;padding-right:14px}.tl-h1{font-size:10.5vw;white-space:normal}.tl-h1 span{text-wrap:balance}.tl-sub{font-size:.86rem;line-height:1.5;color:rgba(246,241,214,.55);max-width:19rem}}
.tl-br{display:flex;flex-direction:column;align-items:center;padding:34px 16px 6px}
.tl-bl{display:block;width:1px;height:64px;background:linear-gradient(to bottom,transparent,var(--y))}
.tl-bp{display:inline-flex;align-items:center;gap:8px;margin-top:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.7);color:var(--y);border-radius:99px;padding:6px 16px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:1.15rem;text-decoration:none;transition:border-color .2s,transform .2s}
.tl-bp:hover{border-color:rgba(255,214,0,.7);transform:translateY(-2px)}
.tl-bp i{width:7px;height:7px;border-radius:99px;background:var(--y);display:block}
.tl-strip{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:22px auto 0;max-width:34rem}
.tl-strip span{font-size:.78rem;border:1px solid rgba(255,214,0,.35);color:var(--cream);border-radius:99px;padding:5px 12px;background:rgba(255,214,0,.06)}
.tl-strip span:nth-child(odd){transform:rotate(-1.5deg)}.tl-strip span:nth-child(even){transform:rotate(1.5deg);border-color:rgba(255,255,255,.25);background:transparent}
.tl-seo2{max-width:1100px;margin:0 auto;padding:44px 20px 80px;color:rgba(246,241,214,.72)}
.tl-seo2 h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:-.01em;font-size:clamp(1.7rem,4.2vw,2.8rem);color:var(--cream);margin:0;text-wrap:balance}
.tl-seo2 h2 mark{background:var(--y);color:#000;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-seo2 .tl-lead{margin:18px 0 0;font-size:1.02rem;line-height:1.7;max-width:46rem;overflow-wrap:anywhere}
.tl-seo2 h3{margin:40px 0 14px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:400;font-size:1.5rem;color:var(--y)}
.tl-gets{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.tl-gets li{background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015));border:1px solid rgba(255,214,0,.3);border-radius:20px;padding:18px;line-height:1.55;transition:transform .25s,border-color .25s;overflow-wrap:anywhere}
.tl-gets li:hover{transform:translateY(-4px) rotate(-.4deg);border-color:rgba(255,214,0,.7)}
.tl-gets b{display:block;font-size:1.7rem;margin-bottom:6px;font-weight:400}
.tl-more{margin:30px 0 0;padding:20px;border:1px dashed rgba(255,214,0,.35);border-radius:20px;line-height:1.9;max-width:100%;overflow-wrap:anywhere}
.tl-more a{color:var(--y);text-decoration:none;border-bottom:1px solid rgba(255,214,0,.5);padding:0 2px;transition:background .2s,color .2s}
.tl-more a:hover{background:var(--y);color:#000}
@supports (animation-timeline:view()){.tl-bl{animation:tl-grow linear both;animation-timeline:view();animation-range:entry 0% cover 40%}@keyframes tl-grow{from{height:8px}to{height:64px}}.tl-gets li{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 55%}}
@media (max-width:760px){.tl-gets{grid-template-columns:minmax(0,1fr)}.tl-seo2{padding:30px 14px 56px}.tl-seo2 .tl-lead{font-size:.95rem}.tl-br{padding-top:24px}.tl-bl{height:44px}.tl-more{padding:16px}.tl-seo2 h3{font-size:1.3rem;margin-top:30px}}
@media (min-width:1280px){.tl-seo2{max-width:1480px;padding-left:32px;padding-right:32px}}
@media (min-width:1700px){.tl-seo2{max-width:1780px;padding-left:40px;padding-right:40px}.tl-seo2 .tl-lead{font-size:1.12rem;max-width:56rem}}
@media (prefers-reduced-motion:reduce){.tl-bl,.tl-gets li{animation:none}.tl-gets li:hover,.tl-bp:hover{transform:none}}
.tl-br{display:none}
@supports (animation-timeline:view()){.tl-bw{animation:tl-bwl linear both;animation-timeline:view();animation-range:entry 0% exit 100%}.tl-bw.out{animation-name:tl-bwr}@keyframes tl-bwl{from{transform:translateX(24%)}to{transform:translateX(-24%)}}@keyframes tl-bwr{from{transform:translateX(-24%)}to{transform:translateX(24%)}}.tl-gchip{animation:tl-pop linear backwards;animation-timeline:view();animation-range:entry 0% entry 60%}.tl-gchip:nth-child(2){animation-range:entry 5% entry 65%}.tl-gchip:nth-child(3){animation-range:entry 10% entry 70%}.tl-gchip:nth-child(4){animation-range:entry 15% entry 75%}.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 50%}@keyframes tl-pop{from{opacity:0;transform:translateY(26px) scale(.85)}to{opacity:1;transform:none}}}
.tl-seo2 h2{font-size:clamp(2.4rem,4.6vw,5rem);line-height:.98}
.tl-seo2 h2 mark{padding:.02em .2em;transform:rotate(-1.5deg);box-shadow:7px 7px 0 rgba(255,255,255,.9);transition:transform .25s}
.tl-seo2 h2:hover mark{transform:rotate(0) scale(1.03)}
.tl-seo2 h2:after{content:"";display:block;width:min(100%,520px);height:6px;margin-top:20px;border-radius:9px;background:linear-gradient(90deg,var(--y),rgba(255,214,0,0))}
@media (prefers-reduced-motion:reduce){.tl-bw,.tl-gchip,.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:none}.tl-gchip:hover{transform:none}}
`;

function ResumeBuilderPage() {
  return (
    <main className="tlp bg-background">
      <style>{RB_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Coco approved 🐾 (our kitten)</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( resume builder, from zero, no fake skills )</span>
        <h1 className="tl-h1" aria-label="Resume from scratch, without the cold sweat.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}><mark>Resume</mark> from scratch,</span>
          <span className="tl-rise" style={{ ["--d" as string]: ".16s" }}>without the <em className="tl-cur">cold sweat.</em></span>
        </h1>
        <p className="tl-sub tl-rise" style={{ ["--d" as string]: ".3s" }}>
          No resume yet? Write what you did in plain words, like you would tell a friend over coffee. Pick the Indian or the international format, and AI turns your notes into clean, recruiter-ready lines.
        </p>
        <div className="tl-chips tl-rise" style={{ ["--d" as string]: ".38s" }} aria-hidden>
          <i>ATS-safe ✅</i><i>India or international 🌍</i><i>Plain words in ✍️</i>
        </div>
      </section>
      <div className="tl">
        <ResumeBuilder />
      </div>

      <section className="tl-seo2">
        <h2>How the <mark>resume builder</mark> works</h2>
        <p className="tl-lead">
          Write your experience in plain words, the way you would explain it to a friend. The AI
          turns your notes into clear bullet points with action verbs and results, and lays them out
          in a single-column format that applicant tracking systems read reliably.
        </p>
        <h3>
          Indian or international format
        </h3>
        <p className="tl-lead">
          Pick the format that fits where you are applying. The international format is short and
          achievement-led. The Indian format keeps the personal and academic details that Indian
          recruiters expect. Applying to a specific country? Read our resume format guides for{" "}
          <a style={{ color: "var(--y)" }} href="/guides/india-resume-format">
            India
          </a>
          ,{" "}
          <a style={{ color: "var(--y)" }} href="/guides/dubai-resume-format">
            Dubai
          </a>
          ,{" "}
          <a style={{ color: "var(--y)" }} href="/guides/uk-resume-format">
            the UK
          </a>
          ,{" "}
          <a style={{ color: "var(--y)" }} href="/guides/germany-resume-format">
            Germany
          </a>{" "}
          and{" "}
          <a style={{ color: "var(--y)" }} href="/guides/canada-resume-format">
            Canada
          </a>
          .
        </p>
        <h3>
          Already have a resume?
        </h3>
        <p className="tl-lead">
          Skip the builder and{" "}
          <a style={{ color: "var(--y)" }} href="/tailor">
            tailor your existing resume
          </a>{" "}
          to a specific job, or see{" "}
          <a style={{ color: "var(--y)" }} href="/how-it-works">
            how it works
          </a>{" "}
          and the{" "}
          <a style={{ color: "var(--y)" }} href="/faq">
            FAQ
          </a>
          .
        </p>
      </section>
    </main>
  );
}
