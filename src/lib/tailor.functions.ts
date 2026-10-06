import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import {
  isEntitled,
  tierForPriceId,
  tailorLimitForTier,
  STARTER_MONTHLY_LIMIT,
  JOB_HUNT_MONTHLY_LIMIT,
  CAREER_PRO_MONTHLY_LIMIT,
} from "@/lib/plans";

import { tailorInputSchema, FREE_MONTHLY_LIMIT } from "./tailor-schema";

export { tailoredResumeSchema, FREE_MONTHLY_LIMIT } from "./tailor-schema";
export type { TailoredResume } from "./tailor-schema";

type SubRow = {
  status: string | null;
  current_period_end: string | null;
  current_period_start?: string | null;
  price_id?: string | null;
} | null;

/**
 * Where the quota window starts. Paid users count from the start of their
 * billing period, so rewrites used on the free plan before they subscribed
 * never eat into the plan allowance.
 */
function usageWindowStart(sub: SubRow, monthStart: string): string {
  if (!isEntitled(sub) || !sub?.current_period_start) return monthStart;
  const periodStart = new Date(sub.current_period_start).getTime();
  if (!Number.isFinite(periodStart)) return monthStart;
  return periodStart > new Date(monthStart).getTime() ? new Date(periodStart).toISOString() : monthStart;
}


function isActiveSubscriber(sub: SubRow): boolean {
  // Temporary testing switch — see src/lib/access.ts
  if (TESTING_UNLOCK_ALL_PLANS) return true;
  return isEntitled(sub);
}

async function activeTailorLimit(sub: SubRow, email?: string | null): Promise<number> {
  if (TESTING_UNLOCK_ALL_PLANS) return CAREER_PRO_MONTHLY_LIMIT;
  const { getCompedGrant } = await import("@/lib/access.server");
  const grant = getCompedGrant(email);
  if (grant) return tailorLimitForTier(tierForPriceId(grant.priceId));
  if (isEntitled(sub)) {
    const paid = tailorLimitForTier(tierForPriceId(sub?.price_id));
    if (paid > 0) return paid;
  }
  return FREE_MONTHLY_LIMIT;
}


function limitExceededMessage(limit: number): string {
  if (limit === CAREER_PRO_MONTHLY_LIMIT) {
    return `You've used all ${limit} tailored applications this month. Your allowance resets next billing cycle.`;
  }
  if (limit === JOB_HUNT_MONTHLY_LIMIT) {
    return `You've used all ${limit} resumes this month. Upgrade to Career Pro Pack for ${CAREER_PRO_MONTHLY_LIMIT} a month.`;
  }
  if (limit === STARTER_MONTHLY_LIMIT) {
    return `You've used all ${limit} resumes this month. Upgrade to Job Hunt Pack for ${JOB_HUNT_MONTHLY_LIMIT} a month.`;
  }
  return `You've used all ${limit} free resumes this month. Upgrade to keep tailoring.`;
}


async function loadSubscription(context: any) {
  const { data } = await context.supabase
    .from("subscriptions")
    .select("status, current_period_end, current_period_start, cancel_at_period_end, price_id")
    .eq("user_id", context.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as SubRow;
}

export const getUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { monthStartIso } = await import("./tailor.server");
    const { topupBalance } = await import("@/lib/topups.server");
    const sub = await loadSubscription(context);
    const email = (context.claims as any)?.email as string | undefined;

    const { count, error } = await context.supabase
      .from("tailor_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", usageWindowStart(sub, monthStartIso()));

    if (error) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("getUsage", error, "Could not load your usage right now.");
    }
    const used = count ?? 0;

    const limit = await activeTailorLimit(sub, email);
    // Top-up credits sit on top of the plan allowance and never expire monthly.
    const topup = await topupBalance(context.userId, "tailor");
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used) + topup,
      topup,
    };
  });



const DAILY_TAILOR_ABUSE_GUARD = 40;

export const tailorResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tailorInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { runTailor, monthStartIso } = await import("./tailor.server");
    const { detectCountry } = await import("./resume-locale.server");
    const { enforcePolicy } = await import("@/lib/rate-limit.server");

    // Burst guard on an expensive AI call, on top of the monthly plan quota.
    await enforcePolicy("tailor", context.userId);


    const sub = await loadSubscription(context);
    const email = (context.claims as any)?.email as string | undefined;
    const limit = await activeTailorLimit(sub, email);

    const { getCompedGrant } = await import("@/lib/access.server");
    const grant = getCompedGrant(email);
    const routingTier = grant
      ? tierForPriceId(grant.priceId)
      : isEntitled(sub)
        ? tierForPriceId(sub?.price_id)
        : "free";
    // Abuse guard only: far above normal use (about 7 a day on Career Pro). Protects the shared full-model pool.
    // The run is not counted when this message shows.
    if ((routingTier === "career_pro" || routingTier === "job_hunt") && !grant) {
      const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count: dayCount } = await context.supabase
        .from("tailor_runs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .gte("created_at", dayAgo);
      if ((dayCount ?? 0) >= DAILY_TAILOR_ABUSE_GUARD) {
        throw new Error(
          "Easy there, champ! That's a lot of tailoring for one day. Take a short break and try again later. Not counted.",
        );
      }
    }
    const { count, error: countError } = await context.supabase
      .from("tailor_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", usageWindowStart(sub, monthStartIso()));
    if (countError) throw new Error(countError.message);

    const used = count ?? 0;
    // Plan allowance first; a purchased top-up credit covers the overflow.
    const { consumeTopupCredit, topupBalance } = await import("@/lib/topups.server");
    let usedTopup = false;
    if (used >= limit) {
      usedTopup = await consumeTopupCredit(context.userId, "tailor");
      if (!usedTopup) {
        throw new Error(
          `${limitExceededMessage(limit)} You can also top up instantly from the pricing page.`,
        );
      }
    }

    const result = await runTailor(data, detectCountry(), routingTier);

    const { encryptResult } = await import("@/lib/resume-crypto.server");

    await context.supabase.from("tailor_runs").insert({
      user_id: context.userId,
      company: data.company ?? null,
      role: data.role ?? null,
      match_score: Math.round(result.matchScore),
      // Stored so the user can re-download the same PDFs later from /account.
      // Encrypted at the app layer — a raw DB dump yields ciphertext only.
      result: (await encryptResult(JSON.parse(JSON.stringify(result)))) as never,
    });

    if (process.env["MAX_SAVED_RESUMES"]) {
      const cap = Math.max(1, parseInt(process.env["MAX_SAVED_RESUMES"] as string, 10) || 10);
      const { data: keep } = await context.supabase
        .from("tailor_runs")
        .select("id")
        .eq("user_id", context.userId)
        .not("result", "is", null)
        .order("created_at", { ascending: false })
        .range(cap, cap + 200);
      const stale = (keep ?? []).map((r: { id: string }) => r.id);
      if (stale.length) {
        // Keep the row (monthly usage is counted from rows) but drop the saved resume body.
        await context.supabase
          .from("tailor_runs")
          .update({ result: null as never })
          .in("id", stale)
          .eq("user_id", context.userId);
      }
    }

    const nextUsed = used + 1;
    const topup = await topupBalance(context.userId, "tailor");
    return {
      result,
      usage: {
        used: nextUsed,
        limit,
        remaining: Math.max(0, limit - nextUsed) + topup,
        topup,
      },
    };

  });


