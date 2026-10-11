import { getStripeEnvironment } from "@/lib/stripe";
import { isEntitled, tierForPriceId } from "@/lib/plans";
import { INTERVIEW_MONTHLY_LIMIT, interviewLimitMessage, type InterviewTier } from "@/lib/interview-limits";

type Ctx = { supabase: any; userId: string; claims?: any };

async function tierFor(ctx: Ctx): Promise<{ tier: InterviewTier; since: string }> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const email = ctx.claims?.email as string | undefined;
  const { getCompedGrant } = await import("@/lib/access.server");
  const grant = getCompedGrant(email);
  if (grant) return { tier: tierForPriceId(grant.priceId) as InterviewTier, since: monthStart };
  const { data: sub } = await ctx.supabase
    .from("subscriptions")
    .select("status, current_period_end, current_period_start, cancel_at_period_end, price_id")
    .eq("user_id", ctx.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (isEntitled(sub)) {
    const tier = tierForPriceId(sub?.price_id) as InterviewTier;
    const ps = sub?.current_period_start ? new Date(sub.current_period_start).getTime() : NaN;
    const since = Number.isFinite(ps) && ps > new Date(monthStart).getTime() ? new Date(ps).toISOString() : monthStart;
    return { tier, since };
  }
  return { tier: "free", since: monthStart };
}

/** Throws a clear message when the user has used all interviews their plan allows this month. */
export async function assertInterviewAllowed(ctx: Ctx): Promise<void> {
  const { tier, since } = await tierFor(ctx);
  const limit = INTERVIEW_MONTHLY_LIMIT[tier] ?? INTERVIEW_MONTHLY_LIMIT.free;
  const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
  const { count, error } = await admin
    .from("interview_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .gte("created_at", since);
  if (error) throw new Error("Could not check your interview allowance. Please try again.");
  if ((count ?? 0) >= limit) throw new Error(interviewLimitMessage(tier in INTERVIEW_MONTHLY_LIMIT ? tier : "free"));
}
