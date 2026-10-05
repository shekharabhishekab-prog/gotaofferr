import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
import { BUILDER_MONTHLY_LIMIT, isEntitled, tierForPriceId, type PlanTier } from "@/lib/plans";

type Ctx = { supabase: any; userId: string; claims?: any };

async function tierFor(ctx: Ctx): Promise<PlanTier> {
  return (await import("@/lib/tier.server")).tierFor(ctx);
}

function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function usedThisMonth(userId: string): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await (supabaseAdmin as any)
    .from("builder_uses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", (await (await import("@/lib/usage-window.server")).usageSince(supabaseAdmin as any, userId)));
  return count ?? 0;
}

/** Resume builder allowance for the signed-in member (monthly). */
export const getBuilderUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const tier = await tierFor(ctx);
    const limit = BUILDER_MONTHLY_LIMIT[tier];
    const used = await usedThisMonth(ctx.userId);
    return { tier, limit, used, remaining: Math.max(0, limit - used) };
  });

/**
 * Called when a member downloads a built resume. One download = one resume
 * against the monthly allowance. Refuses (without counting) once it is used up.
 */
export const spendBuilderResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const tier = await tierFor(ctx);
    const limit = BUILDER_MONTHLY_LIMIT[tier];
    const used = await usedThisMonth(ctx.userId);
    if (used >= limit) {
      return { ok: false as const, tier, limit, used };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("builder_uses").insert({ user_id: ctx.userId });
    if (error) {
      console.error("[builder-usage] insert failed", error);
      // Never block a download on a counting failure.
    }
    return { ok: true as const, tier, limit, used: used + 1 };
  });
