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
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
      <motion.div
        className="w-full max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 flex items-center justify-center gap-4 md:mb-12 md:gap-6">
          <motion.span
            aria-hidden="true"
            className="select-none font-display text-[80px] font-bold leading-none text-foreground md:text-[120px]"
            variants={numberVariants}
            custom={-1}
          >
            4
          </motion.span>
          <motion.div
            variants={ghostVariants}
            whileHover={reduceMotion ? undefined : "hover"}
            animate={reduceMotion ? "visible" : ["visible", "floating"]}
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
            className="select-none font-display text-[80px] font-bold leading-none text-foreground md:text-[120px]"
            variants={numberVariants}
            custom={1}
          >
            4
          </motion.span>
        </div>

        <p className="sr-only">404</p>

        <motion.h1
          className="mb-4 font-display text-h2 font-bold text-foreground md:mb-6 md:text-h1"
          variants={itemVariants}
        >
          {t("notFound.headline")}
        </motion.h1>

        <motion.p
          className="mx-auto mb-8 max-w-md font-body text-body text-foreground/60 md:mb-12"
          variants={itemVariants}
        >
          {t("notFound.description")}
        </motion.p>

        <motion.div
          variants={itemVariants}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        >
          <Link
            href="/"
            className="inline-block rounded-lg border-2 border-foreground bg-foreground px-8 py-3 font-display text-body font-bold text-background transition-colors hover:bg-background hover:text-foreground"
          >
            {t("notFound.cta")}
          </Link>
        </motion.div>

        <motion.div className="mt-12" variants={itemVariants}>
          <details className="group mx-auto max-w-md text-left">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-body text-caption text-foreground/60 transition-colors hover:text-foreground">
              <span>{t("notFound.explain.trigger")}</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-open:rotate-90"
              >
                &rsaquo;
              </span>
            </summary>
            <div className="mt-4 border-l-2 border-border pl-4">
              <h2 className="font-display text-body font-bold text-foreground">
                {t("notFound.explain.title")}
              </h2>
              <p className="mt-2 font-body text-caption text-foreground/60">
                {t("notFound.explain.body")}
              </p>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </section>
  );
}
