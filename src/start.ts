import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Hardening: baseline security response headers on every request.
// Note: no frame-ancestors/X-Frame-Options so the Lovable editor preview keeps working.
const IS_DEV = process.env.NODE_ENV !== "production";

// Vite's dev/HMR client needs eval(); the production bundle never does, so
// 'unsafe-eval' is only granted in development.
const SCRIPT_ORIGINS =
  "blob: https://checkout.razorpay.com https://*.razorpay.com https://*.lovable.app https://*.lovable.dev https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://partner.googleadservices.com https://adservice.google.com";

/**
 * With a nonce we can drop 'unsafe-inline' entirely: only the inline scripts we
 * emit ourselves (hydration payload, JSON-LD, analytics bootstrap) carry it.
 * Without one (dev server, or a response that never rendered the router) we
 * fall back to 'unsafe-inline' so the page still works.
 */
function scriptSrc(nonce?: string): string {
  return [
    "script-src 'self'",
    nonce ? `'nonce-${nonce}' 'strict-dynamic'` : "'unsafe-inline'",
    IS_DEV ? "'unsafe-eval'" : "",
    SCRIPT_ORIGINS,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Only the Lovable preview/editor hosts may frame the app; production locks to 'self'. */
function frameAncestors(hostname?: string): string {
  const previewHost =
    IS_DEV ||
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovable.dev");
  return previewHost
    ? "frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev"
    : "frame-ancestors 'self'";
}

function securityHeaders(nonce?: string, hostname?: string): Record<string, string> {
  const lockedFrames = frameAncestors(hostname) === "frame-ancestors 'self'";
  return {
    "x-content-type-options": "nosniff",
    // Legacy fallback for browsers that ignore frame-ancestors. Only sent when
    // the CSP is already locked to 'self', so the Lovable preview still frames.
    ...(lockedFrames ? { "x-frame-options": "SAMEORIGIN" } : {}),
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-dns-prefetch-control": "off",

    // payment must allow self + Razorpay, otherwise wallet/UPI/card methods
    // never render inside the embedded checkout iframe.
    "permissions-policy":
      'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    // Locks script/connect/frame origins to ourselves plus the payment provider,
    // so an injected tag cannot beacon data to an attacker-controlled host.
    "content-security-policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      frameAncestors(hostname),
      scriptSrc(nonce),
      // Split style directives: allow same-origin <style>/<link> elements,
      // Vite-injected data-URI stylesheets, and inline style attributes.
      "style-src 'self' 'unsafe-inline' data:",
      "style-src-elem 'self' 'unsafe-inline' data:",
      "style-src-attr 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "worker-src 'self' blob:",
      "child-src 'self' blob: https://*.razorpay.com https://challenges.cloudflare.com https://*.googlesyndication.com https://*.doubleclick.net",
      "frame-src 'self' https://*.razorpay.com https://challenges.cloudflare.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
      "connect-src 'self' blob: data: https://*.supabase.co wss://*.supabase.co https://*.razorpay.com https://*.lovable.app https://*.lovable.dev https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://challenges.cloudflare.com https://*.challenges.cloudflare.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://adservice.google.com",
      "upgrade-insecure-requests",
    ].join("; "),

    "cross-origin-opener-policy": "same-origin-allow-popups",
    "cross-origin-resource-policy": "same-site",
    "x-permitted-cross-domain-policies": "none",
    "origin-agent-cluster": "?1",
  };
}


const securityHeadersMiddleware = createMiddleware().server(async ({ next, request }) => {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  // Internal Lovable routes (email preview/webhooks) authenticate themselves.
  if (pathname.startsWith("/lovable/")) {
    return next();
  }

  // Dev keeps the permissive inline policy: Vite injects its own inline
  // scripts that we cannot stamp with a nonce.
  let store: { nonce: string; used: boolean } | undefined;
  let result: unknown;
  if (IS_DEV) {
    result = await next();
  } else {
    let withNonce: typeof import("./lib/csp-nonce.server").withNonce | undefined;
    try {
      ({ withNonce } = await import("./lib/csp-nonce.server"));
    } catch {
      /* nonce support unavailable — fall back to the permissive policy */
    }
    if (withNonce) {
      const outcome = await withNonce(() => next());
      result = outcome.result;
      store = outcome.store;
    } else {
      result = await next();
    }
  }

  const target =
    result instanceof Response
      ? result
      : ((result as { response?: unknown })?.response as Response | undefined);

  if (target?.headers) {
    for (const [key, value] of Object.entries(securityHeaders(store?.used ? store.nonce : undefined, requestUrl.hostname))) {
      try {
        target.headers.set(key, value);
      } catch {
        /* immutable headers — skip */
      }
    }
    // Private surfaces: keep them out of search indexes and caches. Access is
    // still enforced server-side; this only removes public discoverability.
    if (/^\/(admin|account|checkout)(\/|$)/.test(pathname)) {
      try {
        target.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
        target.headers.set("cache-control", "no-store");
      } catch {
        /* immutable headers — skip */
      }
    }
  }
  return result as never;
});


// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) =>
    ctx.handlerType === "serverFn" && !new URL(ctx.request.url).pathname.startsWith("/lovable/"),
});


export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, securityHeadersMiddleware, csrfMiddleware],
}));

