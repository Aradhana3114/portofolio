"use client";

import { useEffect, useRef } from "react";

const PHRASES = ["FULL STACK DEVELOPER", "UI/UX", "WEB DEVELOPMENT"];
const SEPARATOR = "✦";
const REPEATS_PER_HALF = 3;

function Half() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {Array.from({ length: REPEATS_PER_HALF }).map((_, block) => (
        <span key={block} className="flex shrink-0 items-center">
          {PHRASES.map((phrase, i) => (
            <span key={phrase} className="flex shrink-0 items-center">
              <span className="whitespace-nowrap">{phrase}</span>
              <span className="px-4 text-foreground/40 sm:px-6 md:px-8">{SEPARATOR}</span>
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const setRate = (rate: number) => {
      track.getAnimations().forEach((animation) => {
        const anim = animation as Animation & {
          updatePlaybackRate?: (rate: number) => void;
        };
        if (typeof anim.updatePlaybackRate === "function") {
          anim.updatePlaybackRate(rate);
        } else {
          anim.playbackRate = rate;
        }
      });
    };

    const onEnter = () => setRate(0.6);
    const onLeave = () => setRate(1);

    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);

    return () => {
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="overflow-hidden border-y border-border py-5 sm:py-6">
      <p className="sr-only">{PHRASES.join(", ")}</p>
      <div
        ref={trackRef}
        className="animate-marquee flex w-max font-asimovian text-[clamp(0.875rem,1.7vw,1.4rem)] font-bold uppercase leading-none tracking-tight text-foreground will-change-transform"
        style={{ "--marquee-duration": "25s" } as React.CSSProperties}
      >
        <Half />
        <Half />
      </div>
    </div>
  );
}