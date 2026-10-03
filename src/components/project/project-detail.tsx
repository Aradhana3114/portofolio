import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Project } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectGallery } from "./project-gallery";
import { projects } from "@/data/projects";
import { Reveal } from "@/components/ui/reveal";
import { Sticker } from "@/components/ui/sticker";

const sections = [
  { key: "overview", bodyKey: "overviewKey", tone: "bg-brutal-yellow" },
  { key: "challenge", bodyKey: "problemKey", tone: "bg-brutal-blue" },
  { key: "solution", bodyKey: "solutionKey", tone: "bg-brutal-green" },
  { key: "results", bodyKey: "resultKey", tone: "bg-brutal-purple" },
] as const;

export function ProjectDetail({ project }: { project: Project }) {
  const t = useTranslations();
  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[index - 1];
  const next = projects[index + 1];

  return (
    <article className="pb-24 pt-32">
      <div className="container-editorial">
        <Link
          href="/#work"
          className="mb-10 inline-flex items-center gap-2 rounded-sm border-[3px] border-border bg-background px-4 py-2 font-display text-caption font-extrabold uppercase text-foreground shadow-brutal-sm transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-brutal-yellow hover:shadow-brutal focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
        >
          <ArrowLeft size={16} strokeWidth={3} /> {t("projectDetail.backToWorks")}
        </Link>

        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <Sticker tone="pink" rotate={-2}>
              {t(project.categoryKey)}
            </Sticker>
            <Sticker tone="yellow" rotate={2} shape="pill">
              {project.year}
            </Sticker>
          </div>
          <h1 className="mt-5 font-display text-display-sm font-extrabold uppercase leading-[0.92] tracking-tighter">
            {t(project.titleKey)}
          </h1>
        </Reveal>

        <Reveal delay={0.1} y={24}>
          <div className="mt-10 border-[3px] border-border bg-brutal-pink p-3 shadow-brutal-lg">
            <div className="relative aspect-[16/9] bg-muted" style={{ aspectRatio: project.imageAspect }}>
              <Image src={project.image} alt={t(project.titleKey)} fill className="object-cover" priority />
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-14 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-12">
            {sections.map((section, i) => (
              <Reveal key={section.key} delay={i * 0.05}>
                <section className="border-[3px] border-border bg-background p-6 shadow-brutal sm:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`h-8 w-3 shrink-0 border-[3px] border-border ${section.tone}`} aria-hidden="true" />
                    <h2 className="font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                      {t(`projectDetail.${section.key}`)}
                    </h2>
                  </div>
                  <p className="text-body text-foreground/80">{t(project.caseStudy[section.bodyKey])}</p>
                </section>
              </Reveal>
            ))}

            <Reveal>
              <section className="border-[3px] border-border bg-muted p-6 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-8 w-3 shrink-0 border-[3px] border-border bg-brutal-orange" aria-hidden="true" />
                  <h2 className="font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                    {t("projectDetail.keyFeatures")}
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {project.caseStudy.featuresKeys.map((key, i) => (
                    <Reveal key={key} delay={i * 0.06} y={10}>
                      <li className="flex items-start gap-3 text-body text-foreground/80">
                        <span
                          className="mt-1.5 h-3.5 w-3.5 shrink-0 rotate-45 border-[3px] border-border bg-brutal-yellow"
                          aria-hidden="true"
                        />
                        <span>{t(key)}</span>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </section>
            </Reveal>

            {project.gallery.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="mb-5 font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                    {t("projectDetail.gallery")}
                  </h2>
                  <ProjectGallery images={project.gallery} title={t(project.titleKey)} aspect={project.imageAspect} />
                </section>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.1}>
            <aside className="sticky top-28 flex flex-col gap-6">
              <div className="border-[3px] border-border bg-brutal-yellow p-5 text-brutal-ink shadow-brutal">
                <h3 className="mb-4 font-display text-caption font-extrabold uppercase tracking-[0.2em] opacity-70">
                  {t("projectDetail.techStack")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} className="bg-background">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {project.demoUrl && (
                  <Button href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    {t("projectDetail.liveDemo")}
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    className="w-full"
                  >
                    {t("projectDetail.sourceCode")}
                  </Button>
                )}
              </div>
            </aside>
          </Reveal>
        </div>

        <Reveal className="mt-20 grid gap-6 sm:grid-cols-2">
          {prev && (
            <Link
              href={`/projects/${prev.slug}`}
              className="group border-[3px] border-border bg-background p-5 shadow-brutal transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:bg-brutal-blue hover:shadow-brutal-md"
            >
              <p className="font-display text-metadata font-extrabold uppercase tracking-[0.2em] opacity-60">
                ← {t("projectDetail.previousProject")}
              </p>
              <p className="mt-2 font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                {t(prev.titleKey)}
              </p>
            </Link>
          )}
          {next && (
            <Link
              href={`/projects/${next.slug}`}
              className="group border-[3px] border-border bg-background p-5 text-right shadow-brutal transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:bg-brutal-pink hover:shadow-brutal-md"
            >
              <p className="font-display text-metadata font-extrabold uppercase tracking-[0.2em] opacity-60">
                {t("projectDetail.nextProject")} →
              </p>
              <p className="mt-2 font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter">
                {t(next.titleKey)}
              </p>
            </Link>
          )}
        </Reveal>
      </div>
    </article>
  );
}
