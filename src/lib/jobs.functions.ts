import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import {
  hasCareerPro,
  isEntitled,
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

  const used = await countSearches(context);
  if (used >= FREE_JOB_SEARCH_TRIALS) {
    if (await consumeTopupCredit(context.userId, "job_search")) {
      return { pro: false, used, limit: FREE_JOB_SEARCH_TRIALS };
    }
    throw new Error(
      "You've used your free job finder search. Upgrade to Career Pro Pack for 30 searches a month plus daily alerts, or buy a search top-up.",
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
    const used = paidLimit > 0 ? await countSearches(ctx, searchWindowStart(sub)) : await countSearches(ctx);
    const limit = paidLimit > 0 ? paidLimit : FREE_JOB_SEARCH_TRIALS;
    const topup = await topupBalance(ctx.userId, "job_search");
    return {
      pro: paidLimit > 0,
      used,
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
      const jobs = await searchJobListings(data);

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

export const saveJobAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobAlertInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { safeErrorMessage } = await import("@/lib/safe-error.server");
    try {
      await requireCareerPro(context as unknown as Ctx);
      const { enforcePolicy } = await import("@/lib/rate-limit.server");
      await enforcePolicy("job-alert-write", context.userId);
    } catch (error) {
      return { error: safeErrorMessage("saveJobAlert.gate", error, "Not allowed") };
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
      enabled: data.enabled,
    };

    const { data: existing } = await context.supabase
      .from("job_alerts")
      .select(
        "id, role, location, remote_only, experience, salary_range, extra_filters, local_hour, timezone, enabled",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Cap only applies to brand-new alerts; editing an existing one is fine.
    if (!existing) {
      const { count: alertCount } = await context.supabase
        .from("job_alerts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId);
      // Purchased alert slots raise the cap while they are still valid.
      const { topupBalance } = await import("@/lib/topups.server");
      const extraSlots = await topupBalance(context.userId, "job_alert");
      const cap = JOB_ALERT_LIMIT + extraSlots;
      if ((alertCount ?? 0) >= cap) {
        return {
          error: `You can keep up to ${cap} saved job alerts. Buy an extra alert slot from the pricing page to add more.`,
        };
      }
    }


    const alertChanged =
      !!existing &&
      (existing.role !== row.role ||
        existing.location !== row.location ||
        existing.remote_only !== row.remote_only ||
        existing.experience !== row.experience ||
        existing.salary_range !== row.salary_range ||
        existing.extra_filters !== row.extra_filters ||
        existing.local_hour !== row.local_hour ||
        existing.timezone !== row.timezone ||
        (!existing.enabled && row.enabled));

    // A materially changed or newly re-enabled alert is a new request. Clear
    // the previous daily marker so it can send at the next scheduled check.
    const updateRow = alertChanged
      ? { ...row, last_sent_at: null, last_jobs: [], last_job_count: 0 }
      : row;

    const query = existing
      ? context.supabase.from("job_alerts").update(updateRow).eq("id", existing.id).select("id")
      : context.supabase.from("job_alerts").insert(row).select("id");

    const { data: saved, error } = await query.maybeSingle();
    if (error) {
      const { safeErrorMessage } = await import("@/lib/safe-error.server");
      return { error: safeErrorMessage("saveJobAlert", error, "Could not save this alert. Please try again.") };
    }

    // Send the first digest right away when the alert is switched on or its
    // filters change — otherwise the user waits until the next scheduled hour
    // and assumes the alert is broken.
    if (row.enabled && (!existing || alertChanged || !existing.enabled)) {
      try {
        const { sendDigestForAlert } = await import("@/lib/job-alert-digest.server");
        const result = await sendDigestForAlert(
          {
            id: (saved?.id as string) ?? (existing?.id as string),
            user_id: context.userId,
            role: row.role,
            location: row.location,
            remote_only: row.remote_only,
            experience: row.experience,
            salary_range: row.salary_range,
            extra_filters: row.extra_filters,
            local_hour: row.local_hour,
            timezone: row.timezone,
            last_sent_at: null,
          },
          { minJobs: 1 },
        );
        return { ok: true as const, firstEmailSent: result.sent };
      } catch (sendError) {
        console.error("First job alert digest failed:", sendError);
        return { ok: true as const, firstEmailSent: false };
      }
    }

    return { ok: true as const, firstEmailSent: false };
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

