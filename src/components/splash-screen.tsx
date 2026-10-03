"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Before paint on the client, plain useEffect during SSR (which would warn).
// The splash now ships in the SSR HTML, so both the greeting and the
// already-seen check have to resolve before the first frame is painted.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SPLASH_MS = 2600;
const DONE_MS = 3000;

/** Visitor's clock, bucketed into four greetings. */
function resolveGreetingKey(hour: number) {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "afternoon";
  if (hour >= 15 && hour < 18) return "evening";
  return "night";
}

export function SplashScreen() {
  const t = useTranslations();
  // Read on the client only — the server has no way to know the visitor's clock,
  // so this must never be part of the server render.
  const [greeting, setGreeting] = useState<string | null>(null);
  // Starts visible so the overlay is part of the SSR payload and covers the page
  // on the very first paint. Starting false shipped an empty overlay, so the
  // hero painted first and the splash appeared over it afterwards.
  const [isVisible, setIsVisible] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const startedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    setGreeting(t(`splash.${resolveGreetingKey(new Date().getHours())}`));
  }, [t]);

  useIsomorphicLayoutEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const w = window as typeof window & { __splashDone?: boolean };
    const finish = () => {
      w.__splashDone = true;
      w.dispatchEvent(new Event("splash:done"));
    };

    let seen = false;
    try {
      seen = sessionStorage.getItem("splash:seen") === "1";
    } catch {}

    if (seen) {
      // Returning visitor: drop the overlay before paint so there is no flash
      // and no exit animation to sit through.
      setSkipped(true);
      finish();
      return;
    }

    try {
      sessionStorage.setItem("splash:seen", "1");
    } catch {}

    const hideTimer = setTimeout(() => setIsVisible(false), SPLASH_MS);
    const doneTimer = setTimeout(finish, DONE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (skipped) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-grid fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="bg-halftone-lg absolute inset-0" aria-hidden="true" />

          <div className="relative flex flex-col items-center gap-6 px-6">
            <div
              className="flex items-center justify-center gap-[0.02em] border-[5px] border-border bg-brutal-yellow px-5 py-3 shadow-brutal-xl"
              style={{ rotate: "-2deg" }}
            >
              {greeting &&
                greeting.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 24, rotate: -8 }}
                    animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -3 : 3 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.04,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className={`text-brutal-ink font-display text-[clamp(2.5rem,9vw,6rem)] font-extrabold uppercase leading-none tracking-tighter ${
                      char === " " ? "w-[0.25em]" : ""
                    }`}
                  >
                    {char}
                  </motion.span>
                ))}
            </div>

            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.6, ease: "linear" }}
              className="h-4 border-[3px] border-border bg-foreground"
              aria-hidden="true"
            />

            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 320, damping: 14 }}
              className="border-[3px] border-border bg-brutal-pink px-4 py-1.5 font-display text-caption font-extrabold uppercase tracking-[0.2em] text-brutal-ink shadow-brutal"
              style={{ rotate: "3deg" }}
            >
              {t("splash.loading")}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
