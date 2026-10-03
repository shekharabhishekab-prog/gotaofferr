/**
 * Client-side "processing queue" for AI-backed actions.
 *
 * Under a traffic spike the AI gateway / server can answer with overload
 * signals (429, 503, "capacity", "overloaded", gateway timeouts). Instead of
 * dumping a raw error on the user, we hold their request and retry with
 * exponential backoff + jitter, reporting queue state through `onWait`.
 *
 * Plan/quota errors ("you've used all 3 resumes") are NOT retried — those are
 * final answers, not congestion.
 */

export type QueueWaitInfo = {
  /** 1-based retry attempt about to be scheduled. */
  attempt: number;
  /** Total attempts allowed. */
  maxAttempts: number;
  /** Seconds until the next try. */
  seconds: number;
};

export type QueueOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onWait?: (info: QueueWaitInfo) => void;
  /** Called once the retry succeeds, so the UI can clear the queue banner. */
  onResolved?: () => void;
};

const OVERLOAD_PATTERNS = [
  /\b429\b/,
  /\b(502|503|504)\b/,
  /overload/i,
  /capacity/i,
  /too many requests/i,
  /rate.?limit/i,
  /temporarily unavailable/i,
  /service unavailable/i,
  /timed? ?out/i,
  /timeout/i,
  /busy/i,
  /failed to fetch/i,
  /network ?error/i,
];

/** Messages that look like congestion but are really final user-facing limits. */
const FINAL_PATTERNS = [
  /you've used all/i,
  /free rewrite/i,
  /upgrade/i,
  /sign in/i,
  /create a free account/i,
  /allowance/i,
  /monthly limit/i,
];

export function isTransientOverload(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message) return false;
  if (FINAL_PATTERNS.some((p) => p.test(message))) return false;
  return OVERLOAD_PATTERNS.some((p) => p.test(message));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runQueued<T>(task: () => Promise<T>, options: QueueOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 4000;
  const maxDelayMs = options.maxDelayMs ?? 30000;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const value = await task();
      if (attempt > 0) options.onResolved?.();
      return value;
    } catch (error) {
      lastError = error;
      const isLast = attempt === maxAttempts - 1;
      if (isLast || !isTransientOverload(error)) throw error;

      const backoff = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      const delay = backoff + Math.floor(Math.random() * 1500);
      options.onWait?.({
        attempt: attempt + 1,
        maxAttempts: maxAttempts - 1,
        seconds: Math.round(delay / 1000),
      });
      await sleep(delay);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

/** Friendly copy for the queue banner. */
export function queueMessage(info: QueueWaitInfo): string {
  return `High demand right now — you're in the queue. Retrying in ${info.seconds}s (attempt ${info.attempt} of ${info.maxAttempts}).`;
}
