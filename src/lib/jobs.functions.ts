import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import {
  hasCareerPro,
  isEntitled,
  tierForPriceId,
  FREE_JOB_SEARCH_TRIALS,
  JOB_ALERT_LIMIT,
  JOB_SEARCH_MONTHLY_LIMIT,
  monthlyJobSearchLimit,
} from "@/lib/plans";
import { jobAlertInputSchema, jobSearchInputSchema } from "./jobs-schema";
import type { JobListing } from "./jobs-schema";

type Ctx = { supabase: any; userId: string; claims?: any };

async function loadSubscription(context: Ctx) {
  const { data } = await context.supabase
    .from("subscriptions")
    .select("status, current_period_end, current_period_start, price_id, cancel_at_period_end")
    .eq("user_id", context.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Start of the current allowance window: billing period for paid, month for trial. */
function searchWindowStart(sub: any): string {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  if (!isEntitled(sub) || !sub?.current_period_start) return monthStart;
  const periodStart = new Date(sub.current_period_start).getTime();
  if (!Number.isFinite(periodStart)) return monthStart;
  return periodStart > new Date(monthStart).getTime() ? new Date(periodStart).toISOString() : monthStart;
}

async function countSearches(context: Ctx, since?: string): Promise<number> {
  let query = context.supabase
    .from("job_search_runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.userId);
  if (since) query = query.gte("created_at", since);
  const { count } = await query;
  return count ?? 0;
}

/**
 * A search done as a signed-out guest counts against the Free allowance after
 * sign-up. The guest use is tied to the browser cookie set at that search and
 * only counts inside the current Free window (this month).
 */
async function guestSearchesUsed(since: string): Promise<number> {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    const { ANON_COOKIE, hashValue } = await import("./anon-tailor.server");
    const cookieId = getCookie(ANON_COOKIE);
    if (!cookieId) return 0;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("anonymous_tailor_uses")
      .select("id")
      .eq("device_hash", "jobs:" + hashValue(cookieId))
      .gte("created_at", since)
      .limit(1);
    return data && data.length ? 1 : 0;
  } catch {
    return 0;
  }
}

/**
 * Job finder access. Career pro members get JOB_SEARCH_MONTHLY_LIMIT searches
 * per billing period; everyone else gets FREE_JOB_SEARCH_TRIALS lifetime trial
 * searches so they can see what the feature does before paying.
 */
async function assertCanSearch(context: Ctx): Promise<{ pro: boolean; used: number; limit: number }> {
  if (TESTING_UNLOCK_ALL_PLANS) return { pro: true, used: 0, limit: JOB_SEARCH_MONTHLY_LIMIT };
  const { isCompedCareerPro } = await import("@/lib/access.server");
  const { consumeTopupCredit } = await import("@/lib/topups.server");
  const comped = isCompedCareerPro(context.claims?.email);
  const sub = comped ? null : await loadSubscription(context);
  const pro = comped || hasCareerPro(sub);
  const paidLimit = comped ? JOB_SEARCH_MONTHLY_LIMIT : monthlyJobSearchLimit(sub);

  if (paidLimit > 0) {
    const used = await countSearches(context, searchWindowStart(sub));
    if (used >= paidLimit) {
      // A purchased search top-up covers the overflow before we refuse.
      if (await consumeTopupCredit(context.userId, "job_search")) {
        return { pro, used, limit: paidLimit };
      }
      throw new Error(
        `You've used all ${paidLimit} job searches for this billing period. Your allowance resets next cycle — or top up instantly from the pricing page.`,
      );
    }
    return { pro, used, limit: paidLimit };
  }

  const freeSince = searchWindowStart(null);
  const used = (await countSearches(context, freeSince)) + (await guestSearchesUsed(freeSince));
  if (used >= FREE_JOB_SEARCH_TRIALS) {
    if (await consumeTopupCredit(context.userId, "job_search")) {
      return { pro: false, used, limit: FREE_JOB_SEARCH_TRIALS };
    }
    throw new Error(
      "You have used your free job searches for this month. Upgrade to Starter for 5 a month, or buy a search top-up.",
    );
  }
  return { pro: false, used, limit: FREE_JOB_SEARCH_TRIALS };
}

/** How many searches this account has left, for the UI. */
export const getJobSearchUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    if (TESTING_UNLOCK_ALL_PLANS) {
      return {
        tier: "career_pro" as const,
        pro: true,
        used: 0,
        limit: JOB_SEARCH_MONTHLY_LIMIT,
        remaining: JOB_SEARCH_MONTHLY_LIMIT,
        topup: 0,
      };
    }
    const { isCompedCareerPro } = await import("@/lib/access.server");
    const { topupBalance } = await import("@/lib/topups.server");
    const comped = isCompedCareerPro(ctx.claims?.email);
    const sub = comped ? null : await loadSubscription(ctx);
    const paidLimit = comped ? JOB_SEARCH_MONTHLY_LIMIT : monthlyJobSearchLimit(sub);
    const used = paidLimit > 0
      ? await countSearches(ctx, searchWindowStart(sub))
      : (await countSearches(ctx, searchWindowStart(null))) + (await guestSearchesUsed(searchWindowStart(null)));
    const limit = paidLimit > 0 ? paidLimit : FREE_JOB_SEARCH_TRIALS;
    const topup = await topupBalance(ctx.userId, "job_search");
    const tier = comped ? "career_pro" : isEntitled(sub) ? tierForPriceId(sub?.price_id) : "free";
    return {
      tier: tier as "free" | "starter" | "job_hunt" | "career_pro",
      pro: paidLimit > 0,
      used: Math.min(used, limit),
      limit,
      remaining: Math.max(0, limit - used) + topup,
      topup,
    };
  });


async function requireCareerPro(context: Ctx) {
  // Temporary testing switch — see src/lib/access.ts
  if (TESTING_UNLOCK_ALL_PLANS) return;
  const { isCompedCareerPro } = await import("@/lib/access.server");
  if (isCompedCareerPro(context.claims?.email)) return;

  const { data: sub } = await context.supabase
    .from("subscriptions")
    .select("status, current_period_end, price_id, cancel_at_period_end")
    .eq("user_id", context.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!hasCareerPro(sub)) {
    const { userError } = await import("@/lib/safe-error.server");
    throw userError("The AI job finder is part of Career Pro Pack. Upgrade to unlock it.");
  }
}



export const searchJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobSearchInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ jobs: JobListing[] } | { error: string }> => {
    try {
      await assertCanSearch(context as unknown as Ctx);
      const { enforcePolicy } = await import("@/lib/rate-limit.server");
      await enforcePolicy("job-search", context.userId);
      const { searchJobListings } = await import("./jobs.server");
      const ctx = context as unknown as Ctx;
      const { getCompedGrant } = await import("@/lib/access.server");
      const grant = getCompedGrant(ctx.claims?.email);
      const sub = grant ? null : await loadSubscription(ctx);
      const tier = grant ? tierForPriceId(grant.priceId) : isEntitled(sub) ? tierForPriceId(sub?.price_id) : "free";
      let country: string | null = null;
      try {
        const { getRequest } = await import("@tanstack/react-start/server");
        const c = getRequest().headers.get("cf-ipcountry");
        country = c && /^[A-Za-z]{2}$/.test(c) ? c : null;
      } catch {
        /* no request context */
      }
      const jobs = await searchJobListings(data, { tier: tier as any, country });

      // Recorded after a successful run so a failed search costs nothing.
      await context.supabase.from("job_search_runs").insert({
        user_id: context.userId,
        role: data.role,
        location: data.location ?? null,
      });

      return { jobs };

    } catch (error) {
      const { safeErrorMessage } = await import("@/lib/safe-error.server");
      return { error: safeErrorMessage("searchJobs", error, "Job search failed. Please try again.") };
    }
  });

export const getJobAlert = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("job_alerts")
      .select(
        "id, role, location, remote_only, experience, salary_range, extra_filters, local_hour, timezone, enabled, last_sent_at, last_jobs, last_job_count",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { alert: data ?? null };
  });

function alertMonthStartIso(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)).toISOString();
}

export const getAlertUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { tierFor } = await import("@/lib/tier.server");
    const { ALERT_ATTEMPT_LIMIT } = await import("@/lib/plans");
    const tier = await tierFor(context as unknown as Ctx);
    const { count } = await context.supabase
      .from("job_alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", await (await import("@/lib/usage-window.server")).usageSince(context.supabase, context.userId));
    const limit = ALERT_ATTEMPT_LIMIT[tier];
    const used = count ?? 0;
    return { tier, limit, used, remaining: Math.max(0, limit - used) };
  });

/**
 * Each click on "Set alert" starts one alert cycle: 3 emails, 3 days apart, then it
 * ends. Cycles are counted per calendar month against the plan's alert allowance.
 * Turning an alert off only stops the current cycle (it does not give the click back).
 */
export const saveJobAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobAlertInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { safeErrorMessage } = await import("@/lib/safe-error.server");
    const { tierFor } = await import("@/lib/tier.server");
    const { ALERT_ATTEMPT_LIMIT, PLAN_LABEL, nextTier } = await import("@/lib/plans");
    let tier: Awaited<ReturnType<typeof tierFor>>;
    try {
      const { enforcePolicy } = await import("@/lib/rate-limit.server");
      await enforcePolicy("job-alert-write", context.userId);
      tier = await tierFor(context as unknown as Ctx);
    } catch (error) {
      return { error: safeErrorMessage("saveJobAlert.gate", error, "Not allowed") };
    }

    const { data: current } = await context.supabase
      .from("job_alerts")
      .select("id")
      .eq("user_id", context.userId)
      .eq("enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Turning off: stop the running cycle, nothing else.
    if (!data.enabled) {
      if (current) await context.supabase.from("job_alerts").update({ enabled: false }).eq("id", current.id);
      return { ok: true as const, firstEmailSent: false, stopped: true as const };
    }

    const { count } = await context.supabase
      .from("job_alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", await (await import("@/lib/usage-window.server")).usageSince(context.supabase, context.userId));
    const limit = ALERT_ATTEMPT_LIMIT[tier];
    if ((count ?? 0) >= limit) {
      const up = nextTier(tier);
      return {
        error: `You have used all ${limit} job alert${limit === 1 ? "" : "s"} for this month on the ${PLAN_LABEL[tier]} plan.${
          up ? ` ${PLAN_LABEL[up]} gives you ${ALERT_ATTEMPT_LIMIT[up]}.` : ""
        } Your count resets next month.`,
      };
    }

    const row = {
      user_id: context.userId,
      role: data.role,
      location: data.location ?? null,
      remote_only: data.remoteOnly ?? false,
      experience: data.experience ?? null,
      salary_range: data.salaryRange ?? null,
      extra_filters: data.extraFilters ?? null,
      local_hour: data.localHour,
      timezone: data.timezone,
      enabled: true,
      emails_sent: 0,
    };

    // One running cycle at a time: a new click replaces the old cycle.
    if (current) await context.supabase.from("job_alerts").update({ enabled: false }).eq("id", current.id);

    const { data: saved, error } = await context.supabase.from("job_alerts").insert(row).select("id").maybeSingle();
    if (error || !saved) {
      return { error: safeErrorMessage("saveJobAlert", error, "Could not save this alert. Please try again.") };
    }

    // Email 1 goes out right away; emails 2 and 3 follow every 3 days.
    try {
      const { sendDigestForAlert } = await import("@/lib/job-alert-digest.server");
      const result = await sendDigestForAlert(
        { ...row, id: saved.id as string, last_sent_at: null },
        { minJobs: 1 },
      );
      return { ok: true as const, firstEmailSent: result.sent };
    } catch (sendError) {
      console.error("First job alert digest failed:", sendError);
      return { ok: true as const, firstEmailSent: false };
    }
  });

/** The jobs included in the most recent alert email — shown in the in-app popup. */
export const getAlertDigest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("job_alerts")
      .select("role, location, experience, salary_range, last_jobs, last_sent_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const jobs = Array.isArray(data?.last_jobs) ? (data!.last_jobs as JobListing[]) : [];
    return {
      jobs,
      sentAt: data?.last_sent_at ?? null,
      criteria: data
        ? {
            role: data.role as string,
            location: (data.location as string | null) ?? null,
            experience: (data.experience as string | null) ?? null,
            salaryRange: (data.salary_range as string | null) ?? null,
          }
        : null,
    };
  });


