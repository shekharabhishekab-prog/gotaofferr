import { getStripeEnvironment } from "@/lib/stripe";
import { isEntitled, tierForPriceId, type PlanTier } from "@/lib/plans";

type Ctx = { supabase: any; userId: string; claims?: any };

export async function tierFor(ctx: Ctx): Promise<PlanTier> {
  const { getCompedGrant } = await import("@/lib/access.server");
  const grant = getCompedGrant(ctx.claims?.email);
  if (grant) return tierForPriceId(grant.priceId);
  const { data: sub } = await ctx.supabase
    .from("subscriptions")
    .select("status, current_period_end, current_period_start, price_id, cancel_at_period_end")
    .eq("user_id", ctx.userId)
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return isEntitled(sub) ? tierForPriceId(sub?.price_id) : "free";
}
