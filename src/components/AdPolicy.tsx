import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useSubscription } from "@/hooks/useSubscription";
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
    w.adsbygoogle.pauseAdRequests = adsAllowed(tier, path) ? 0 : 1;
  }, [tier, loading, path]);

  return null;
}
