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
.tlp{--y:#ffd600;--cream:#f6f1d6;background:#000;color:var(--cream)}
.tl-hero{position:relative;padding:44px 20px 12px;text-align:center;background:radial-gradient(55% 60% at 50% 0%,rgba(255,214,0,.14),transparent 72%)}
.tl-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(#000 20%,transparent);mask-image:linear-gradient(#000 20%,transparent)}
.tl-hero>*{position:relative}
.tl-hero,.tl-hero *{text-align:center}.tl-mono,.tl-sub{display:block;text-wrap:balance}.tl-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.tl-h1{margin:16px auto 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.3rem,7vw,4.6rem);max-width:15em}
.tl-h1 span{display:block}
.tl-h1 mark{background:var(--y);color:#000;padding:0 .12em;display:inline-block;transform:rotate(-1.5deg)}
.tl-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);font-weight:400;font-size:1.12em;letter-spacing:-.01em}
.tl-sub{max-width:34rem;margin:18px auto 0;font-size:1.05rem;line-height:1.5;color:rgba(246,241,214,.72)}
.tl-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:20px}
.tl-chips i{font-style:normal;font-size:.78rem;border:1px solid rgba(255,214,0,.4);color:var(--y);border-radius:999px;padding:5px 12px}
.tl-rise{opacity:0;transform:translateY(.6em);animation:tl-rise .6s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes tl-rise{to{opacity:1;transform:none}}
.tl-wrap{max-width:1180px;margin:0 auto;padding-left:20px;padding-right:20px}
.tl-card{background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015));border:1px solid rgba(255,214,0,.35);border-radius:22px;box-shadow:none}
.tl-ic{background:var(--y)!important;color:#000!important}
.tl-h{font-family:var(--font-display,inherit)}
.tl-drop{border:2px dashed rgba(255,214,0,.55)!important;background:rgba(255,214,0,.04)!important;border-radius:16px!important;transition:background .2s,transform .2s}
.tl-drop:hover{background:rgba(255,214,0,.1)!important;transform:scale(1.01)}
.tl input,.tl textarea{background:rgba(0,0,0,.6)}
.tl input:focus,.tl textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(255,214,0,.2)}
.tl [role=tablist]{border:1px solid rgba(255,214,0,.3)}
.tl-seo{border-top:1px solid rgba(255,214,0,.2)}
.tl-seo h2{font-family:var(--font-display,inherit)}
.tl-chips i{transition:transform .2s}
.tl-chips i:nth-child(odd){transform:rotate(-2.5deg)}
.tl-chips i:nth-child(even){transform:rotate(2deg)}
.tl-chips i:hover{transform:rotate(0) scale(1.08);background:rgba(255,214,0,.12)}
.tl-card{transition:transform .25s,box-shadow .25s}
.tl-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px -18px rgba(255,214,0,.35)}
.tl button.rounded-full{transition:transform .2s}
.tl button.rounded-full:not(:disabled):hover{transform:translateY(-3px) scale(1.02)}
.tl-cur{display:inline-block;transition:transform .3s}
.tl-h1:hover .tl-cur{transform:rotate(-2deg) scale(1.04)}
.tl-sticker{position:absolute;top:26px;right:max(20px,calc(50% - 560px));background:var(--y);color:#000;font-weight:700;font-size:.82rem;padding:7px 14px;border-radius:999px;transform:rotate(8deg);box-shadow:3px 3px 0 #000,0 0 0 2px var(--y);transition:transform .25s}
.tl-sticker:hover{animation:tl-wig .55s}
@keyframes tl-wig{25%{transform:rotate(-6deg) scale(1.08)}60%{transform:rotate(14deg) scale(1.08)}100%{transform:rotate(8deg)}}
.tl-card:hover .tl-ic{transform:rotate(-10deg) scale(1.12)}
.tl-ic{transition:transform .25s}
.tl-drop:hover svg{animation:tl-hop .5s}
@keyframes tl-hop{40%{transform:translateY(-7px)}}
.tl button.rounded-full:not(:disabled):hover{animation:tl-wig2 .5s}
@keyframes tl-wig2{25%{transform:translateY(-3px) rotate(-1.2deg)}60%{transform:translateY(-3px) rotate(1.2deg)}100%{transform:translateY(-3px) rotate(0)}}
#result{animation:tl-rise .7s cubic-bezier(.2,.8,.2,1) both}
#result .bg-hero{animation:tl-pop .7s cubic-bezier(.3,1.6,.5,1) .15s backwards}
@keyframes tl-pop{from{transform:scale(.3) rotate(-12deg);opacity:0}}
@supports (animation-timeline:view()){.tl-grid>*{animation:tl-rise linear backwards;animation-timeline:view();animation-range:entry 0% entry 45%}}
@media (max-width:900px){.tl-sticker{position:static;display:inline-block;margin-bottom:12px;transform:rotate(-3deg)}}
@media (max-width:640px){.tl-mono{font-size:.66rem;letter-spacing:0}.tl-hero{padding:32px 16px 8px}.tl-wrap{padding-left:14px;padding-right:14px}.tl-h1{font-size:clamp(2.1rem,11vw,3rem)}.tl-sub{font-size:.98rem}}
@media (prefers-reduced-motion:reduce){.tl-sticker:hover,.tl-drop:hover svg,.tl button.rounded-full:hover,#result,#result .bg-hero{animation:none}.tl-chips i,.tl-card,.tl button.rounded-full{transition:none}.tl-card:hover,.tl button.rounded-full:hover{transform:none}.tl-rise{animation:none;opacity:1;transform:none}.tl-grid>*{animation:none}}
`;

function TailorPage() {
  return (
    <main className="tlp bg-background">
      <style>{TL_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Coco approved 🐾</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( resume tailor, ~15 seconds, no fake skills )</span>
        <h1 className="tl-h1" aria-label="Their job post. Your real resume. Tailored.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}>Their <mark>job post.</mark></span>
          <span className="tl-rise" style={{ ["--d" as string]: ".14s" }}>Your real resume.</span>
          <span className="tl-rise tl-cur" style={{ ["--d" as string]: ".22s" }}>Tailored.</span>
        </h1>
        <p className="tl-sub tl-rise" style={{ ["--d" as string]: ".3s" }}>
          Drop in your resume and the job post. We rebuild your resume and cover letter for that exact role, in a plain ATS-safe layout. Gaps stay gaps, we never invent skills.
        </p>
        <div className="tl-chips tl-rise" style={{ ["--d" as string]: ".38s" }} aria-hidden>
          <i>ATS-safe ✅</i><i>Resume + cover letter ✉️</i><i>Match score 🎯</i>
        </div>
      </section>
      <ResumeTailor />

      <section className="tl-seo site-container mx-auto max-w-3xl space-y-4 py-16 text-muted-foreground">
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
          <li>A match score, the missing keywords and tips to improve your fit for the job.</li>
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

