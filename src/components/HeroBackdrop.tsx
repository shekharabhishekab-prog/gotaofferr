/**
 * Minimal deep-space backdrop for the hero: a still star field plus
 * shooting stars falling from the top of the screen downward.
 * Transform/opacity only; disabled under `prefers-reduced-motion`, and
 * paused entirely once the hero scrolls out of view so scrolling stays smooth.
 */

import { useEffect, useRef, useState } from "react";

const SHOOTING_STARS = [
  { top: "-8%", left: "70%", width: 170, delay: -0.5, duration: 5.5 },
  { top: "-4%", left: "92%", width: 140, delay: -2.4, duration: 6.5 },
  { top: "-12%", left: "48%", width: 200, delay: -4.6, duration: 7.5 },
  { top: "6%", left: "30%", width: 120, delay: -7.2, duration: 8.5 },
  { top: "-6%", left: "112%", width: 160, delay: -9.4, duration: 6 },
];

export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "80px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden [contain:layout_paint_size] [transform:translateZ(0)] ${
        visible ? "" : "backdrop-idle"
      }`}
      aria-hidden
    >
      {/* star field */}
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={`star-${i}`}
          className="animate-star-twinkle absolute rounded-full bg-foreground"
          style={{
            left: `${(i * 41) % 100}%`,
            top: `${(i * 67) % 94}%`,
            width: i % 6 === 0 ? 3 : 2,
            height: i % 6 === 0 ? 3 : 2,
            animationDelay: `${-(i * 0.43)}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}

      {/* shooting stars: bright head leading down-left, tail behind it */}
      {SHOOTING_STARS.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className="animate-shoot absolute block h-[2px] origin-left rounded-full bg-gradient-to-l from-highlight via-highlight/40 to-transparent"
          style={{
            top: s.top,
            left: s.left,
            width: s.width,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: "0 0 8px 1px color-mix(in oklab, var(--highlight) 55%, transparent)",
          }}
        />
      ))}

      {/* readability scrim behind the headline column */}
      <div className="hero-scrim absolute inset-0" />

      {/* fade to page background at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
