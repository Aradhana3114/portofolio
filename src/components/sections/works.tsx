"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/project/project-card";
import { useIntersection } from "@/hooks/use-intersection";

export function Works() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="work" className="border-b border-border py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h2 className="mb-2 text-h1 font-display">{t("works.title1")}</h2>
          <h2 className="text-h1 font-display">{t("works.title2")}</h2>
          <p className="mt-4 text-body text-foreground/60">
            {t("works.subtitle")}
          </p>
        </motion.div>

        <div className="space-y-20">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
