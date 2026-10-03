import { getRequestUrl } from '@tanstack/react-start/server';

/**
 * Keeps Stripe `return_url` values on this site.
 *
 * The URL is rebuilt from the current request's origin, so only the path,
 * query, and hash of the caller-supplied value survive. Anything pointing at
 * another origin can never leave the app.
 */
export function sameOriginReturnUrl(candidate: string | undefined, fallbackPath = '/'): string {
  const origin = new URL(getRequestUrl()).origin;
  const safeFallback = new URL(fallbackPath, origin).toString();
  if (!candidate) return safeFallback;

  try {
    const parsed = new URL(candidate, origin);
    if (parsed.origin !== origin) return safeFallback;
    // Rebuild explicitly so credentials/protocol tricks can't slip through.
    return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return safeFallback;
  }
}
