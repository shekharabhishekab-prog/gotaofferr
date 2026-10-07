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
    tagline: "Try it on your next three applications.",
    bestFor: "Best for: testing whether tailoring actually gets you replies.",
    features: [
      "3 resume + cover letter tailorings per month",
      "3 resumes in the resume builder",
      "1 AI job finder search per month",
      "1 job alert (3 emails, every 3 days)",
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
      "Resume builder: build a resume from scratch and download it as a PDF",
      "12 resumes in the resume builder",
      "5 AI job finder searches per month",
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
      "Resume builder: build a resume from scratch and download it as a PDF",
      "20 resumes in the resume builder",
      "10 AI job finder searches per month",
      "5 job alerts (3 emails each, every 3 days)",
      "Keyword gap insights — see exactly which words are missing",
      "Saved master resume, so you never re-upload",
      "Rewrite history: every resume you've generated, re-downloadable",
      "Choose your resume template and accent",
      "Cover letter tone: concise, confident or impact-led",
      "LinkedIn 'About' rewrite from your master resume",
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
      "Resume builder: build a resume from scratch and download it as a PDF",
      "50 resumes in the resume builder",
      "30 AI job finder searches per month - one clean list across every board",
      "7 job alerts (3 emails each, every 3 days)",
      "Everything else in Job Hunt Pack — history, keyword gaps, templates, LinkedIn About",
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
    <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">Pricing</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Plans are priced by how many tailored applications you send — and whether you want the AI to
        find the jobs for you too. Try it free, upgrade only while you're actively applying, cancel
        any time. Prices shown in {pricing.code} for your region; payment is processed securely by
        Razorpay and charged in {pricing.code}, with taxes calculated at checkout. International
        cards, bank transfers (ACH, SEPA, CHAPS, SWIFT) and local methods like Trustly, GiroPay and
        SofortPay are supported, alongside UPI, netbanking and wallets in India.
      </p>
      <p className="mt-4 max-w-2xl rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-card-foreground">
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
              className={`relative flex flex-col rounded-2xl border p-7 ${
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

      <section className="mt-16 rounded-2xl border border-border bg-card p-7 sm:p-10">
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
              <li>We do: tailoring, cover letters, LinkedIn About, keyword gaps, history</li>
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
    </main>
  );
}
