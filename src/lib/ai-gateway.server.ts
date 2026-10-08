import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { guardedFetch } from "./prompt-guard.server";

/**
 * AI provider.
 * Default (GEMINI_API_KEY not set): Lovable AI gateway, exactly as before.
 * Independent copy (GEMINI_API_KEY set): Google AI Studio via its OpenAI-compatible
 * endpoint. Optional GEMINI_MODEL overrides the model id for every call.
 */
export function createLovableAiGatewayProvider(lovableApiKey: string, forceModel?: string) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      // Required so structured output sends a strict json_schema the model must follow.
      supportsStructuredOutputs: true,
      fetch: guardedFetch(fetch),
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
      return guardedFetch(fetch)(input, init);
    },
  });
  const override = forceModel || process.env.GEMINI_MODEL_OVERRIDE;
  const wrapped = ((modelId: string) =>
    provider(override || modelId.replace(/^google\//, ""))) as typeof provider;
  return Object.assign(wrapped, provider);
}

