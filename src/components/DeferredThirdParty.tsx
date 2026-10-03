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

export function DeferredThirdParty({
  gaId,
  adsenseClient,
}: {
  gaId?: string;
  adsenseClient?: string;
}) {
  useEffect(() => {
    if (!gaId && !adsenseClient) return;

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
