/**
 * Maps raw Lovable AI Gateway failures into messages the UI can show.
 *
 * The gateway relays provider HTTP statuses; the AI SDK surfaces them as
 * `statusCode` / `Payment Required` / `Too Many Requests` strings, so we match
 * on both the numeric status and the text.
 */
export function aiGatewayErrorMessage(error: unknown): string {
  const anyError = error as any;
  const status: number | undefined =
    anyError?.statusCode ?? anyError?.status ?? anyError?.response?.status ?? anyError?.cause?.statusCode;
  const text = (anyError instanceof Error ? anyError.message : String(anyError ?? "")).toLowerCase();

  if (status === 402 || text.includes("402") || text.includes("payment required")) {
    return "We're finishing a quick upgrade on our writing engine. Please try again in a few minutes — your details are safe.";
  }
  if (status === 429 || text.includes("429") || text.includes("too many requests") || text.includes("rate limit") || text.includes("quota") || text.includes("resource_exhausted")) {
    return "The AI service is busy right now. Please wait a moment and try again.";
  }
  if (status === 401 || status === 403 || text.includes("unauthorized")) {
    console.error("[ai-gateway] auth/config error", status, text.slice(0, 300));
    return "Something went wrong on our side. Please try again in a moment.";
  }
  console.error("[ai-gateway] unexpected error", status, text.slice(0, 300));
  return "Something went wrong on our side. Please try again in a moment.";
}

