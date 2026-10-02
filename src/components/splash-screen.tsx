"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const t = useTranslations();
  const text = t("splash.greeting");
  const [isVisible, setIsVisible] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
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
      finish();
      return;
    }

    try {
      sessionStorage.setItem("splash:seen", "1");
    } catch {}

    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000);
    setTimeout(finish, 3450);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="flex items-center justify-center gap-[0.05em]">
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`font-display font-bold ${
                  char === " " ? "w-[0.3em]" : ""
                } text-[clamp(2rem,8vw,5rem)] text-foreground`}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
