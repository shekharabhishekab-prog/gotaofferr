import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
import { TESTING_UNLOCK_ALL_PLANS } from "@/lib/access";
import { isEntitled, tierForPriceId } from "@/lib/plans";

// Monthly ATS checks per plan. -1 = unlimited.
// The checker itself runs in the browser. This file only counts checks per user.
// It never receives a resume, a job description or a report.
const ATS_LIMITS: Record<string, number> = { free: 10, starter: 30, job_hunt: 100, career_pro: -1 };

async function tierFor(context: any): Promise<string> {
  if (TESTING_UNLOCK_ALL_PLANS) return "career_pro";
  const email = (context.claims as any)?.email as string | undefined;
  const { getCompedGrant } = await import("@/lib/access.server");
  const grant = getCompedGrant(email);
  if (grant) return tierForPriceId(grant.priceId);
  const { data } = await context.supabase
    .from("subscriptions")
    .select("status, current_period_end, current_period_start, cancel_at_period_end, price_id")
    .eq("user_id", context.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return isEntitled(data as any) ? tierForPriceId((data as any)?.price_id) : "free";
}

function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export const getAtsUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const tier = await tierFor(context);
      const limit = ATS_LIMITS[tier] ?? ATS_LIMITS.free;
      if (limit < 0) return { used: 0, limit, allowed: true };
      const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
      const { count, error } = await admin
        .from("ats_check_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .gte("created_at", monthStartIso());
      if (error) return { used: 0, limit, allowed: true };
      const used = count ?? 0;
      return { used, limit, allowed: used < limit };
    } catch {
      // Fail open: a counter problem must never block a check.
      return { used: 0, limit: ATS_LIMITS.free, allowed: true };
    }
  });

export const recordAtsCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
      await admin.from("ats_check_log").insert({ user_id: context.userId });
    } catch {
      // Ignore: counting is best effort.
    }
    return { ok: true };
  });
