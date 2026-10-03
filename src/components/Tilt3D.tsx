import { useRef, type ReactNode, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps children in a pointer-reactive 3D tilt surface.
 * Purely presentational: sets --tx/--ty CSS vars used by the `tilt-3d` utility.
 */
export function Tilt3D({
  children,
  className,
  max = 1,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width - 0.5) * 2 * max;
      const y = ((clientY - r.top) / r.height - 0.5) * 2 * max;
      el.style.setProperty("--tx", String(x));
      el.style.setProperty("--ty", String(y));
      frame.current = null;
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ "--tx": 0, "--ty": 0 } as CSSProperties}
      className={cn("tilt-3d", className)}
    >
      {children}
    </div>
  );
}
