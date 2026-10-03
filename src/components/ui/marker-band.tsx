"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type MarkerBandProps = {
  children: ReactNode;
  /** Total characters in the text. Drives how many discrete wipe steps happen. */
  letters: number;
  /** Seconds before the sweep starts — keep in sync with SplitText's `delay`. */
  delay?: number;
  /** Seconds between letters — keep in sync with SplitText's `stagger`. */
  stagger?: number;
  play?: boolean;
  /** Sweep repeatedly: fills left→right one letter per step, then restarts. */
  loop?: boolean;
  tone?: string;
  tilt?: number;
  className?: string;
};

/**
 * A highlighter band that sweeps in from the left one letter at a time.
 *
 * The reveal animates `clip-path` with a `steps()` timing function, so the band
 * grows in discrete jumps — one jump per letter — instead of sliding smoothly.
 * Only the band layer is clipped; the text sits above it and is never distorted.
 *
 * With `loop` the sweep runs forever (loading-bar style, hard reset at the end).
 * The hard drop shadow lives on the wrapper rather than the band, because
 * `clip-path` would cut the shadow off mid-sweep.
 */
export function MarkerBand({
  children,
  letters,
  delay = 0,
  stagger = 0.05,
  play = false,
  loop = false,
  tone = "bg-brutal-yellow",
  tilt = 0,
  className,
}: MarkerBandProps) {
  const steps = Math.max(1, letters);
  const duration = steps * stagger;

  const wipe: CSSProperties = loop
    ? {
        animation: `marker-wipe ${duration}s steps(${steps}, end) infinite`,
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }
    : {
        clipPath: play ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        transitionProperty: "clip-path",
        transitionDuration: `${duration}s`,
        transitionTimingFunction: `steps(${steps}, end)`,
        transitionDelay: `${delay}s`,
      };

  return (
    <div
      className={cn("relative inline-block max-w-full shadow-brutal-md", className)}
      style={tilt ? { rotate: `${tilt}deg` } : undefined}
    >
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 border-[3px] border-brutal-ink", tone)}
        style={wipe}
      />
      <span className="relative block px-4 py-1">{children}</span>
    </div>
  );
}
