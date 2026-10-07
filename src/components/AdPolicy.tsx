import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useSubscription } from "@/hooks/useSubscription";
import { useSession } from "@/hooks/useSession";
import { GOOGLE_AD_SELECTOR, ensureGoogleAds } from "@/lib/ad-cleanup";
import type { PlanTier } from "@/lib/plans";

/**
 * Ads by plan. No new ad slots and no layout change: the existing AdSense
 * script stays as is, this only pauses or resumes its requests.
 *   Free        ads everywhere, as today
 *   Starter     content pages only (guides, examples, blog, FAQ); never on tools
 *   Job Hunt    guides and examples only (very nominal)
 *   Career Pro  no ads
 */
const CONTENT = /^\/(blog|guides|examples|faq|how-it-works|about)(\/|$)/;
const GUIDES = /^\/(guides|examples)(\/|$)/;

export function adsAllowed(tier: PlanTier, path: string): boolean {
  if (tier === "career_pro") return false;
  if (tier === "job_hunt") return GUIDES.test(path);
  if (tier === "starter") return CONTENT.test(path);
  return true;
}

export const TIER_STORAGE_KEY = "gt_tier";

export function AdPolicy() {
  const { tier, loading, error } = useSubscription();
  const { session, loading: sessionLoading } = useSession();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useLayoutEffect(() => {
    const w = window as unknown as { adsbygoogle?: unknown[] & { pauseAdRequests?: number } };
    w.adsbygoogle = w.adsbygoogle || [];
    // Fail closed for signed-in visitors until this identity's tier is confirmed.
    const awaitingTier = sessionLoading || Boolean(session && (loading || error));
    const allowed = !awaitingTier && adsAllowed(tier, path);
    w.adsbygoogle.pauseAdRequests = allowed ? 0 : 1;
    if (!loading && !sessionLoading && !error) {
      try { localStorage.setItem(TIER_STORAGE_KEY, tier); } catch { /* private mode */ }
    }
    if (allowed) {
      delete document.documentElement.dataset.gtAds;
      ensureGoogleAds(document, (import.meta.env['VITE_ADSENSE_CLIENT'] as string | undefined) || 'ca-pub-9570238585409638');
      return;
    }
    // Persistent selector CSS hides current and future ads without racing React or AdSense DOM ownership.
    document.documentElement.dataset.gtAds = "blocked";
    return () => { delete document.documentElement.dataset.gtAds; };
  }, [tier, loading, error, path, session?.user.id, sessionLoading]);

  return <style>{GOOGLE_AD_SELECTOR.split(",").map(selector => `html[data-gt-ads="blocked"] ${selector}`).join(",") + "{display:none!important;visibility:hidden!important;pointer-events:none!important}"}</style>;
}
