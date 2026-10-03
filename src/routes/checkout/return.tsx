import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { syncSubscription } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    subscription_id:
      typeof search.subscription_id === "string" ? search.subscription_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment complete — GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Your payment was completed successfully. Start tailoring your resume." },
      { property: "og:title", content: "Payment complete — GotaOfferr" },
      { property: "og:description", content: "Your payment was completed successfully. Start tailoring your resume." },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId, subscription_id: subscriptionId } = Route.useSearch();
  const { session } = useSession();
  const sync = useServerFn(syncSubscription);
  const [state, setState] = useState<"syncing" | "active" | "pending">("syncing");

  // Pull the subscription straight from Razorpay instead of waiting on the
  // webhook, so the plan is live the moment this page renders. Retries a few
  // times in case Razorpay is still finalising the subscription.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        try {
          const res = await sync({
            data: { environment: getStripeEnvironment(), subscriptionId: subscriptionId ?? sessionId },
          });
          if (cancelled) return;
          if (res.synced && (res.status === "active" || res.status === "trialing")) {
            setState("active");
            return;
          }
        } catch {
          // Retry below.
        }
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
      if (!cancelled) setState("pending");
    })();

    return () => {
      cancelled = true;
    };
  }, [session, sessionId, subscriptionId, sync]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      {state === "syncing" ? (
        <Loader2 className="size-16 animate-spin text-primary" />
      ) : (
        <CheckCircle2 className="size-16 text-primary" />
      )}
      <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
        {state === "syncing" ? "Activating your plan" : "You're all set"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {state === "syncing"
          ? "Confirming your payment and unlocking your plan…"
          : state === "active"
            ? "Your subscription is active. Start tailoring your resume."
            : "Your payment went through. Your plan will unlock within a few minutes — refresh your account page if it hasn't."}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild disabled={state === "syncing"}>
          <Link to="/tailor">Tailor my resume</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/account">View account</Link>
        </Button>
      </div>
    </main>
  );
}
