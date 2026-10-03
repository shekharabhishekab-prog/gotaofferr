/**
 * Fixed-window rate limiting backed by the database, with exponential backoff
 * for repeat offenders.
 *
 * Server-only. Workers are stateless, so counters must live in Postgres.
 * Fails OPEN on infrastructure errors (never block a paying user because the
 * limiter itself broke) but fails CLOSED once a limit is actually exceeded.
 *
 * Thresholds are never hardcoded at the call site — see rate-limit-config.ts.
 */

import { BACKOFF, policyFor, type RateBucket } from '@/lib/rate-limit-config';
import { userError } from '@/lib/safe-error.server';

export type RateLimitResult = { allowed: boolean; count: number; retryAfterSeconds: number };

/** Best-effort client IP from the edge proxy headers. */
export function clientIp(request: Request | undefined): string {
  const h = request?.headers;
  const candidate =
    h?.get('cf-connecting-ip') ??
    h?.get('x-real-ip') ??
    h?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '';
  return candidate || 'unknown';
}

function windowStart(windowSeconds: number): Date {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(Date.now() / windowMs) * windowMs);
}

function retryAfter(start: Date, windowSeconds: number): number {
  return Math.max(1, Math.ceil((start.getTime() + windowSeconds * 1000 - Date.now()) / 1000));
}

async function bump(bucket: string, identifier: string, start: Date): Promise<number> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('bump_rate_limit' as any, {
    _bucket: bucket,
    _identifier: identifier.slice(0, 200),
    _window_start: start.toISOString(),
  } as any);
  if (error) throw error;
  return Number(data ?? 0);
}

async function readCount(bucket: string, identifier: string, start: Date): Promise<number> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data } = await supabaseAdmin
    .from('rate_limits' as any)
    .select('count')
    .eq('bucket', bucket)
    .eq('identifier', identifier.slice(0, 200))
    .eq('window_start', start.toISOString())
    .maybeSingle();
  return Number((data as any)?.count ?? 0);
}

export async function checkRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const start = windowStart(windowSeconds);
  const retryAfterSeconds = retryAfter(start, windowSeconds);

  try {
    const count = await bump(bucket, identifier, start);
    return { allowed: count <= limit, count, retryAfterSeconds };
  } catch (error) {
    console.error('[rate-limit] check failed, allowing request:', error);
    return { allowed: true, count: 0, retryAfterSeconds };
  }
}

function humanWait(seconds: number): string {
  if (seconds < 90) return `${seconds} seconds`;
  return `${Math.ceil(seconds / 60)} minutes`;
}

/**
 * Policy-driven limiter with exponential backoff.
 *
 * Instead of a hard lockout, a caller that keeps exceeding the limit is put in
 * a cool-off that doubles with each violation inside a rolling 24h window,
 * capped per tier. Violations decay automatically when the 24h window rolls.
 */
export async function enforcePolicy(bucket: RateBucket, identifier: string): Promise<void> {
  const policy = policyFor(bucket);
  const backoff = BACKOFF[policy.tier];
  const id = identifier.slice(0, 200);

  try {
    // 1. Still serving a cool-off from an earlier violation?
    const penaltyStart = windowStart(backoff.maxSeconds);
    const penaltyUntil = await readCount(`${bucket}:cooloff`, id, penaltyStart);
    if (penaltyUntil > Date.now() / 1000) {
      throw userError(
        `${policy.message} You can try again in about ${humanWait(Math.ceil(penaltyUntil - Date.now() / 1000))}.`,
      );
    }

    // 2. Normal fixed-window count.
    const start = windowStart(policy.windowSeconds);
    const count = await bump(bucket, id, start);
    if (count <= policy.limit) return;

    // 3. Over the limit: escalate the cool-off.
    const violations = await bump(`${bucket}:violations`, id, windowStart(86_400));
    const wait = Math.min(backoff.maxSeconds, backoff.baseSeconds * 2 ** Math.max(0, violations - 1));
    // Abuse signal: one structured line per violation so unusual traffic
    // (credential stuffing, scraping, AI-spend abuse) is visible in logs.
    console.warn(
      `[abuse] bucket=${bucket} tier=${policy.tier} identifier=${id.slice(0, 12)}… count=${count} violations=${violations} cooloff=${wait}s`,
    );
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await supabaseAdmin.from('rate_limits' as any).upsert(
      {
        bucket: `${bucket}:cooloff`,
        identifier: id,
        window_start: penaltyStart.toISOString(),
        count: Math.ceil(Date.now() / 1000 + wait),
      } as any,
      { onConflict: 'bucket,identifier,window_start' } as any,
    );

    throw userError(`${policy.message} You can try again in about ${humanWait(wait)}.`);
  } catch (error) {
    if ((error as { userFacing?: boolean })?.userFacing) throw error;
    // Limiter infrastructure failure: fail open, but log it.
    console.error('[rate-limit] policy check failed, allowing request:', error);
  }
}

/** Throws a user-safe error when the caller is over the limit. */
export async function enforceRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
  message = 'Too many requests. Please wait a moment and try again.',
): Promise<void> {
  const result = await checkRateLimit(bucket, identifier, limit, windowSeconds);
  if (!result.allowed) throw userError(message);
}
