/**
 * Plan-based model routing, daily call counting with an early warning, and
 * automatic fallback. Free-tier Gemini quotas only: nothing here can spend money.
 */

export type RoutingTier = "free" | "starter" | "job_hunt" | "career_pro";

// Daily request caps (requests per day, Pacific-time reset) from the AI Studio rate-limit page.
export const MODEL_DAILY_CAP: Record<string, number> = {
  "cf-melotts": 490,
  // Azure Speech F0 backup voice. F0 stops at 500K characters a month; 140 calls x ~100 chars x 31 days stays under it.
  "azure-speech": 140,
  "gemini-3.5-flash-lite": 500,
  "gemini-3.1-flash-lite": 500,
  "gemini-3.6-flash": 20,
  "gemini-3-flash-preview": 20,
  "gemini-2.5-flash": 20,
  "gemini-3.8-flash": 20,
  "gemini-3.7-flash": 20,
  "gemini-3.5-flash": 20,
  // Only 20/day on the free tier (AI Studio 2026-10-09): a small buffer, not a main lite model.
  "gemini-2.5-flash-lite": 20,
  // Adzuna free tier: 250/day, 2,500/month. Our own cap sits under both.
  // Voice for the interview room. Google free tier shows 10 requests/day for this model (AI Studio 2026-10-11).
  "gemini-3.1-flash-tts-preview": 10,
  "adzuna-search": 65,
  // Firecrawl searches are only counted for visibility (cap never reached).
  "firecrawl-search": 100000,
};

const FREE_CHAIN = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
// Strong models (~20/day each on the free tier). Order set after the 2026-10-09 quality test: fast and reliable first, slow or often-overloaded last.
// The 20/day lite buffer comes last in this list, then the two 500/day lite models from FREE_CHAIN.
function proChain(): string[] {
  return [
    "gemini-3.6-flash",
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
  ];
}

export function chainForTier(tier: RoutingTier): string[] {
  // Career Pro only gets the full-quality models. Free, Starter and Job Hunt use the lower models.
  // Career Pro tries the strong models first; when their daily limits run out it switches to
  // the lower models (never "come back tomorrow"). Output on those is tuned to match.
  return tier === "career_pro" ? [...proChain(), ...FREE_CHAIN] : FREE_CHAIN;
}

export function isQuotaError(error: unknown): boolean {
  const e = error as any;
  const status = e?.statusCode ?? e?.status ?? e?.cause?.statusCode;
  const text = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return (
    status === 429 ||
    // Overloaded or retired model: the next model in the chain should answer instead of failing the run.
    status === 503 ||
    status === 404 ||
    text.includes("429") ||
    text.includes("503") ||
    text.includes("high demand") ||
    text.includes("overloaded") ||
    text.includes("unavailable") ||
    text.includes("no longer available") ||
    text.includes("busy right now") ||
    text.includes("resource_exhausted") ||
    text.includes("quota") ||
    text.includes("rate limit") ||
    // A call that never answered (our own timeout) also hands over to the next model.
    e?.name === "TimeoutError" ||
    e?.name === "AbortError" ||
    text.includes("aborted due to timeout") ||
    text.includes("timed out")
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
      p_day: model.startsWith("cf-") ? new Date().toISOString().slice(0, 10) : pacificDay(),
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

export function limitMessage(_tier: RoutingTier): string {
  return "Too many job hunters, one very tired AI. Give it a few minutes - this one wasn't counted.";
}

const BAD_UNTIL = new Map<string, number>();

/** Try each model in the tier's chain; move on only for quota errors. */
export const CEREBRAS_MODEL = "cerebras:gpt-oss-120b";

export async function runWithModelChain<T>(tier: RoutingTier, fn: (modelId: string) => Promise<T>, opts?: { cerebrasFirst?: boolean }): Promise<T> {
  // Cerebras goes first only when asked for and only when its key exists; otherwise the Gemini chain runs exactly as before.
  const withCerebras = !!opts?.cerebrasFirst && !!process.env.CEREBRAS_API_KEY;
  const full = withCerebras ? [CEREBRAS_MODEL, ...chainForTier(tier)] : chainForTier(tier);
  // A model that just failed (overload, timeout, cap) is skipped for 3 minutes so the next user does not wait through it again.
  const now = Date.now();
  const live = full.filter((id) => (BAD_UNTIL.get(id) ?? 0) <= now);
  const chain = live.length > 0 ? live : full;
  let last: unknown = null;
  let cbDebug = "";
  for (const modelId of chain) {
    const t0 = Date.now();
    try {
      const out = await fn(modelId);
      (globalThis as any).__cbDebug = cbDebug;
      (globalThis as any).__cbModel = modelId; // TEMP DEBUG
      console.log(`[ai-time] ${modelId} ok ${((Date.now() - t0) / 1000).toFixed(1)}s tier=${tier}`);
      return out;
    } catch (error) {
      console.warn(`[ai-time] ${modelId} fail ${((Date.now() - t0) / 1000).toFixed(1)}s tier=${tier}`);
      if (modelId === CEREBRAS_MODEL) cbDebug = `${(error as Error)?.name}: ${String((error as Error)?.message ?? error).slice(0, 300)}`;
      // Any Cerebras failure hands over to the Gemini chain. Gemini models keep the old rule (only quota/overload moves on).
      if (modelId !== CEREBRAS_MODEL && !isQuotaError(error)) throw error;
      BAD_UNTIL.set(modelId, Date.now() + 180_000);
      console.warn(`[ai-fallback] ${modelId} out of quota, tier=${tier}`);
      last = error;
    }
  }
  void last;
  // TEMP DEBUG (preview only, remove before merge): show why Cerebras failed.
  throw new Error(limitMessage(tier) + (cbDebug ? ` [DEBUG cerebras: ${cbDebug}]` : ""));
}


// preview redeploy marker 1
