"use client";

import { useEffect, useState } from "react";

interface TypeLoopProps {
  text: string;
  as?: "h1" | "h2" | "span";
  className?: string;
  /** ms per typed character. */
  typeSpeed?: number;
  /** ms per deleted character. */
  deleteSpeed?: number;
  /** ms pause once the full text is on screen. */
  hold?: number;
  /** ms pause once the text is fully erased. */
  rest?: number;
  /** ms before the first keystroke. */
  delay?: number;
  play?: boolean;
  /** Alternating per-letter tilt in degrees, matching SplitText's vibe. */
  tilt?: number;
  /** Hide the blinking caret. */
  noCursor?: boolean;
}

/**
 * Terminal-style loop: types `text`, holds, deletes it, then types it again.
 *
 * The full string is always rendered (invisible) so the element keeps a stable
 * width — the line never reflows while characters come and go.
 */
export function TypeLoop({
  text,
  as: Tag = "span",
  className,
  typeSpeed = 90,
  deleteSpeed = 45,
  hold = 1800,
  rest = 400,
  delay = 0,
  play = true,
  tilt = 0,
  noCursor = false,
}: TypeLoopProps) {
  const [display, setDisplay] = useState("");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!play) {
      setDisplay("");
      return;
    }
    if (reduced) {
      setDisplay(text);
      return;
    }

    let i = 0;
    let deleting = false;
    let timer: number;

    const step = () => {
      if (!deleting) {
        i += 1;
        setDisplay(text.slice(0, i));
        if (i >= text.length) {
          deleting = true;
          timer = window.setTimeout(step, hold);
          return;
        }
        timer = window.setTimeout(step, typeSpeed);
        return;
      }

      i -= 1;
      setDisplay(text.slice(0, Math.max(0, i)));
      if (i <= 0) {
        deleting = false;
        timer = window.setTimeout(step, rest);
        return;
      }
      timer = window.setTimeout(step, deleteSpeed);
    };

    const start = window.setTimeout(step, delay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [play, reduced, text, typeSpeed, deleteSpeed, hold, rest, delay]);

  return (
    <Tag className={className} aria-label={text} style={{ position: "relative" }}>
      <span aria-hidden="true" className="invisible block sm:whitespace-nowrap">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block sm:whitespace-nowrap">
        {Array.from(display).map((char, ci) => (
          <span
            key={ci}
            className="inline-block will-change-transform"
            style={{ rotate: tilt === 0 ? undefined : ci % 2 === 0 ? `${tilt}deg` : `${-tilt}deg` }}
          >
            {char}
          </span>
        ))}
        {!noCursor && !reduced && (
          <span className="inline-block h-[0.78em] w-[0.09em] translate-y-[0.06em] animate-pulse-soft bg-brutal-ink" />
        )}
      </span>
    </Tag>
  );
}
