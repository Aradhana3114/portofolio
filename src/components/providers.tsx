"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  // Drives --scroll-hue for the rainbow scrollbar thumb in globals.css. Kept out
  // of the Lenis effect on purpose: this one also has to run when the user asks
  // for reduced motion, because Lenis is skipped in that case and nothing else
  // would move the colour. Lenis still scrolls the window natively, so a plain
  // scroll listener catches both cases.
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let lastHue = -1;

    const update = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Only write when the rounded degree actually changes. The rainbow is
      // quantised to 1deg, so across a full page that is a couple of hundred
      // writes instead of one per animation frame — and each write used to
      // invalidate the scrollbar rule and force a style recalc of the document.
      const hue = Math.round(progress * 360);
      if (hue === lastHue) return;
      lastHue = hue;
      root.style.setProperty("--scroll-hue", String(hue));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
