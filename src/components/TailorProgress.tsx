import { Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type TailorStage = "upload" | "analyze" | "rewrite" | "format" | "done";

const STAGES: { key: TailorStage; label: string; hint: string }[] = [
  { key: "upload", label: "Reading resume", hint: "Extracting text from your file" },
  { key: "analyze", label: "Analysing job", hint: "Matching keywords & requirements" },
  { key: "rewrite", label: "Rewriting", hint: "Rebuilding sections for this role" },
  { key: "format", label: "Formatting", hint: "Preparing ATS-safe layout" },
];

const ORDER: TailorStage[] = ["upload", "analyze", "rewrite", "format", "done"];

export function TailorProgress({ stage }: { stage: TailorStage }) {
  const current = ORDER.indexOf(stage);
  const pct = Math.min(100, Math.round((current / (ORDER.length - 1)) * 100));

  return (
    <Card className="mt-6 border-border/70 p-5 shadow-soft sm:p-6" aria-live="polite">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {stage === "done" ? "Done — your resume is ready" : "Building your tailored resume…"}
        </p>
        <span className="font-display text-sm font-bold text-highlight">{pct}%</span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-hero transition-[width] duration-700 ease-out"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-4">
        {STAGES.map((s, i) => {
          const done = current > i;
          const active = current === i;
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-3 transition-colors",
                active
                  ? "border-primary/50 bg-muted/60"
                  : done
                    ? "border-border/60 bg-muted/30"
                    : "border-border/40 opacity-55",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                  done
                    ? "border-transparent bg-hero text-foreground"
                    : active
                      ? "border-primary/60"
                      : "border-border",
                )}
              >
                {done ? (
                  <Check className="size-3" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium">{s.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">{s.hint}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function ResultSkeleton() {
  return (
    <div className="mt-12" aria-hidden>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <Card className="p-8 shadow-soft sm:p-10">
        <div className="space-y-2 border-b border-border pb-4">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-3 w-80" />
        </div>

        {[0, 1, 2].map((s) => (
          <section key={s} className="mt-6 space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
          </section>
        ))}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
