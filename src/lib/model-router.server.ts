/**
 * Plan-based model routing, daily call counting with an early warning, and
 * automatic fallback. Free-tier Gemini quotas only: nothing here can spend money.
 */

export type RoutingTier = "free" | "starter" | "job_hunt" | "career_pro";

// Daily request caps (requests per day, Pacific-time reset) from the AI Studio rate-limit page.
export const MODEL_DAILY_CAP: Record<string, number> = {
  "gemini-3.5-flash-lite": 500,
  "gemini-3.1-flash-lite": 500,
  "gemini-3.6-flash": 20,
  "gemini-3-flash-preview": 20,
  "gemini-2.5-flash": 20,
};

const FREE_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
// Paid, quality-critical: same-quality-class backups only, NEVER a Lite model.
function proChain(): string[] {
  return ["gemini-3.6-flash", "gemini-3-flash-preview", "gemini-2.5-flash"];
}

export function chainForTier(tier: RoutingTier): string[] {
  return tier === "career_pro" ? proChain() : FREE_CHAIN;
}

export function isQuotaError(error: unknown): boolean {
  const e = error as any;
  const status = e?.statusCode ?? e?.status ?? e?.cause?.statusCode;
  const text = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return (
    status === 429 ||
    text.includes("429") ||
    text.includes("busy right now") ||
    text.includes("resource_exhausted") ||
    text.includes("quota") ||
    text.includes("rate limit")
  );
}

export function pacificDay(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/** Counts one real request to a model. Returns false when the model is over its daily cap. */
export async function countCall(model: string): Promise<boolean> {
  const cap = MODEL_DAILY_CAP[model];
  if (!cap) return true;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const warn = Math.min(50, Math.max(1, Math.ceil(cap * 0.2)));
    const { data, error } = await (supabaseAdmin as any).rpc("bump_ai_model_usage", {
      p_day: pacificDay(),
      p_model: model,
      p_cap: cap,
      p_warn: warn,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row && cap - row.calls <= warn) console.warn(`[ai-usage] ${model} ${row.calls}/${cap} today`);
    return !(row && row.over_cap);
  } catch (e) {
    // Counting must never block a user. Fail open, log it.
    console.error("[ai-usage] counter failed", e);
    return true;
  }
}

export function limitMessage(tier: RoutingTier): string {
  return tier === "career_pro"
    ? "Our best-quality writing engine is at its capacity right now. Your rewrite was not counted. Please try again in a few minutes."
    : "We've reached today's free AI limit. Please try again tomorrow. Your rewrite was not counted.";
}

/** Try each model in the tier's chain; move on only for quota errors. */
export async function runWithModelChain<T>(tier: RoutingTier, fn: (modelId: string) => Promise<T>): Promise<T> {
  const chain = chainForTier(tier);
  let last: unknown = null;
  for (const modelId of chain) {
    try {
      return await fn(modelId);
    } catch (error) {
      if (!isQuotaError(error)) throw error;
      console.warn(`[ai-fallback] ${modelId} out of quota, tier=${tier}`);
      last = error;
    }
  }
  void last;
  throw new Error(limitMessage(tier));
}
