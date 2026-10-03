"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/project/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIntersection } from "@/hooks/use-intersection";
import { Rocket } from "lucide-react";

export function Works() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="work" className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("works.eyebrow")} icon={Rocket} iconTone="blue">
            <span className="highlight">{t("works.title1")}</span>{" "}
            {t("works.title2")}
          </SectionHeading>
          <p className="-mt-4 mb-12 max-w-2xl text-body text-foreground/70">{t("works.subtitle")}</p>
        </motion.div>

        <div className="space-y-24">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 28, rotate: i % 2 === 0 ? -1 : 1 }}
              animate={isVisible ? { opacity: 1, y: 0, rotate: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
