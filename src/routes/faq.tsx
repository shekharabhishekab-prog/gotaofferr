import { createFileRoute, Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "What file formats can I upload?",
    a: "PDF resumes are read directly in your browser. You can also paste your resume as plain text if your file is a scan or a format we can't parse.",
  },
  {
    q: "Will the resume pass applicant tracking systems?",
    a: "The generated PDF uses a single-column layout with standard section headings, no tables, columns, or graphics — the format ATS parsers handle most reliably.",
  },
  {
    q: "Does it invent experience I don't have?",
    a: "No. The rewrite reframes and prioritises what's already in your resume around the job description. Missing requirements show up in the keyword gaps list instead, so you can decide how to address them.",
  },
  {
    q: "Is the cover letter included?",
    a: "Yes. Every generation produces a tailored cover letter referencing the company and role, downloadable as its own PDF.",
  },
  {
    q: "What happens to my data?",
    a: "Your resume is parsed in your browser and sent to the AI only to produce your documents. We don't store resumes or job descriptions, and no account is required.",
  },
  {
    q: "Can I edit the result before downloading?",
    a: "You can review the generated resume and cover letter on screen, adjust the source text, and regenerate until it reads the way you want.",
  },
  {
    q: "Which countries does the resume tailoring support?",
    a: "Tailoring follows the resume conventions of 11 job markets, including India, the UK, Germany, Canada, Australia, Singapore and the UAE. It also detects the country of the job you paste in, so a resume for a Dubai role is formatted differently from one for a London role.",
  },
  {
    q: "What do the match score and ATS score mean?",
    a: "The match score shows how closely your resume lines up with the job description. The ATS score estimates how well an applicant tracking system can read and rank it. Both come with the missing keywords and tips on what to change.",
  },
  {
    q: "How does the job finder work?",
    a: "Sign in, enter a role and a place, and the job finder searches major job boards for open roles. Jobs in the place you typed are listed first, nearby areas can follow, and far-away regions are left out. Pick a listing and tailor your resume to it in one click.",
  },
  {
    q: "Can I get new job alerts by email?",
    a: "Yes. Career Pro includes job alerts that email you new matching roles every few days, so you do not have to keep searching by hand.",
  },
  {
    q: "Do paid plans renew automatically?",
    a: "Yes. Every paid package is a monthly recurring subscription: by completing checkout you authorise an automatic charge of the same amount every month, on the same date, until you cancel. Cancel any time from your account page — cancellation stops all future charges and you keep access until the end of the period you already paid for.",
  },
];
export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — GotaOfferr Resume & Cover Letter Questions" },
      {
        name: "description",
        content:
          "Answers about PDF uploads, ATS formatting, AI accuracy, privacy, and cover letters in GotaOfferr. Quick, plain answers.",
      },
      { property: "og:title", content: "FAQ — GotaOfferr Resume & Cover Letter Questions" },
      {
        property: "og:description",
        content:
          "Answers about PDF uploads, ATS formatting, AI accuracy, privacy, and cover letters in GotaOfferr. Quick, plain answers.",
      },
      { property: "og:url", content: "https://gotaofferr.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});


const FQ_CSS = `
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
@media (max-width:640px){.tl-hero,.tl-hero *{text-align:left}.tl-h1{margin:16px 0 0;max-width:none}.tl-h1 span{text-wrap:wrap}.tl-sub{margin:14px 0 0;text-wrap:pretty;font-size:.78rem!important;line-height:1.5}.tl-chips{justify-content:flex-start}.tl-sticker,.tl-chips i:nth-child(n),.tl-sticker{transform:none}.tl-chips{gap:6px;flex-wrap:nowrap}.tl-chips i{font-size:.7rem;padding:4px 8px;white-space:nowrap}.tl-hero{padding-left:14px!important;padding-right:14px!important}.tl-mono{font-size:.66rem;letter-spacing:0}.tl-hero{padding:32px 16px 26px}.tl-wrap{padding-left:14px;padding-right:14px}.tl-h1{font-size:10.5vw;white-space:normal}.tl-h1 span{text-wrap:balance}.tl-sub{font-size:.86rem;line-height:1.5;color:rgba(246,241,214,.55);max-width:19rem}}
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
.tl-fq{max-width:860px;margin:0 auto;padding:6px 20px 30px}
.tl-fq [data-radix-collection-item],.tl-fq h3{font-family:var(--font-display,inherit)}
.tl-fq [data-state]{transition:border-color .2s}
.tl-fq .tl-q{background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015));border:1px solid rgba(255,214,0,.3)!important;border-radius:18px;padding:0 20px;margin-bottom:12px;transition:transform .2s,border-color .2s}
.tl-fq .tl-q:hover{border-color:rgba(255,214,0,.7)!important;transform:translateY(-2px)}
.tl-fq .tl-q[data-state=open]{border-color:var(--y)!important;background:linear-gradient(160deg,rgba(255,214,0,.14),rgba(255,255,255,.02))}
.tl-fq .tl-q button{font-weight:700;font-size:1.02rem;color:var(--cream)}
.tl-fq .tl-q button:hover{text-decoration:none;color:var(--y)}
.tl-fq .tl-q svg{color:var(--y)}
.tl-fq .tl-a{color:rgba(246,241,214,.75);line-height:1.65}
.tl-fq .tl-go{border-radius:999px;background:var(--y);color:#000;font-weight:700;padding:0 28px;margin-top:22px;transition:transform .2s}
.tl-fq .tl-go:hover{transform:translateY(-3px) rotate(-1deg);background:var(--y)}
@media (max-width:640px){.tl-fq{padding:4px 14px 24px}.tl-fq .tl-q{padding:0 14px}}
@media (min-width:900px){.tl-fq{max-width:1180px}.tl-aclist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:18px;align-items:start}}
@media (min-width:1280px){.tl-fq{max-width:1320px}}
@media (min-width:1500px){.tl-fq{max-width:1780px;padding-left:40px;padding-right:40px}.tl-aclist{column-gap:24px}}
`;

function Faq() {
  return (
    <main className="tlp bg-background">
      <style>{FQ_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Coco checked these answers 🐾 (our kitten)</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( faq, short answers, no fake skills )</span>
        <h1 className="tl-h1" aria-label="Frequently asked questions. Asked so you don't have to.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}><mark>Questions?</mark> Good.</span>
          <span className="tl-rise" style={{ ["--d" as string]: ".16s" }}>Answers are <em className="tl-cur">right here.</em></span>
        </h1>
        <p className="tl-sub tl-rise" style={{ ["--d" as string]: ".3s" }}>
          Frequently asked questions about tailoring, ATS, data, plans and the job finder. Tap one to open it.
        </p>
      </section>

      <div className="tl-fq">
        <h2 className="sr-only">Common questions</h2>
        <Accordion type="single" collapsible className="tl-aclist">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="tl-q">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="tl-a">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button asChild className="tl-go">
          <Link to="/tailor">Tailor my resume</Link>
        </Button>
      </div>
    </main>
  );
}
