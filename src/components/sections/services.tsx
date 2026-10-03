"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { services } from "@/data/services";
import { useIntersection } from "@/hooks/use-intersection";
import { SectionHeading } from "@/components/ui/section-heading";
import { Wrench } from "lucide-react";

const toneCycle = ["bg-brutal-yellow", "bg-brutal-blue", "bg-brutal-pink", "bg-brutal-green"] as const;
const shadowCycle = [
  "shadow-brutal-yellow",
  "shadow-brutal-blue",
  "shadow-brutal-pink",
  "shadow-brutal-green",
] as const;

export function Services() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();

  return (
    <section id="services" className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("services.eyebrow")} icon={Wrench} iconTone="purple">
            {t("services.title")}
          </SectionHeading>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.titleKey}
              initial={{ opacity: 0, y: 28, rotate: -2 }}
              animate={isVisible ? { opacity: 1, y: 0, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              className="group relative"
            >
              <span
                className={`absolute -top-5 -left-4 z-10 flex h-12 w-12 items-center justify-center border-[3px] border-border bg-brutal-ink font-display text-body font-extrabold text-brutal-yellow shadow-brutal-sm ${toneCycle[i % toneCycle.length]}`}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div
                className={`h-full border-[3px] border-border ${toneCycle[i % toneCycle.length]} ${shadowCycle[i % shadowCycle.length]} transition-transform duration-200 ease-editorial group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]`}
              >
                <div className="flex h-full flex-col bg-background p-6">
                  <h3 className="mb-4 font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                    {t(service.titleKey)}
                  </h3>

                  <p className="mb-6 flex-1 text-body leading-relaxed text-foreground/75">
                    {t(service.descriptionKey)}
                  </p>

                  <ul className="flex flex-wrap gap-2 border-t-[3px] border-border pt-5">
                    {service.deliverablesKeys.map((key) => (
                      <li
                        key={key}
                        className="rounded-sm border-[3px] border-border bg-muted px-3 py-1 text-metadata font-bold uppercase tracking-wide"
                      >
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
