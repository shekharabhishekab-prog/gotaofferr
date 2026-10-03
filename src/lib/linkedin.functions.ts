import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import { isEntitled, tierForPriceId } from "@/lib/plans";
import { getStripeEnvironment } from "@/lib/stripe";

import { linkedinInputSchema } from "./linkedin-schema";

/**
 * Free LinkedIn review — no login, matching the free-to-try tailoring flow.
 * Protected like the other public, cost-bearing endpoints: Turnstile bot gate,
 * a site-wide daily cap that survives IP rotation, and a per-IP rate limit.
 */
export const reviewLinkedInProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => linkedinInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
    const { verifyTurnstile } = await import("./turnstile.server");
    const { reviewProfileFree } = await import("./linkedin.server");

    const ip = clientIp(getRequest());
    await verifyTurnstile(data.turnstileToken, ip);
    await enforcePolicy("linkedin_review_global", "site");
    await enforcePolicy("linkedin_review", ip);

    const { turnstileToken: _token, ...input } = data;
    return { review: await reviewProfileFree(input) };
  });

/**
 * Paid LinkedIn report — keyword alignment, industry advice and the rewritten
 * About + experience sections. Gated to the same paid packs that already sell
 * the "LinkedIn About rewrite" feature.
 */
export const reviewLinkedInProfilePro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => linkedinInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const { getCompedGrant } = await import("@/lib/access.server");
    const { reviewProfilePro } = await import("./linkedin.server");

    const ctx = context as { supabase: any; userId: string; claims?: any };

    let allowed = TESTING_UNLOCK_ALL_PLANS;
    if (!allowed) {
      const grant = getCompedGrant(ctx.claims?.email);
      const grantTier = grant ? tierForPriceId(grant.priceId) : "free";
      allowed = grantTier === "job_hunt" || grantTier === "career_pro";
    }
    if (!allowed) {
      const { data: sub } = await ctx.supabase
        .from("subscriptions")
        .select("status, current_period_end, price_id, cancel_at_period_end")
        .eq("user_id", ctx.userId)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const tier = tierForPriceId(sub?.price_id);
      allowed = isEntitled(sub) && (tier === "job_hunt" || tier === "career_pro");
    }

    if (!allowed) {
      throw new Error(
        "The full LinkedIn report is part of Job Hunt Pack and Career Pro Pack. Upgrade to unlock keyword alignment and the rewritten experience section.",
      );
    }

    await enforcePolicy("linkedin_review", ctx.userId);

    const { turnstileToken: _token, ...input } = data;
    return { pro: await reviewProfilePro(input) };
  });
