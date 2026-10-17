"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { impactLines } from "@/data/impact-headline";
import { profile } from "@/data/profile";
import { ImpactWord } from "@/components/ui/impact-word";
import { useIntersection } from "@/hooks/use-intersection";

const EASE = [0.16, 1, 0.3, 1] as const;

const TRACK_PATHS = [
  {
    className: "text-impact-ink",
    darkClassName: "dark:text-impact-lime",
    d: "M-60 140C240 40 520 210 780 118S1200 26 1500 138",
    opacity: 0.45,
    dash: undefined,
  },
  {
    className: "text-impact-ink",
    darkClassName: "dark:text-impact-bone",
    d: "M-60 352C300 448 560 254 840 356S1250 452 1500 336",
    opacity: 0.3,
    dash: "10 16",
  },
  {
    className: "text-impact-ink",
    darkClassName: "dark:text-impact-bone",
    d: "M-60 556C250 486 610 616 910 512S1310 486 1500 574",
    opacity: 0.22,
    dash: undefined,
  },
];

export function ImpactHeadline() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>({ threshold: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const revealed = prefersReducedMotion || isVisible;
  const initial = prefersReducedMotion
    ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
    : { clipPath: "inset(0% 100% 0% 0%)", opacity: 0.45 };

  return (
    <section
      aria-labelledby="impact-headline"
      className="relative isolate overflow-x-clip bg-impact-wash py-20 dark:bg-impact-ink sm:py-28 lg:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 640"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
          className="h-full w-full"
        >
          <g className="will-change-transform animate-impact-drift-slow motion-reduce:animate-none">
            {TRACK_PATHS.map((path) => (
              <path
                key={path.d}
                className={`${path.className} ${path.darkClassName}${
                  path.dash ? " animate-impact-dash-slow" : ""
                }`}
                d={path.d}
                stroke="currentColor"
                strokeOpacity={path.opacity}
                strokeWidth={1.5}
                strokeDasharray={path.dash}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
      </div>

      <div ref={ref} className="container-editorial relative z-10">
        <motion.div
          aria-hidden="true"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: EASE,
            delay: prefersReducedMotion ? 0 : 0.1,
          }}
          className="mb-7 h-px w-full bg-impact-ink/20 dark:bg-impact-bone/20"
        />

        <h2
          id="impact-headline"
          className="flex flex-col font-display uppercase leading-[0.9] tracking-[-0.035em] text-impact-ink dark:text-impact-bone text-[clamp(1.5rem,7.1vw,6rem)]"
        >
          {impactLines.map((line, lineIndex) => (
            <motion.span
              key={lineIndex}
              className="block"
              initial={initial}
              animate={
                revealed ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 } : initial
              }
              transition={{
                duration: prefersReducedMotion ? 0 : 1,
                ease: EASE,
                delay: lineIndex * 0.09,
              }}
            >
              {line.map((token, tokenIndex) => (
                <span key={`${lineIndex}-${tokenIndex}`}>
                  {tokenIndex > 0 ? " " : null}
                  <ImpactWord token={token} />
                </span>
              ))}
            </motion.span>
          ))}
        </h2>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: EASE,
            delay: prefersReducedMotion ? 0 : 0.45,
          }}
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-impact-ink/20 pt-6 font-body text-caption uppercase tracking-[0.2em] text-impact-ink/70 dark:border-impact-bone/20 dark:text-impact-bone/70 sm:text-metadata"
        >
          <span className="inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 bg-impact-ink dark:bg-impact-lime"
            />
            {t("profile.role")}
          </span>
          <span className="sm:ml-auto">
            {t("common.basedIn")} {profile.location}
          </span>
        </motion.div>
      </div>
    </section>
  );
}