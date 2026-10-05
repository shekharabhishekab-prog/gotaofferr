import { Link } from "@tanstack/react-router";

import { PLAN_LABEL, UPGRADE_NOTE, nextTier, type PlanTier } from "@/lib/plans";

/**
 * Plan counter: "5 searches in Free plan, 2 used". When the allowance is nearly
 * gone it adds a short highlighted note pointing exactly one tier up.
 */
export function UsageUpsell({
  tier,
  noun,
  limit,
  used,
}: {
  tier: PlanTier;
  noun: string;
  limit: number;
  used: number;
}) {
  const left = Math.max(0, limit - used);
  const up = nextTier(tier);
  const low = left <= Math.max(1, Math.floor(limit * 0.2));
  return (
    <div className="w-fit max-w-xl rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
      <p>
        <strong>
          {limit} {noun} in {PLAN_LABEL[tier]} plan, {used} used
        </strong>
        {left === 0 ? " - you have used all of them this month." : ` - ${left} left this month.`}
      </p>
      {up && low ? (
        <p className="mt-2 text-muted-foreground">
          {UPGRADE_NOTE[tier as Exclude<PlanTier, "career_pro">]}{" "}
          <Link to="/pricing" className="font-semibold text-foreground underline">
            See {PLAN_LABEL[up]}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
