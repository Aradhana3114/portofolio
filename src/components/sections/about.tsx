"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { techStack, skillCategories } from "@/data/skills";
import { useLocale } from "next-intl";
import { useIntersection } from "@/hooks/use-intersection";
import { GraduationCap, Hand } from "lucide-react";
import { FluidReveal } from "@/components/ui/fluid-reveal";
import { BrutalCard } from "@/components/ui/brutal-card";
import { Sticker } from "@/components/ui/sticker";
import { SectionHeading } from "@/components/ui/section-heading";

export function About() {
  const t = useTranslations();
  const locale = useLocale();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const categories = skillCategories[locale] || skillCategories.id;

  return (
    <section id="about" className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("about.eyebrow")} icon={Hand} iconTone="orange">
            {t("about.title")}
          </SectionHeading>
        </motion.div>

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          {/* Left Column - Bio & Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1.5 }}
            animate={isVisible ? { opacity: 1, y: 0, rotate: -1.5 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="space-y-8"
          >
            <BrutalCard tone="yellow" hover={false} tilt={-1.5} className="bubble-tail p-6 sm:p-7">
              <Sticker tone="orange" rotate={-4} className="mb-4">
                {t("common.hello")}
              </Sticker>
              <h3 className="mb-3 font-display text-h2 font-extrabold uppercase leading-none tracking-tighter text-brutal-ink">
                {t("about.greeting")} {profile.name.split(" ")[0]}.
              </h3>
              <p className="text-body font-medium leading-relaxed text-brutal-ink/80">{t("profile.bio")}</p>
            </BrutalCard>

            <BrutalCard tone="blue" tilt={1.5} className="p-3">
              <div className="relative">
                <FluidReveal
                  baseSrc="/images/me/me.png"
                  revealSrc="/images/me/spiderman.png"
                  hint={t("about.revealHint")}
                  baseFocus={{ x: 0.478, y: 0.727 }}
                  baseZoom={1.55}
                  revealFocus={{ x: 0.493, y: 0.794 }}
                  revealZoom={1.9}
                  fadeOnLeave
                  idleAnimation
                  edgeGlow
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b-[3px] border-border bg-foreground px-4 py-2">
                  <span className="font-display text-caption font-extrabold uppercase tracking-tight text-background">
                    @{profile.name.split(" ")[0].toLowerCase()}
                  </span>
                </div>
              </div>
            </BrutalCard>
          </motion.div>

          {/* Right Column - Education & Tech Stack */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 1.5 }}
              animate={isVisible ? { opacity: 1, y: 0, rotate: 1.5 } : {}}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <BrutalCard tone="pink" hover={false} tilt={1.5} className="p-6 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center border-[3px] border-border bg-brutal-yellow text-brutal-ink">
                    <GraduationCap size={22} strokeWidth={2.5} />
                  </span>
                  <Sticker tone="ink" rotate={-2}>
                    {t("about.studentGrade")}
                  </Sticker>
                </div>

                <h4 className="text-h3 font-display font-extrabold uppercase leading-tight tracking-tighter">
                  SMK AK Nusa Bangsa
                </h4>
                <p className="mt-1 font-display text-body font-bold uppercase text-foreground/70">
                  {t("about.program")}
                </p>

                <div className="mt-5 border-t-[3px] border-border pt-5">
                  <p className="mb-3 text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/60">
                    {t("about.coursework")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[t("about.courses.web"), t("about.courses.db"), t("about.courses.se"), t("about.courses.oop")].map(
                      (course) => (
                        <span
                          key={course}
                          className="rounded-sm border-[3px] border-border bg-background px-3 py-1 text-caption font-bold"
                        >
                          {course}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </BrutalCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -1 }}
              animate={isVisible ? { opacity: 1, y: 0, rotate: -1 } : {}}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <BrutalCard tone="green" hover={false} tilt={-1} className="p-6 sm:p-7">
                <h3 className="mb-5 text-h3 font-display font-extrabold uppercase leading-tight tracking-tighter">
                  {t("about.techStack")}
                </h3>
                <div className="space-y-6">
                  {techStack.map((group, i) => (
                    <motion.div
                      key={group.categoryKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h4 className="mb-3 text-caption font-display font-extrabold uppercase tracking-[0.15em] text-foreground/70">
                        {categories[group.categoryKey.replace("categories.", "")] || group.categoryKey}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item.name}
                            className="rounded-sm border-[3px] border-border bg-background px-3 py-1.5 text-caption font-bold transition-all duration-150 hover:-translate-y-[2px] hover:bg-brutal-yellow hover:shadow-brutal-sm"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </BrutalCard>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 1 }}
          animate={isVisible ? { opacity: 1, y: 0, rotate: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="mt-12"
        >
          <BrutalCard tone="purple" hover={false} tilt={1} className="bg-halftone p-6 sm:p-7">
            <h4 className="mb-3 text-h3 font-display font-extrabold uppercase leading-tight tracking-tighter">
              {t("about.myFocus")}
            </h4>
            <p className="text-body text-foreground/80">{t("profile.currentFocus")}</p>
          </BrutalCard>
        </motion.div>
      </div>
    </section>
  );
}
