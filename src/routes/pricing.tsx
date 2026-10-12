import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { useServerFn } from "@tanstack/react-start";

import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useSubscription } from "@/hooks/useSubscription";

import { changePlan } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { planChangeKind, priceIdFor, CHECKOUT_CURRENCIES } from "@/lib/plans";
import { useSession } from "@/hooks/useSession";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import { getVisitorCountry } from "@/lib/geo.functions";
import { activeFestival, type ActiveFestival } from "@/lib/festival-pricing";
import {
  DEFAULT_PRICING,
  amountFor,
  savingPercent,
  wasAmountFor,
  detectPricing,
  formatAmount,
  hasFestivalPrice,
  pricingForCountry,
  type BillingInterval,
  type CurrencyPricing,
} from "@/lib/pricing-currency";



export const Route = createFileRoute("/pricing")({
  // Resolve the visitor's market on the server so the very first HTML already
  // carries their currency — no flash of the default market on slow devices.
  loader: () => getVisitorCountry(),
  head: () => ({
    meta: [
      { title: "Pricing — GotaOfferr Resume Tailoring Plans" },
      {
        name: "description",
        content:
          "Start tailoring resumes for free. Upgrade for more rewrites, cover letters, and match insights while job hunting.",
      },
      { property: "og:title", content: "Pricing — GotaOfferr Resume Tailoring Plans" },
      {
        property: "og:description",
        content:
          "Start tailoring resumes for free. Upgrade for more rewrites, cover letters, and match insights while job hunting.",
      },
      { property: "og:url", content: "https://gotaofferr.com/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/pricing" }],
  }),
  component: Pricing,
});


/** Placeholder keys; the real ones are resolved per visitor currency below. */
const PRICE_IDS = {
  starter: { month: "starter_inr_monthly", year: "starter_inr_yearly" },
  job_hunt: { month: "job_hunt_inr_monthly", year: "job_hunt_inr_yearly" },
  career_pro: { month: "career_pro_inr_monthly", year: "career_pro_inr_yearly" },
};


type PlanKey = "free" | "starter" | "job_hunt" | "career_pro";
type PaidPlanKey = Exclude<PlanKey, "free">;

/** Every billable currency now has a real Starter pack at the payment provider. */
/** Starter Pack is sellable in every currency the provider can bill. */
const STARTER_CURRENCIES = new Set<string>(CHECKOUT_CURRENCIES);

const plans: Record<PlanKey, {
  name: string;
  note: string;
  tagline: string;
  bestFor: string;
  features: string[];
  cta: string;
  highlight: boolean;
  paid: boolean;
  priceId?: { month: string; year: string };
}>= {
  free: {
    name: "Free",
    note: "forever",
    tagline: "Try it on your next five applications.",
    bestFor: "Best for: testing whether tailoring actually gets you replies.",
    features: [
      "5 resume + cover letter tailorings per month",
      "10 ATS resume checks per month",
      "3 resumes in the resume builder per month",
      "1 AI job finder search per month",
      "1 AI interview with Coco per month",
      "1 job alert per month (3 emails, every 3 days)",
      "Resume builder: build a resume from scratch and download it as a PDF",
      "Resume rebuilt for each job description",
      "Cover letter for each",
      "PDF download",
      "Match score",
    ],
    cta: "Start free",
    highlight: false,
    paid: false,
  },
  starter: {
    name: "Starter Pack",
    note: "per month",
    tagline: "A complete application kit — 40 credits' worth of work for the price of a coffee.",
    bestFor: "Best for: applying to a handful of roles you really want.",
    features: [
      "20 resume + cover letter tailorings per month",
      "30 ATS resume checks per month",
      "Resume builder: build a resume from scratch and download it as a PDF",
      "12 resumes in the resume builder",
      "5 AI job finder searches per month",
      "3 AI interviews with Coco per month",
      "3 job alerts (3 emails each, every 3 days)",
      "Keyword gap report on every rewrite",
      "ATS match score + parseability check",
      "Unlimited PDF downloads of everything you make",
      "Everything in Free, included",
      "Cancel any time, keep every PDF you made",
    ],
    cta: "Get the Starter Pack",
    highlight: false,
    paid: true,
    priceId: PRICE_IDS.starter,
  },
  job_hunt: {
    name: "Job Hunt Pack",
    note: "per month",
    tagline: "Everything you need for a focused job hunt — 129 tailored applications, cover letters, and AI job searches in one package.",
    bestFor: "Best for: applying to 10-50 roles a month from boards you browse yourself.",
    features: [
      "129 resume + cover letter tailorings per month",
      "100 ATS resume checks per month",
      "Resume builder: build a resume from scratch and download it as a PDF",
      "20 resumes in the resume builder",
      "10 AI job finder searches per month",
      "8 AI interviews with Coco per month",
      "5 job alerts (3 emails each, every 3 days)",
      "Keyword gap insights — see exactly which words are missing",
      "Saved master resume, so you never re-upload",
      "Rewrite history: every resume you've generated, re-downloadable",
      "Choose your resume template and accent",
      "Cover letter tone: concise, confident or impact-led",
      "Priority generation queue — faster rewrites at peak hours",
      "Cancel any time, keep every PDF you made",
    ],
    cta: "Get the Job Hunt Pack",
    highlight: true,
    paid: true,
    priceId: PRICE_IDS.job_hunt,
  },


  career_pro: {
    name: "Career Pro Pack",
    note: "per month",
    tagline: "The complete career package: we write the applications, find the jobs, and deliver fresh leads every 3 days.",
    bestFor: "Best for: a full-time search, or running two career tracks at once.",
    features: [
      "199 resume + cover letter tailorings per month",
      "Unlimited ATS resume checks",
      "Resume builder: build a resume from scratch and download it as a PDF",
      "50 resumes in the resume builder",
      "30 AI job finder searches per month - one clean list across every board",
      "15 AI interviews with Coco per month",
      "7 job alerts (3 emails each, every 3 days)",
      "Everything else in Job Hunt Pack — history, keyword gaps, templates",
      "Your filters, saved: location, remote, experience, salary, company type",
      "One click from a listing to the company's own apply page",
      "One-click tailor: send any listing straight into the resume builder",
      "Multiple master resumes — one per career track (e.g. PM vs. Analyst)",
      "Application history with match score per company",
      "Interview prep questions built from the job description",
      "Recruiter outreach message generator",
      "Priority email support, replies within 24h",
    ],
    cta: "Get the Career Pro Pack",
    highlight: false,
    paid: true,
    priceId: PRICE_IDS.career_pro,
  },

};



const PR_CSS = `
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
.tl-pr .tl-pw{max-width:1400px;margin:0 auto;padding:0 20px 64px}
.tl-pr .tl-pw>p{color:rgba(246,241,214,.72)}
.tl-pr .tl-pw>p.rounded-xl,.tl-pr .tl-pw>p[class*=border]{border-color:rgba(255,214,0,.35);background:rgba(255,214,0,.06)}
.tl-pr .tl-pw a.underline{color:var(--y)}
.tl-pr .tl-plan{background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015))!important;border-color:rgba(255,214,0,.3)!important;border-radius:22px!important;box-shadow:none!important;transition:transform .25s,border-color .25s,box-shadow .25s}
.tl-pr .tl-plan:hover{transform:translateY(-4px);border-color:rgba(255,214,0,.75)!important;box-shadow:0 16px 44px -20px rgba(255,214,0,.4)!important}
.tl-pr .tl-plan.tl-hl{border-color:var(--y)!important;background:linear-gradient(160deg,rgba(255,214,0,.16),rgba(255,255,255,.02))!important}
.tl-pr .tl-plan h2,.tl-pr .tl-plan .font-display{color:var(--cream)}
.tl-pr .tl-plan button:not(:disabled){border-radius:999px;transition:transform .2s}
.tl-pr .tl-plan button:not(:disabled):hover{transform:translateY(-3px) rotate(-1deg)}
.tl-pr .tl-plan.tl-hl button:not(:disabled){background:var(--y);color:#000;font-weight:700}
.tl-pr .tl-plan a[class*=border]{border-radius:999px}
.tl-pr .tl-cmp{background:linear-gradient(160deg,rgba(255,214,0,.06),rgba(255,255,255,.012))!important;border-color:rgba(255,214,0,.3)!important;border-radius:22px!important}
.tl-pr .tl-cmp>h2{font-family:var(--font-display,inherit);text-transform:uppercase}
.tl-pr .tl-cmp .rounded-xl{border-radius:18px;transition:transform .2s,border-color .2s}
.tl-pr .tl-cmp .rounded-xl:hover{transform:translateY(-3px)}
@media (max-width:640px){.tl-pr .tl-pw{padding:0 14px 48px}}
@media (min-width:1500px){.tl-pr .tl-pw{max-width:1780px;padding-left:40px;padding-right:40px}.tl-pr .tl-pw>p{max-width:1500px}}
@media (prefers-reduced-motion:reduce){.tl-pr .tl-plan,.tl-pr .tl-plan:hover{transition:none;transform:none}}
`;

function Pricing() {
  const { session } = useSession();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const [selected, setSelected] = useState<PlanKey | null>(null);
  // The server already resolved the market from the request's geo header, so
  // the first paint (SSR and hydration alike) is already the right currency.
  const ssrCountry = Route.useLoaderData().country;
  const [pricing, setPricing] = useState<CurrencyPricing>(
    () => pricingForCountry(ssrCountry) ?? DEFAULT_PRICING,
  );
  // Billing is monthly only — the yearly plan is retired.
  const interval: BillingInterval = "month";
  const [switching, setSwitching] = useState<PlanKey | null>(null);
  // Resolved after mount so server and client render the same first pass.
  // Seeded from the server-resolved country so the first HTML already carries the offer prices.
  const [festival, setFestival] = useState<ActiveFestival | null>(() =>
    activeFestival(Date.now(), pricingForCountry(ssrCountry)?.code === "INR" ? "IN" : null),
  );
  useEffect(() => setFestival(activeFestival(Date.now(), pricing.code === "INR" ? "IN" : null)), [pricing.code]);
  const {
    plan: currentPlan,
    tier: currentTier,
    isSubscribed,
    refresh: refreshSubscription,
  } = useSubscription();
  const switchPlan = useServerFn(changePlan);


  // Backstop for cached/prerendered HTML, where the request had no geo header:
  // fall back to the device's own location signals right after hydration.
  const { data: geo } = useQuery({
    queryKey: ["visitor-country"],
    queryFn: () => getVisitorCountry(),
    staleTime: Infinity,
    retry: 1,
    enabled: !ssrCountry,
  });

  useEffect(() => {
    if (ssrCountry) return;
    setPricing(pricingForCountry(geo?.country) ?? detectPricing());
  }, [ssrCountry, geo?.country]);




  const selectedPlan = selected ? plans[selected] : null;

  // Starter is only shown where the payment provider can actually bill it.
  const visibleKeys = (Object.keys(plans) as PlanKey[]).filter(
    (key) => key !== "starter" || STARTER_CURRENCIES.has(pricing.code),
  );


  /** True when the running festival offer covers this plan in this currency. */
  function onFestivalOffer(key: PlanKey): boolean {
    if (key === "free" || !festival) return false;
    return hasFestivalPrice(pricing, key);
  }

  function priceLabel(key: PlanKey): string {
    if (key === "free") return `${pricing.symbol}0`;
    return formatAmount(pricing, amountFor(pricing, key, interval, onFestivalOffer(key)));
  }

  /** Monthly label, used in the comparison section so copy stays stable. */
  function monthlyLabel(key: PaidPlanKey): string {
    return formatAmount(pricing, amountFor(pricing, key, "month", onFestivalOffer(key)));
  }

  /** Label reflects whether this is a first purchase or a plan switch. */
  function ctaLabel(key: PlanKey, fallback: string): string {
    const plan = plans[key];
    if (!plan.priceId || !isSubscribed) return fallback;
    const target = priceIdFor(key as PaidPlanKey, interval, pricing.code, onFestivalOffer(key));
    const kind = planChangeKind(currentPlan, target);
    if (kind === "same") return "Your current plan";
    return kind === "upgrade" ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
  }

  async function onBuy(key: PlanKey) {
    if (!session) {
      setSelected(key);
      return;
    }
    const plan = plans[key];
    if (!plan.priceId) return;
    // Charge in the same currency the visitor is seeing.
    const target = priceIdFor(key as PaidPlanKey, interval, pricing.code, onFestivalOffer(key));

    // Existing subscribers switch plans on the same subscription instead of
    // starting a second one: upgrades apply now, downgrades at period end.
    if (isSubscribed) {
      const kind = planChangeKind(currentPlan, target);
      if (kind === "same") {
        toast.info("You're already on this plan.");
        return;
      }
      setSwitching(key);
      try {
        const res = await switchPlan({ data: { priceId: target, environment: getStripeEnvironment() } });
        if ("ok" in res && res.ok) {
          toast.success(
            res.effective === "now"
              ? `Upgraded to ${plan.name}. It's active right away.`
              : `Switching to ${plan.name}${
                  res.effectiveDate ? ` on ${new Date(res.effectiveDate).toLocaleDateString()}` : ""
                }. You keep your current plan until then.`,
          );
          await refreshSubscription();
          return;
        }
        if ("needsCheckout" in res && res.needsCheckout) {
          if (res.error) toast.info(res.error);
          // Fall through to a fresh checkout below.
        } else {
          toast.error(res.error ?? "Could not switch plan");
          return;
        }
      } finally {
        setSwitching(null);
      }
    }

    openCheckout({
      priceId: target,
      quantity: 1,
      currency: pricing.code,
      title: `Subscribe to ${plan.name}`,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  }


  return (
    <main className="tlp tl-pr bg-background">
      <style>{PR_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Cheaper than one coffee a week 🐾 (Coco approved)</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( pricing, free to start, cancel any time )</span>
        <h1 className="tl-h1" aria-label="Pricing. Pay only while you are applying.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}><mark>Pricing</mark> that is kind</span>
          <span className="tl-rise" style={{ ["--d" as string]: ".16s" }}>to your <em className="tl-cur">coffee budget.</em></span>
        </h1>
      </section>
      <div className="tl-pw">
      <p className="mt-4 max-w-2xl lg:max-w-6xl text-muted-foreground">
        Plans are priced by how many tailored applications you send — and whether you want the AI to
        find the jobs for you too. Try it free, upgrade only while you're actively applying, cancel
        any time. Prices shown in {pricing.code} for your region; payment is processed securely by
        Razorpay and charged in {pricing.code}, with taxes calculated at checkout. International
        cards, bank transfers (ACH, SEPA, CHAPS, SWIFT) and local methods like Trustly, GiroPay and
        SofortPay are supported, alongside UPI, netbanking and wallets in India.
      </p>
      <p className="mt-4 max-w-2xl lg:max-w-6xl rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-card-foreground">
        <strong>Auto-renewal:</strong> every paid pack is a monthly subscription. By paying, you
        authorise an automatic charge of the same amount every month on the same date until you
        cancel. Cancel anytime from your account — you keep access until the end of the paid month.
        See{" "}
        <Link to="/terms" className="underline hover:text-foreground">
          Terms
        </Link>
        .
      </p>







      {festival && hasFestivalPrice(pricing, "job_hunt") ? (
        <p className="mt-6 w-fit rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
          <strong>{festival.title} - Save up to {savingPercent(pricing, "job_hunt", "month", true)}%.</strong> Starter Pack is{" "}
          {formatAmount(pricing, amountFor(pricing, "starter", "month", true))}/month, Job Hunt Pack is{" "}
          {formatAmount(pricing, amountFor(pricing, "job_hunt", "month", true))}/month and Career Pro Pack is{" "}
          {formatAmount(pricing, amountFor(pricing, "career_pro", "month", true))}/month.
        </p>
      ) : null}

      {TESTING_UNLOCK_ALL_PLANS ? (
        <p className="mt-4 w-fit rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-foreground">
          Testing mode: every signed-in account already has full Career Pro Pack access — no payment
          needed.
        </p>
      ) : null}

      <div
        className={`mt-12 grid gap-6 md:grid-cols-2 ${
          visibleKeys.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {visibleKeys.map((key) => {

          const p = plans[key];
          const isCurrent = !!session && (isSubscribed ? currentTier === key : key === "free");
          return (
            <div
              key={key}
              className={`tl-plan ${p.highlight ? "tl-hl" : ""} relative flex flex-col rounded-2xl border p-7 ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/40 bg-card shadow-lg"
                  : p.highlight
                    ? "border-primary bg-card shadow-lg"
                    : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {isCurrent ? (
                  <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    Current plan
                  </span>
                ) : null}
                {p.highlight && !isCurrent ? (
                  <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
                {key === "starter" && !isCurrent ? (
                  <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Limited Launch Offer
                  </span>
                ) : null}
              </div>
              {key === "starter" ? (
                <p className="-mt-1 mb-2 text-xs font-medium text-muted-foreground">
                  40 AI actions bundled together
                </p>
              ) : null}
              <h2 className="font-display text-lg font-semibold text-card-foreground">{p.name}</h2>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-card-foreground">{priceLabel(key)}</span>
                <span className="text-sm text-muted-foreground">
                  {key === "free" ? p.note : "per month"}
                </span>
              </div>
              {key !== "free" ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {formatAmount(
                      pricing,
                      wasAmountFor(pricing, key as PaidPlanKey, interval, onFestivalOffer(key)),
                    )}
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    {onFestivalOffer(key) ? `${festival?.title}` : ""}
                    {onFestivalOffer(key) &&
                    savingPercent(pricing, key as PaidPlanKey, interval, true) !==
                      savingPercent(pricing, "job_hunt", "month", true)
                      ? ""
                      : `${onFestivalOffer(key) ? " - " : ""}Save ${savingPercent(pricing, key as PaidPlanKey, interval, onFestivalOffer(key))}%`}
                  </span>
                </div>
              ) : null}
              <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-2 text-xs font-medium text-primary">{p.bestFor}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {p.paid ? (
                <>
                  <Button
                    className="mt-7"
                    variant={p.highlight ? "default" : "outline"}
                    onClick={() => void onBuy(key)}
                    disabled={
                      switching !== null ||
                      (isSubscribed &&
                        !!p.priceId &&
                        planChangeKind(currentPlan, p.priceId[interval]) === "same")
                    }
                  >
                    {switching === key ? "Updating…" : ctaLabel(key, p.cta)}
                  </Button>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                    Renews automatically every month at the same price until cancelled. Cancel
                    anytime from your account.
                  </p>
                </>
              ) : isCurrent ? (
                <Button className="mt-7" variant="outline" disabled>
                  Your current plan
                </Button>
              ) : (
                <Button asChild className="mt-7" variant="outline">
                  <Link to="/tailor">{p.cta}</Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <section className="tl-cmp mt-16 rounded-2xl border border-border bg-card p-7 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-card-foreground">
          Job Hunt Pack or Career Pro Pack?
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          The difference is simple: <strong className="text-card-foreground">Job Hunt Pack</strong> makes
          each application you send far stronger.{" "}
          <strong className="text-card-foreground">Career Pro Pack</strong> also removes the hours you
          spend hunting for the roles in the first place.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              Job Hunt Pack — {monthlyLabel("job_hunt")}/month
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You find the job. We rewrite your resume and cover letter for it, up to 129 times per
              month, with keyword gaps flagged so it clears the ATS filter. Roughly the cost of one
              coffee a week for as many applications as most job seekers send.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>You do: search and pick the roles</li>
              <li>We do: tailoring, cover letters, keyword gaps, history</li>
            </ul>
          </div>
          <div className="rounded-xl border border-primary p-6">
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              Career Pro Pack — {monthlyLabel("career_pro")}/month
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything above, plus the AI job finder: type your role and filters once, and get a
              single merged list from across job boards — with an email every 3 days at the time
              and timezone you choose containing only listings you haven't seen.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>You do: pick which of the matches to apply to</li>
              <li>We do: everything in Job Hunt Pack, plus finding and delivering fresh roles every 3 days</li>
            </ul>
          </div>
        </div>
      </section>


      <Dialog open={selected !== null && !session} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to buy {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Create a free account first, then you can upgrade to {selectedPlan?.name} in seconds.
            </DialogDescription>
          </DialogHeader>
          <Button asChild className="mt-2 w-full">
            <Link to="/auth" search={{ redirect: "/pricing" }}>
              Sign in or create account
            </Link>
          </Button>
        </DialogContent>
      </Dialog>

      {checkoutElement}
      </div>
    </main>
  );
  }
