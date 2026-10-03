"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/data/types";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Sticker } from "@/components/ui/sticker";

const frameCycle = ["bg-brutal-yellow", "bg-brutal-blue", "bg-brutal-pink", "bg-brutal-green"] as const;
const shadowCycle = [
  "shadow-brutal-yellow",
  "shadow-brutal-blue",
  "shadow-brutal-pink",
  "shadow-brutal-green",
] as const;

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const t = useTranslations();
  const frame = frameCycle[index % frameCycle.length];
  const frameShadow = shadowCycle[index % shadowCycle.length];

  return (
    <div className="group grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Project Image */}
      <div className={`order-2 border-[3px] border-border ${frame} ${frameShadow} lg:order-1`}>
        <div
          className="relative self-start bg-muted"
          style={project.imageAspect ? { aspectRatio: project.imageAspect } : { aspectRatio: "4 / 3" }}
        >
          <Image
            src={project.image}
            alt={t(project.titleKey)}
            fill
            className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-105"
          />
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-sm border-[3px] border-border bg-brutal-yellow px-4 py-2 text-caption font-display font-extrabold uppercase text-brutal-ink shadow-brutal transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-brutal-pink hover:shadow-brutal-md"
            >
              {t("works.visitSite")}
              <ExternalLink size={14} strokeWidth={3} />
            </a>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="order-1 flex flex-col justify-center lg:order-2">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Sticker tone="ink" rotate={-2} shape="pill">
            {String(index + 1).padStart(2, "0")}
          </Sticker>
          <Sticker tone="purple" rotate={2}>
            {t(project.categoryKey)}
          </Sticker>
          <span className="font-display text-caption font-extrabold uppercase tracking-[0.2em] text-foreground/50">
            {project.year}
          </span>
        </div>

        <h3 className="mb-4 font-display text-h2 font-extrabold uppercase leading-none tracking-tighter">
          {t(project.titleKey)}
        </h3>

        <p className="mb-6 max-w-xl text-body leading-relaxed text-foreground/75">{t(project.descriptionKey)}</p>

        {/* Metrics */}
        {project.caseStudy && (
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="border-[3px] border-border bg-brutal-blue px-5 py-3 text-brutal-ink shadow-brutal-sm">
              <p className="font-display text-h3 font-extrabold uppercase leading-none">{project.year}</p>
              <p className="mt-1 text-metadata font-bold uppercase tracking-widest opacity-70">{t("common.year")}</p>
            </div>
            <div className="border-[3px] border-border bg-brutal-green px-5 py-3 text-brutal-ink shadow-brutal-sm">
              <p className="font-display text-h3 font-extrabold uppercase leading-none">
                {project.technologies.length}+
              </p>
              <p className="mt-1 text-metadata font-bold uppercase tracking-widest opacity-70">
                {t("common.technologies")}
              </p>
            </div>
          </div>
        )}

        {/* Technologies */}
        <div className="mb-7 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-sm border-[3px] border-border bg-background px-3 py-1 text-caption font-bold transition-all duration-150 hover:-translate-y-[2px] hover:bg-brutal-yellow hover:shadow-brutal-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex w-fit items-center gap-2 rounded-sm border-[3px] border-border bg-foreground px-5 py-3 font-display text-body font-extrabold uppercase text-background shadow-brutal transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-brutal-yellow hover:text-brutal-ink hover:shadow-brutal-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
        >
          {t("works.readCaseStudy")}
          <ArrowUpRight size={18} strokeWidth={3} />
        </Link>
      </div>
    </div>
  );
}
