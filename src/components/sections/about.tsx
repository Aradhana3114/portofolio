"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { techStack, skillCategories } from "@/data/skills";
import { useLocale } from "next-intl";
import { useIntersection } from "@/hooks/use-intersection";
import { GraduationCap } from "lucide-react";
import { FluidReveal } from "@/components/ui/fluid-reveal";

export function About() {
  const t = useTranslations();
  const locale = useLocale();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const categories = skillCategories[locale] || skillCategories.id;

  return (
    <section id="about" className="border-b border-border py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex items-center gap-4"
        >
          <h2 className="text-h1 font-display">{t("about.title")}</h2>
          <motion.span
            className="inline-block origin-[70%_70%] text-4xl"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          >
            👋
          </motion.span>
        </motion.div>

        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          {/* Left Column - Bio & Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border p-6">
              <h3 className="mb-3 text-h2 font-display">{t("about.greeting")}{profile.name.split(" ")[0]}.</h3>
              <p className="text-body leading-relaxed text-foreground/80">{t("profile.bio")}</p>
            </div>

            {/* Handle sits on the photo so it is anchored to something instead of
                floating between the paragraph and the image. */}
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
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 rounded-t-lg bg-gradient-to-b from-black/70 via-black/25 to-transparent px-4 pb-12 pt-4">
                <span className="font-display text-h3 text-white">
                  @{profile.name.split(" ")[0].toLowerCase()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Education & Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Education Card */}
            <div className="rounded-2xl border border-border p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap size={20} />
                    <span className="text-caption font-semibold text-foreground/60">{t("about.studentGrade")}</span>
                  </div>
                  <h4 className="text-h3 font-display">SMK AK Nusa Bangsa</h4>
                  <p className="mt-1 font-medium text-foreground/80">{t("about.program")}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-caption font-semibold text-foreground/60">{t("about.coursework")}</p>
                <div className="flex flex-wrap gap-2">
                  {[t("about.courses.web"), t("about.courses.db"), t("about.courses.se"), t("about.courses.oop")].map((course) => (
                    <span key={course} className="rounded-md bg-muted px-3 py-1 text-caption">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Tech Stack */}
            <div className="rounded-2xl border border-border p-6">
              <h3 className="mb-6 text-h3 font-display">{t("about.techStack")}</h3>
              <div className="space-y-6">
                {techStack.map((group, i) => (
                  <motion.div
                    key={group.categoryKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h4 className="mb-3 text-body font-semibold">{categories[group.categoryKey.replace("categories.", "")] || group.categoryKey}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item.name}
                          className="rounded-full border border-border bg-background px-4 py-2 text-caption font-medium transition-all hover:border-foreground"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full width so both columns finish at roughly the same height */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 rounded-2xl border border-border bg-muted p-6"
        >
          <h4 className="mb-3 text-h3 font-display">{t("about.myFocus")}</h4>
          <p className="text-body text-foreground/80">
            {t("profile.currentFocus")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
