import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export type UsageValue = { used: number; limit: number; remaining: number; topup?: number };

export function UsageMeter({ usage }: { usage: UsageValue }) {
  const unlimited = usage.limit >= 1000000;
  const pct = unlimited
    ? 100
    : Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));
  const empty = !unlimited && usage.remaining <= 0;


  if (unlimited) {
    return (
      <div className="w-full rounded-[1.75rem] border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-primary">
            <Zap className="size-4" />
            Pro plan active
          </p>
          <span className="font-display text-sm font-black uppercase tracking-tight text-primary">
            Unlimited
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          You can tailor as many resumes as you need.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[1.75rem] border border-border/70 bg-card/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <Zap className="size-3.5 text-highlight" />
          Free plan usage this month
        </p>
        <span className="font-display text-xs font-bold text-highlight">
          {usage.used} / {usage.limit} used
        </span>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={usage.used}
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-label="Tailored resumes used this month"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            empty ? "bg-destructive" : "bg-hero",
          )}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          {empty
            ? "No attempts left — resets on the 1st."
            : `${usage.remaining} attempt${usage.remaining === 1 ? "" : "s"} left · resets on the 1st.`}
        </span>
        <Link to="/pricing" className="underline underline-offset-2 hover:text-foreground">
          {empty ? "Upgrade for more" : "Need more? See plans"}
        </Link>
      </div>

    </div>
  );
}
