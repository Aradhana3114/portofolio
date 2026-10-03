"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { techStack, skillCategories } from "@/data/skills";
import { useIntersection } from "@/hooks/use-intersection";
import { BrutalCard } from "@/components/ui/brutal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Boxes } from "lucide-react";

const toneCycle = [
  { bar: "bg-brutal-blue", dot: "bg-brutal-blue", tilt: -1.2 },
  { bar: "bg-brutal-pink", dot: "bg-brutal-pink", tilt: 1 },
  { bar: "bg-brutal-green", dot: "bg-brutal-green", tilt: -0.8 },
  { bar: "bg-brutal-orange", dot: "bg-brutal-orange", tilt: 1.4 },
] as const;

const LEVELS = {
  proficient: 3,
  intermediate: 2,
  learning: 1,
} as const;

export function TechStack() {
  const t = useTranslations();
  const locale = useLocale();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const categories = skillCategories[locale] || skillCategories.id;

  return (
    <section className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("techStackSection.eyebrow")} icon={Boxes} iconTone="pink">
            {t("techStackSection.title")}
          </SectionHeading>
        </motion.div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((group, i) => {
            const tone = toneCycle[i % toneCycle.length];

            return (
              <motion.div
                key={group.categoryKey}
                initial={{ opacity: 0, y: 24, rotate: tone.tilt * 2 }}
                animate={isVisible ? { opacity: 1, y: 0, rotate: tone.tilt } : {}}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <BrutalCard hover={false} tilt={tone.tilt} className="h-full bg-muted p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`h-8 w-3 shrink-0 border-[3px] border-border ${tone.bar}`} aria-hidden="true" />
                    <h3 className="font-display text-caption font-extrabold uppercase leading-tight tracking-[0.15em]">
                      {categories[group.categoryKey.replace("categories.", "")] || group.categoryKey}
                    </h3>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {group.items.map((item) => {
                      const filled = item.level ? LEVELS[item.level] : 0;

                      return (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-3 rounded-sm border-[3px] border-border bg-background px-3 py-2 transition-all duration-150 hover:-translate-x-[2px] hover:shadow-brutal-sm"
                        >
                          <span className="text-caption font-bold">{item.name}</span>
                          <span
                            className="flex shrink-0 items-center gap-[3px]"
                            title={item.level ? t(`techStackSection.levels.${item.level}`) : undefined}
                          >
                            {[1, 2, 3].map((step) => (
                              <span
                                key={step}
                                aria-hidden="true"
                                className={`h-3 w-3 border-[2px] border-border ${
                                  step <= filled ? tone.dot : "bg-background opacity-40"
                                }`}
                              />
                            ))}
                            <span className="sr-only">
                              {item.level ? t(`techStackSection.levels.${item.level}`) : ""}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </BrutalCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
