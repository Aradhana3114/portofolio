"use client";

import { motion } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  rotate?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.5,
  rotate = 0,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, rotate: rotate - 2 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      transition={{ duration, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {children}
    </motion.div>
  );
}
