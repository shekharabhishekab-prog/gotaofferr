import { getStripeEnvironment } from "@/lib/stripe";
import { isEntitled } from "@/lib/plans";

/**
 * Where a member's usage window starts: the later of the calendar month start
 * and their current billing period start. An upgrade starts a new subscription,
 * so its period start is the upgrade moment and usage begins again from zero.
 */
export async function usageSince(supabase: any, userId: string): Promise<string> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  try {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, current_period_start, price_id, cancel_at_period_end")
      .eq("user_id", userId)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!isEntitled(sub) || !sub?.current_period_start) return monthStart;
    const ps = new Date(sub.current_period_start).getTime();
    if (!Number.isFinite(ps)) return monthStart;
    return ps > new Date(monthStart).getTime() ? new Date(ps).toISOString() : monthStart;
  } catch {
    return monthStart;
  }
}
