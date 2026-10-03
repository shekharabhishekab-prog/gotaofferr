import { useEffect, useRef, useState } from "react";
import { Clock, Hourglass, MousePointerClick, Target, Zap } from "lucide-react";

const stats = [
  {
    value: 15,
    suffix: " sec",
    label: "to a tailored resume",
    sub: "Upload once. Rebuild for every company instantly.",
    icon: Clock,
  },
  {
    value: 10,
    suffix: "+ hrs",
    label: "saved weekly",
    sub: "Stop spending 1-2 hours every day hunting jobs and rewriting CVs.",
    icon: Hourglass,
  },
  {
    value: 1000,
    suffix: "+",
    label: "applications automated",
    sub: "The reality of getting hired: hundreds of applications. We do the searching and tailoring for you.",
    icon: Target,
  },
  {
    value: 1,
    suffix: " click",
    label: "to apply",
    sub: "Find, tailor, download — then go straight to the company.",
    icon: MousePointerClick,
  },
];


function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.round(easeOutQuart(progress) * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value, 1400);
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className="animate-rise group relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/40 p-6 backdrop-blur transition-all duration-300 hover:border-highlight/30 hover:bg-card/60 [animation-delay:var(--delay)]"
      style={{ "--delay": `${index * 120}ms` } as React.CSSProperties}
    >
      {/* top highlight beam */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-highlight/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            <span className="text-gradient tabular-nums">{count}</span>
            <span className="text-highlight">{stat.suffix}</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground sm:text-base">
            {stat.label}
          </div>
          <div className="mt-1 max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
            {stat.sub}
          </div>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-highlight/10 text-highlight shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function ImpactStats() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-10 sm:py-14">
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium text-highlight">
            <Zap className="size-3" /> Built for speed
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Numbers that actually matter
          </h2>
          <p className="mt-3 text-muted-foreground">Stop counting tabs. Start counting replies.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
