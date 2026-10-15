/**
 * Central, configurable rate-limit policy.
 *
 * Every limit lives here instead of being hardcoded at the call site, and each
 * one can be overridden at runtime with an env var of the form
 * `RATE_LIMIT_<BUCKET_IN_UPPER_SNAKE>` = "<limit>:<windowSeconds>".
 * Example: RATE_LIMIT_CONTACT_IP="3:3600"
 *
 * Tiers:
 *  - "auth"          strictest; credential-adjacent or identity-claiming actions
 *  - "public"        moderate; unauthenticated but harmless-ish endpoints
 *  - "authenticated" loosest; signed-in user actions (already quota-bound)
 */

export type RateTier = 'auth' | 'public' | 'authenticated';

export type RateLimitPolicy = {
  /** Requests allowed inside one fixed window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  tier: RateTier;
  /** User-facing message when the limit is hit. */
  message?: string;
};

const TOO_MANY = 'Too many requests. Please wait a moment and try again.';

const DEFAULTS = {
  // --- auth tier -----------------------------------------------------------
  'contact-ip': { limit: 5, windowSeconds: 3600, tier: 'auth', message: 'Too many messages sent. Please try again in a little while.' },
  'contact-email': { limit: 3, windowSeconds: 3600, tier: 'auth', message: 'Too many messages sent. Please try again in a little while.' },
  'capture_email': { limit: 20, windowSeconds: 3600, tier: 'auth', message: 'Too many attempts. Please try again later.' },
  'payments-checkout': { limit: 10, windowSeconds: 600, tier: 'auth', message: 'Too many checkout attempts. Please wait a minute and try again.' },
  'payments-verify': { limit: 20, windowSeconds: 600, tier: 'auth', message: 'Too many verification attempts. Please wait a minute and try again.' },

  // --- public tier ---------------------------------------------------------
  'tailor_anon': { limit: 3, windowSeconds: 3600, tier: 'public', message: 'Too many free rewrites from this network. Please create a free account to continue.' },
  // Site-wide circuit breaker on logged-out AI spend. Per-device/IP limits can be
  // defeated by rotating IPs; this cap cannot. Override with RATE_LIMIT_TAILOR_ANON_GLOBAL.
  'tailor_anon_global': { limit: 250, windowSeconds: 86400, tier: 'public', message: 'Free logged-out rewrites are paused for today. Create a free account to keep tailoring — 10 rewrites every month.' },
  // Resume builder AI polish: free for everyone, so cap the per-IP spend.
  'resume_builder': { limit: 12, windowSeconds: 3600, tier: 'public', message: 'Too many polish requests from this network. Please wait a few minutes and try again.' },
  // Site-wide circuit breaker on builder AI spend — survives IP rotation.
  'resume_builder_global': { limit: 400, windowSeconds: 86400, tier: 'public', message: 'AI polish is busy right now because of high demand. You can still build and preview your resume - please try polishing again in a little while.' },
  // Inline per-field AI help in the builder: many small, cheap calls, so a wider cap.
  'resume_assist': { limit: 60, windowSeconds: 3600, tier: 'public', message: 'Too many AI rewrites from this network. Please wait a few minutes and try again.' },
  'resume_assist_global': { limit: 3000, windowSeconds: 86400, tier: 'public', message: 'Inline AI help is paused for today because of unusually high demand. You can still write your resume and download it.' },



  // --- authenticated tier --------------------------------------------------
  'tailor': { limit: 10, windowSeconds: 600, tier: 'authenticated', message: "You're rewriting resumes very quickly. Please wait a few minutes and try again." },
  'job_anon': { limit: 3, windowSeconds: 3600, tier: 'public', message: 'Too many free searches from this network. Please create a free account to continue.' },
  'job_anon_global': { limit: 300, windowSeconds: 86400, tier: 'public', message: 'Free logged-out job searches are paused for today. Create a free account to keep searching.' },
  // ProNet public bridge: per-network guards on top of the per-device caps (same spirit as the anon buckets above).
  'pronet_interview': { limit: 12, windowSeconds: 600, tier: 'public', message: 'Too many interview starts from this network. Please wait a few minutes and try again.' },
  'pronet_alert': { limit: 10, windowSeconds: 3600, tier: 'public', message: 'Too many alert changes from this network. Please wait and try again.' },
  'job-search': { limit: 30, windowSeconds: 600, tier: 'authenticated', message: 'Too many searches in a short time. Please wait a few minutes and try again.' },
  'job-alert-write': { limit: 30, windowSeconds: 600, tier: 'authenticated', message: 'Too many alert updates. Please wait a moment and try again.' },
  'profile-write': { limit: 20, windowSeconds: 600, tier: 'authenticated', message: 'Too many profile updates. Please wait a moment and try again.' },
  // AI Interview: one interview = two AI calls (questions, feedback). Per user, plus a site-wide circuit breaker that protects the shared free AI quota.
  'interview': { limit: 12, windowSeconds: 600, tier: 'authenticated', message: 'You are starting interviews very quickly. Please wait a few minutes and try again.' },
  'interview_global': { limit: 100, windowSeconds: 86400, tier: 'public', message: 'AI Interview is very busy today. Please try again a little later.' },
  // Coco's voice (Gemini text-to-speech, free tier). One interview reads up to 10 questions.
  'interview_tts': { limit: 40, windowSeconds: 600, tier: 'authenticated', message: 'Coco needs a short breather. Please wait a few minutes.' },
  'interview_tts_global': { limit: 1500, windowSeconds: 86400, tier: 'public', message: 'Coco voice is very busy today. Using the browser voice instead.' },
  'run-download': { limit: 60, windowSeconds: 600, tier: 'authenticated', message: TOO_MANY },
  
} as const satisfies Record<string, RateLimitPolicy>;

export type RateBucket = keyof typeof DEFAULTS;

/** Exponential backoff applied on repeat offenders, per tier. */
export const BACKOFF = {
  auth: { baseSeconds: 30, maxSeconds: 3600 },
  public: { baseSeconds: 20, maxSeconds: 1800 },
  authenticated: { baseSeconds: 10, maxSeconds: 900 },
} as const;

function envOverride(bucket: string): { limit: number; windowSeconds: number } | undefined {
  const key = `RATE_LIMIT_${bucket.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
  const raw = process.env[key];
  if (!raw) return undefined;
  const [limit, windowSeconds] = raw.split(':').map((part) => Number(part.trim()));
  if (!Number.isFinite(limit) || !Number.isFinite(windowSeconds) || limit! <= 0 || windowSeconds! <= 0) {
    return undefined;
  }
  return { limit: limit!, windowSeconds: windowSeconds! };
}

export function policyFor(bucket: RateBucket): Required<RateLimitPolicy> {
  const base = DEFAULTS[bucket] as RateLimitPolicy;
  const override = envOverride(bucket);
  return {
    limit: override?.limit ?? base.limit,
    windowSeconds: override?.windowSeconds ?? base.windowSeconds,
    tier: base.tier,
    message: base.message ?? TOO_MANY,
  };
}

