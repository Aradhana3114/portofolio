"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/ui/split-text";
import { ArrowDown, MapPin } from "lucide-react";

const STAGGER = 0.06;

export function Hero() {
  const t = useTranslations();
  const firstName = profile.name.split(" ")[0].toUpperCase();
  const lastName = profile.name.split(" ").slice(1).join(" ").toUpperCase();
  const headingClass =
    "font-asimovian block overflow-hidden text-[clamp(1.75rem,7vw,5rem)] font-bold leading-[0.95] tracking-tight";
  const lastNameDelay = firstName.length * STAGGER;
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-0 pt-32 pb-24 sm:pt-36 sm:pb-28"
    >
      <div className="container-editorial relative z-10 text-center">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-caption">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="font-medium">{t("profile.availability")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-foreground/60">
            <MapPin size={14} />
            <span>{t("common.basedIn")} {profile.location}</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <div className="mb-8">
          <SplitText as="h1" text={firstName} className={headingClass} delay={0} stagger={STAGGER} play={ready} />
          <SplitText
            as="h1"
            text={lastName}
            className={headingClass}
            delay={lastNameDelay}
            stagger={STAGGER}
            play={ready}
          />
        </div>

        {/* Role Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mb-6 flex flex-wrap items-center justify-center gap-3 text-body"
        >
          <span className="rounded-full border border-border bg-foreground px-4 py-1.5 font-medium text-background">
            {t("hero.student")}
          </span>
          <span className="rounded-full border border-border bg-foreground px-4 py-1.5 font-medium text-background">
            {t("hero.developer")}
          </span>
          <span className="rounded-full border border-border bg-muted px-4 py-1.5 font-medium">
            {t("hero.freelancer")}
          </span>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mt-8"
        >
          <p className="mb-3 text-caption uppercase tracking-wider text-foreground/60">{t("hero.scrollDown")}</p>
          <motion.a
            href="#about"
            aria-label="Scroll to about section"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowDown size={24} />
          </motion.a>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-accent-secondary/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl"></div>
      </div>
    </section>
  );
}
