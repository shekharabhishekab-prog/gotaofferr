import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * AI provider.
 * Default (GEMINI_API_KEY not set): Lovable AI gateway, exactly as before.
 * Independent copy (GEMINI_API_KEY set): Google AI Studio via its OpenAI-compatible
 * endpoint. Optional GEMINI_MODEL overrides the model id for every call.
 */
export function createLovableAiGatewayProvider(lovableApiKey: string, forceModel?: string) {
  // Cerebras gpt-oss-120b, the owner-approved primary for Tailor/Builder/Interview
  // (decision 2026-10-13, soak-verified 2026-10-15: 18/18 ok, p50 ~0.9s vs Gemini 40-50s).
  // Chains name it "cerebras-gpt-oss-120b"; the API itself expects "gpt-oss-120b".
  if (forceModel?.startsWith("cerebras-")) {
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    if (!cerebrasKey) {
      // chainForTier only offers Cerebras when the key exists; if we still land here,
      // fail like a quota error so the chain moves on to Gemini.
      throw new Error("cerebras overloaded: CEREBRAS_API_KEY not set (resource_exhausted)");
    }
    const provider = createOpenAICompatible({
      name: "cerebras",
      baseURL: "https://api.cerebras.ai/v1",
      supportsStructuredOutputs: true,
      apiKey: cerebrasKey,
      fetch: async (input: any, init?: any) => {
        try {
          const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
          const model = body?.model as string | undefined;
          if (model) {
            const { countCall } = await import("./model-router.server");
            if (!(await countCall(model))) {
              return new Response(JSON.stringify({ error: { code: 429, message: "daily quota reached (resource_exhausted)", status: "RESOURCE_EXHAUSTED" } }), {
                status: 429,
                headers: { "content-type": "application/json" },
              });
            }
          }
        } catch {
          /* never block on counting */
        }
        // Cerebras answers in ~1s; 30s is the owner's bar. Beyond that the chain moves on.
        const bar = AbortSignal.timeout(30_000);
        init = { ...init, signal: init?.signal ? AbortSignal.any([init.signal, bar]) : bar };
        return fetch(input, init);
      },
    });
    const model = process.env.CEREBRAS_MODEL || "gpt-oss-120b";
    const wrapped = ((_modelId: string) => provider(model)) as typeof provider;
    return Object.assign(wrapped, provider);
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      // Required so structured output sends a strict json_schema the model must follow.
      supportsStructuredOutputs: true,
      headers: {
        "Lovable-API-Key": lovableApiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });
  }

  const provider = createOpenAICompatible({
    name: "google-ai-studio",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    supportsStructuredOutputs: true,
    apiKey: geminiKey,
    // Count every real request per model and refuse past the daily cap (as a 429) so callers fall back.
    fetch: async (input: any, init?: any) => {
      try {
        const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
        const model = body?.model as string | undefined;
        // The first lite model gets a shorter wait (25s) so the last lite model still has time to answer. The last one keeps the full 40s.
        if (model === "gemini-3.5-flash-lite") {
          const short = AbortSignal.timeout(25_000);
          init = { ...init, signal: init?.signal ? AbortSignal.any([init.signal, short]) : short };
        }
        if (model) {
          const { countCall } = await import("./model-router.server");
          if (!(await countCall(model))) {
            return new Response(JSON.stringify({ error: { code: 429, message: "daily quota reached (resource_exhausted)", status: "RESOURCE_EXHAUSTED" } }), {
              status: 429,
              headers: { "content-type": "application/json" },
            });
          }
        }
      } catch {
        /* never block on counting */
      }
      return fetch(input, init);
    },
  });
  const override = forceModel || process.env.GEMINI_MODEL_OVERRIDE;
  const wrapped = ((modelId: string) =>
    provider(override || modelId.replace(/^google\//, ""))) as typeof provider;
  return Object.assign(wrapped, provider);
}
