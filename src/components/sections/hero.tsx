"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { profile } from "@/data/profile";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/ui/split-text";
import { MarkerBand } from "@/components/ui/marker-band";
import { Sticker } from "@/components/ui/sticker";
import { ArrowDown, MapPin } from "lucide-react";

const STAGGER = 0.05;

export function Hero() {
  const t = useTranslations();
  const firstName = profile.name.split(" ")[0].toUpperCase();
  const lastName = profile.name.split(" ").slice(1).join(" ").toUpperCase();
  const lastNameDelay = firstName.length * STAGGER;
  const [ready, setReady] = useState(false);

  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 700], [0, 70]);
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0]);

  useEffect(() => {
    const w = window as typeof window & { __splashDone?: boolean };
    if (w.__splashDone) {
      setReady(true);
      return;
    }
    const onSplashDone = () => setReady(true);
    window.addEventListener("splash:done", onSplashDone);
    const fallback = setTimeout(() => setReady(true), 4500);
    return () => {
      window.removeEventListener("splash:done", onSplashDone);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section
      id="home"
      className="bg-grid relative flex min-h-svh items-center justify-center overflow-hidden px-0 pt-24 pb-12 sm:pt-28 sm:pb-14"
    >
      {/* Halftone backdrop */}
      <div className="bg-halftone absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute -left-16 top-24 -z-10 h-40 w-40 rounded-full border-[3px] border-border bg-brutal-pink/40 motion-safe:animate-float-slow sm:h-52 sm:w-52"
        aria-hidden="true"
      />
      <div
        className="absolute -right-12 bottom-28 -z-10 h-32 w-32 rounded-full border-[3px] border-border bg-brutal-blue/40 motion-safe:animate-float-slow sm:h-44 sm:w-44"
        style={{ ["--tilt" as string]: "4deg", animationDelay: "1.2s" } as React.CSSProperties}
        aria-hidden="true"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-editorial relative z-10 text-center"
      >
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <Sticker tone="green" rotate={-2} wiggle className="px-3 py-1 text-metadata">
            <span className="h-2 w-2 animate-blink-hard border-[2px] border-border bg-brutal-ink" aria-hidden="true" />
            {t("profile.availability")}
          </Sticker>

          <span className="inline-flex items-center gap-1.5 border-[3px] border-border bg-background px-2.5 py-1 text-metadata font-bold shadow-brutal-sm">
            <MapPin size={12} strokeWidth={3} />
            {t("common.basedIn")} {profile.location}
          </span>
        </motion.div>

        {/* Main Heading */}
        <div className="mb-5">
          <MarkerBand
            letters={firstName.length}
            delay={0}
            stagger={STAGGER}
            play={ready}
            tilt={-1.5}
          >
            <SplitText
              as="h1"
              text={firstName}
              className="block sm:whitespace-nowrap font-display text-display font-extrabold uppercase leading-[0.88] tracking-tighter text-brutal-ink"
              delay={0}
              stagger={STAGGER}
              play={ready}
              tilt={2.5}
            />
          </MarkerBand>

          <MarkerBand
            letters={lastName.length}
            delay={lastNameDelay}
            stagger={STAGGER}
            play={ready}
            tilt={-1.5}
            className="mt-3"
          >
            <SplitText
              as="h1"
              text={lastName}
              className="block sm:whitespace-nowrap font-display text-display font-extrabold uppercase leading-[0.88] tracking-tighter text-brutal-ink"
              delay={lastNameDelay}
              stagger={STAGGER}
              play={ready}
              tilt={2.5}
            />
          </MarkerBand>
        </div>

        {/* Role Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 mb-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
        >
          <Sticker tone="blue" rotate={-3} wiggle className="px-3 py-1 text-metadata">
            {t("hero.student")}
          </Sticker>
          <Sticker tone="orange" rotate={2} wiggle className="px-3 py-1 text-metadata">
            {t("hero.developer")}
          </Sticker>
          <Sticker tone="purple" rotate={-1} wiggle className="px-3 py-1 text-metadata">
            {t("hero.freelancer")}
          </Sticker>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 1.85, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 mb-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Button href="#work" size="md">
            {t("hero.viewWork")}
          </Button>
          <Button href="#contact" variant="secondary" size="md">
            {t("hero.letsTalk")}
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 2.1 }}
          className="sticky bottom-4 z-10 mt-6 flex flex-col items-center gap-1.5 sm:bottom-6"
        >
          <p className="text-metadata font-display font-bold uppercase tracking-[0.25em] text-foreground/50">
            {t("hero.scrollDown")}
          </p>
          <motion.a
            href="#about"
            aria-label="Scroll to about section"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 items-center justify-center border-[3px] border-border bg-brutal-yellow text-brutal-ink shadow-brutal-sm transition-all duration-150 hover:bg-brutal-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
          >
            <ArrowDown size={18} strokeWidth={3} />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
