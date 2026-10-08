import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useSubscription } from "@/hooks/useSubscription";
import type { PlanTier } from "@/lib/plans";

/**
 * Ads by plan. No new ad slots and no layout change: the existing AdSense
 * script stays as is, this only pauses or resumes its requests.
 *   Free        ads everywhere, as today
 *   Starter     none on the homepage or tools; only low-interaction reading pages (blog, FAQ)
 *   Job Hunt    no ads
 *   Career Pro  no ads
 */
const STARTER_OK = /^\/(blog|faq)(\/|$)/;

export function adsAllowed(tier: PlanTier, path: string): boolean {
  if (tier === "career_pro") return false;
  if (tier === "job_hunt") return false;
  if (tier === "starter") return STARTER_OK.test(path);
  return true;
}

export const TIER_STORAGE_KEY = "gt_tier";

export function AdPolicy() {
  const { tier, loading } = useSubscription();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    try {
      localStorage.setItem(TIER_STORAGE_KEY, tier);
    } catch {
      /* private mode */
    }
    const w = window as unknown as { adsbygoogle?: unknown[] & { pauseAdRequests?: number } };
    w.adsbygoogle = w.adsbygoogle || [];
    const allowed = adsAllowed(tier, path);
    w.adsbygoogle.pauseAdRequests = allowed ? 0 : 1;
    // A plan that just ended (or a page where ads are now allowed) may have skipped loading the AdSense
    // script at page start because the old plan was remembered. Load it now so ads show at once,
    // not on the next full page load.
    const client =
      (import.meta.env["VITE_ADSENSE_CLIENT"] as string | undefined) ||
      (import.meta.env.PROD ? "ca-pub-9570238585409638" : undefined);
    if (allowed && client && !document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const el = document.createElement("script");
      el.async = true;
      el.crossOrigin = "anonymous";
      el.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      document.head.appendChild(el);
    }
  }, [tier, loading, path]);

  return null;
}

