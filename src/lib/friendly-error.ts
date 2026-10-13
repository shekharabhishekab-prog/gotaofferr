/**
 * One place for every customer-facing error line. Raw technical text (gateway
 * messages, codes, stack-ish strings) is never shown: it is swapped for a short,
 * playful line that still tells the person what to do next.
 * Hand-written messages that already carry an emoji are left alone.
 */
const HAS_EMOJI = /\p{Extended_Pictographic}/u;

const RULES: Array<[RegExp, string]> = [
  [/not available in this country/i,
    "Job search is not available in this country yet 🌍 We are working on it."],
  [/network|fetch|offline|timeout|timed out|failed to load|load failed|connection|ECONN/i,
    "The internet took a coffee break ☕ Check your connection and try once more."],
  [/too many|rate limit|slow down|wait a (few )?minute|wait a few/i,
    "Easy, speed racer 🏎️ Give it a minute and try again."],
  [/sign in|signed in|log in|logged in|session|unauthor|jwt|token|not authenticated/i,
    "Looks like you got logged out 🙈 Sign in again and we'll pick up right where you left off."],
  [/allowance|used all|limit reached|quota|monthly limit|no .* left|upgrade/i,
    "You've used up this month's magic ✨ Upgrade your plan to keep going, or come back next month."],
  [/pdf|docx|file|scanned/i,
    "That file gave us a puzzled look 🤔 Try another one, or paste the text instead."],
  [/payment|card|checkout|subscription|razorpay|plan|billing|mandate/i,
    "Your payment hit a speed bump 🚧 Please try again, or use a different card or method."],
];

const GENERIC = "Oops, our servers tripped over their own shoelaces 🥴 Please try again in a moment.";

/** Returns a customer-safe line for any error text. */
export function friendlyMessage(raw: unknown, fallback?: string): string {
  const text = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : "";
  if (text && HAS_EMOJI.test(text)) return text;
  for (const [re, msg] of RULES) if (re.test(text)) return msg;
  return fallback && HAS_EMOJI.test(fallback) ? fallback : GENERIC;
}
