"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { journey } from "@/data/journey";
import { useIntersection } from "@/hooks/use-intersection";
import { ChevronDown, Briefcase, GraduationCap, Code, Map } from "lucide-react";
import { BrutalCard } from "@/components/ui/brutal-card";
import { SectionHeading } from "@/components/ui/section-heading";

const iconMap = {
  project: Code,
  work: Briefcase,
  education: GraduationCap,
};

const toneCycle = ["bg-brutal-blue", "bg-brutal-green", "bg-brutal-orange"] as const;
const shadowCycle = ["shadow-brutal-blue", "shadow-brutal-green", "shadow-brutal-orange"] as const;

export function Journey() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="journey" className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("journey.eyebrow")} icon={Map} iconTone="green">
            {t("journey.title")}
          </SectionHeading>
          <p className="-mt-4 mb-12 max-w-2xl text-body text-foreground/70">{t("journey.subtitle")}</p>
        </motion.div>

        <div className="relative space-y-8 md:pl-20">
          {/* Dashed timeline rail */}
          <div
            className="absolute left-[26px] top-4 bottom-4 hidden w-0 border-l-[5px] border-dashed border-border md:block"
            aria-hidden="true"
          />

          {journey.map((item, i) => {
            const Icon = iconMap[item.type as keyof typeof iconMap] || Code;
            const isExpanded = expandedIndex === i;
            const tone = toneCycle[i % toneCycle.length];
            const toneShadow = shadowCycle[i % shadowCycle.length];

            return (
              <motion.div
                key={`${item.year}-${item.titleKey}`}
                initial={{ opacity: 0, y: 24 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                <span
                  className={`absolute -left-20 top-6 z-10 hidden h-[52px] w-[52px] items-center justify-center border-[3px] border-border bg-foreground text-background md:flex`}
                  aria-hidden="true"
                >
                  <Icon size={24} strokeWidth={2.5} />
                </span>

                <button
                  onClick={() => toggleExpand(i)}
                  aria-expanded={isExpanded}
                  className="group block w-full text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
                >
                  <div
                    className={`border-l-[8px] ${tone} ${toneShadow} transition-transform duration-200 ease-editorial group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]`}
                  >
                    <div className="border-[3px] border-border bg-background p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span
                              className="rotate-[-2deg] border-[3px] border-border bg-brutal-yellow px-2.5 py-1 font-display text-metadata font-extrabold uppercase text-brutal-ink"
                            >
                              {item.year}
                            </span>
                            <span className="text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/50">
                              {t(`journey.types.${item.type}`)}
                            </span>
                          </div>
                          <h3 className="font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                            {t(item.titleKey)}
                          </h3>
                          <p className="mt-1 text-body font-bold text-foreground/60">{t(item.organizationKey)}</p>
                        </div>

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-border transition-all duration-200 ${
                            isExpanded ? "rotate-180 bg-foreground text-background" : "bg-muted"
                          }`}
                          aria-hidden="true"
                        >
                          <ChevronDown size={20} strokeWidth={3} />
                        </span>
                      </div>

                      {!isExpanded && (
                        <p className="mt-4 line-clamp-2 text-body text-foreground/70">{t(item.descriptionKey)}</p>
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <BrutalCard tone="muted" hover={false} className="mt-4 ml-5 p-5 sm:p-6">
                        <p className="text-body leading-relaxed text-foreground/80">{t(item.descriptionKey)}</p>

                        {item.technologies && item.technologies.length > 0 && (
                          <div className="mt-5 border-t-[3px] border-border pt-5">
                            <p className="mb-3 text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/60">
                              {t("journey.technologiesUsed")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-sm border-[3px] border-border bg-background px-3 py-1 text-caption font-bold"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 border-t-[3px] border-border pt-4">
                          <button
                            onClick={() => setExpandedIndex(null)}
                            className="rounded-sm border-[3px] border-border bg-brutal-pink px-3 py-1.5 text-metadata font-display font-extrabold uppercase text-brutal-ink transition-transform duration-150 hover:-translate-y-[2px] hover:shadow-brutal-sm"
                          >
                            {t("journey.clickToClose")}
                          </button>
                        </div>
                      </BrutalCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
