import { useEffect } from "react";

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

const POSTHOG_KEY = "phc_qnxYaoAYBTXSHh2qGBtBke82cEFyx2HAGtXoAuXSYmR2";
const POSTHOG_HOST = "https://us.i.posthog.com";
const POSTHOG_ASSETS = "https://us-assets.i.posthog.com";

/** Official PostHog stub: queues calls until the real library has loaded. */
function loadPostHog() {
  const w = window as unknown as { posthog?: any; __gtPh?: boolean };
  if (w.__gtPh) return;
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
    person_profiles: "identified_only",
    disable_session_recording: true,
    capture_pageview: true,
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
  useEffect(() => {

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

      if (import.meta.env.PROD) loadPostHog();

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

    return cleanup;
  }, [gaId, adsenseClient]);

  return null;
}

