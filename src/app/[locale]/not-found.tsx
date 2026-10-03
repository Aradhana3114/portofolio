"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5,
  }),
  visible: {
    opacity: 0.15,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const ghostVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 15, rotate: -5 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.6, ease: EASE },
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      scale: { duration: 0.8, ease: EASE },
      y: { duration: 0.8, ease: EASE },
      rotate: { duration: 2, ease: "linear", repeat: Infinity, repeatType: "reverse" },
    },
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
    },
  },
};

export default function NotFound() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-24">
      <div className="bg-halftone absolute inset-0" aria-hidden="true" />

      <motion.div
        className="relative w-full max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 flex items-center justify-center gap-3 md:mb-12 md:gap-6">
          <motion.span
            aria-hidden="true"
            className="text-stroke select-none font-display text-[90px] font-extrabold uppercase leading-none md:text-[140px]"
            variants={numberVariants}
            custom={-1}
          >
            4
          </motion.span>
          <motion.div
            className="border-[3px] border-border bg-brutal-yellow p-2 shadow-brutal-md"
            variants={ghostVariants}
            whileHover={reduceMotion ? undefined : "hover"}
            animate={reduceMotion ? "visible" : ["visible", "floating"]}
            style={{ rotate: "-4deg" }}
          >
            <Image
              src="/images/ghost.png"
              alt=""
              aria-hidden="true"
              width={161}
              height={200}
              className="h-20 w-auto select-none object-contain md:h-28"
              draggable={false}
              priority
            />
          </motion.div>
          <motion.span
            aria-hidden="true"
            className="text-stroke select-none font-display text-[90px] font-extrabold uppercase leading-none md:text-[140px]"
            variants={numberVariants}
            custom={1}
          >
            4
          </motion.span>
        </div>

        <p className="sr-only">404</p>

        <motion.h1
          className="mb-5 inline-block -rotate-1 border-[3px] border-border bg-brutal-blue px-5 py-2 font-display text-h2 font-extrabold uppercase leading-none tracking-tighter text-brutal-ink shadow-brutal-lg md:mb-6 md:text-h1"
          variants={itemVariants}
        >
          {t("notFound.headline")}
        </motion.h1>

        <motion.p
          className="mx-auto mb-9 max-w-md border-[3px] border-border bg-background px-5 py-4 font-body text-body text-foreground/75 shadow-brutal"
          variants={itemVariants}
        >
          {t("notFound.description")}
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link
            href="/"
            className="inline-block rounded-sm border-[3px] border-border bg-brutal-yellow px-8 py-3 font-display text-body font-extrabold uppercase text-brutal-ink shadow-brutal transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-brutal-pink hover:shadow-brutal-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
          >
            {t("notFound.cta")}
          </Link>
        </motion.div>

        <motion.div className="mt-12" variants={itemVariants}>
          <details className="group mx-auto max-w-md text-left">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-sm border-[3px] border-border bg-muted px-4 py-2 font-display text-caption font-extrabold uppercase text-foreground transition-all duration-150 hover:bg-brutal-yellow">
              <span>{t("notFound.explain.trigger")}</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-open:rotate-90"
              >
                &rsaquo;
              </span>
            </summary>
            <div className="mt-4 border-[3px] border-border bg-background p-5 shadow-brutal-sm">
              <h2 className="font-display text-body font-extrabold uppercase text-foreground">
                {t("notFound.explain.title")}
              </h2>
              <p className="mt-2 font-body text-caption text-foreground/70">
                {t("notFound.explain.body")}
              </p>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </section>
  );
}
