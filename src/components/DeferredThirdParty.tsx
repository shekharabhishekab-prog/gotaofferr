import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

/**
 * Loads Google Analytics and AdSense *after* the page is interactive instead of
 * in the document head. Both are async, but the browser still parses and
 * executes them during the critical window on slow mobile connections, which
 * was costing ~750ms of Total Blocking Time and pushing LCP out.
 *
 * They now load on the first of: browser idle, first user interaction, or a
 * 3.5s fallback timer — so measurement and ads still work, just off the
 * critical path.
 */

function loadScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement("script");
  el.src = src;
  el.async = true;
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  document.head.appendChild(el);
}

const POSTHOG_KEY = "phc_qnxYaoAYBTXSHh2qG8tBke82cEFyx2HAGtXoAuXSYmR2";
const POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_ASSETS = "https://us-assets.i.posthog.com";

const ACTION_NAMES = ["tailor", "builder_polish", "builder_save", "job_search", "pdf_download", "signup", "signin", "subscription_cancel"] as const;
export type AnalyticsAction = typeof ACTION_NAMES[number];
export function trackAction(action: AnalyticsAction, outcome: "success" | "failed" | "blocked") {
  if (typeof window === "undefined" || location.pathname.startsWith("/admin")) return;
  if (!(ACTION_NAMES as readonly string[]).includes(action) || !["success", "failed", "blocked"].includes(outcome)) return;
  window.dispatchEvent(new CustomEvent("gt:product-action", { detail: { action, outcome } }));
}

const PUBLIC_ANALYTICS_ROUTES = new Set(["/", "/how-it-works", "/pricing", "/about", "/faq", "/contact", "/privacy", "/terms", "/examples/resumes", "/examples/cover-letters"]);
function publicAnalyticsRoute(url: string): boolean {
  try { return PUBLIC_ANALYTICS_ROUTES.has(new URL(url, window.location.origin).pathname.replace(/\/+$/, "") || "/"); }
  catch { return false; }
}

/** Official PostHog stub: queues calls until the real library has loaded. */
function loadPostHog(actionOnly = false) {
  const w = window as unknown as { posthog?: any; __gtPh?: boolean };
  if (window.location.pathname.startsWith("/admin") || w.__gtPh) return;
  if (!actionOnly && ((window as any).__gtPhPrivate || !publicAnalyticsRoute(window.location.href))) return;
  w.__gtPh = true;
  const ph: any = (w.posthog = w.posthog || []);
  if (ph.__SV) return;
  ph._i = [];
  ph.init = function (key: string, config: Record<string, unknown>, name?: string) {
    const target: any = name !== undefined ? (ph[name] = []) : ph;
    const methods =
      "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(
        " ",
      );
    for (const m of methods) {
      const parts = m.split(".");
      let obj = target;
      let fn = m;
      if (parts.length === 2) {
        obj = obj[parts[0]] = obj[parts[0]] || [];
        fn = parts[1];
      }
      obj[fn] = function (...args: unknown[]) {
        target.push([m, ...args]);
      };
    }
    ph._i.push([key, config, name]);
  };
  ph.__SV = 1;
  ph.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    person_profiles: "never",
    disable_session_recording: true,
    autocapture: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    capture_performance: false,
    rageclick: false,
    disable_surveys: true,
    advanced_disable_flags: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    capture_pageview: "history_change",
    before_send: (event: any) => {
      if (event?.event === "product_action") {
        const p = event.properties ?? {};
        if (window.location.pathname.startsWith("/admin") || !(ACTION_NAMES as readonly string[]).includes(p.action) || !["success", "failed", "blocked"].includes(p.outcome)) return null;
        return { ...event, properties: { action: p.action, outcome: p.outcome, token: POSTHOG_KEY, distinct_id: crypto.randomUUID() } };
      }
      if (!event || !["$pageview", "$pageleave"].includes(event.event)) return null;
      if ((window as any).__gtPhPrivate || !publicAnalyticsRoute(window.location.href)) return null;
      if (!publicAnalyticsRoute(event.properties?.$current_url ?? window.location.href)) return null;
      const properties = { ...event.properties };
      for (const key of ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"]) {
        if (typeof properties[key] !== "string") continue;
        try { const url = new URL(properties[key]); if (!publicAnalyticsRoute(url.href)) delete properties[key]; else properties[key] = url.origin + url.pathname; }
        catch { delete properties[key]; }
      }
      delete properties.$title;
      return { ...event, properties };
    },
    capture_pageleave: true,
  });
  loadScript(`${POSTHOG_ASSETS}/static/array.js`);
}

export function DeferredThirdParty({
  gaId,
  adsenseClient,
}: {
  gaId?: string;
  adsenseClient?: string;
}) {
  const { user, loading } = useSession();
  if (typeof window !== "undefined") (window as any).__gtPhPrivate = loading || Boolean(user);
  useEffect(() => {
    const onAction = (event: Event) => {
      if (!import.meta.env.PROD) return;
      const detail = (event as CustomEvent).detail;
      if (!detail || !(ACTION_NAMES as readonly string[]).includes(detail.action) || !["success", "failed", "blocked"].includes(detail.outcome)) return;
      if (window.location.pathname.startsWith("/admin")) return;
      loadPostHog(true);
      (window as any).posthog?.capture("product_action", { action: detail.action, outcome: detail.outcome });
    };
    window.addEventListener("gt:product-action", onAction);

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      cleanup();

      if (gaId) {
        const w = window as unknown as {
          dataLayer?: unknown[];
          gtag?: (...args: unknown[]) => void;
        };
        w.dataLayer = w.dataLayer || [];
        w.gtag =
          w.gtag ||
          function gtag(...args: unknown[]) {
            w.dataLayer!.push(args);
          };
        w.gtag("js", new Date());
        w.gtag("config", gaId, {
          page_path: window.location.pathname + window.location.search,
        });
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`);
      }

      if (import.meta.env.PROD && !loading && !user) loadPostHog();

      if (adsenseClient) {
        loadScript(
          `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`,
          { crossorigin: "anonymous" },
        );
      }
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "scroll"];
    const cleanup = () => {
      for (const event of events) window.removeEventListener(event, run);
      window.clearTimeout(timer);
    };
    for (const event of events) window.addEventListener(event, run, { once: true, passive: true });

    const timer = window.setTimeout(run, 3500);
    const idle = (
      window as unknown as { requestIdleCallback?: (cb: () => void, o?: unknown) => number }
    ).requestIdleCallback;
    if (idle) idle(run, { timeout: 4000 });

    return () => { cleanup(); window.removeEventListener("gt:product-action", onAction); };
  }, [gaId, adsenseClient, loading, user?.id]);

  return null;
}
