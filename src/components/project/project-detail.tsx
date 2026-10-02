import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Project } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectGallery } from "./project-gallery";
import { projects } from "@/data/projects";

export function ProjectDetail({ project }: { project: Project }) {
  const t = useTranslations();
  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[index - 1];
  const next = projects[index + 1];

  return (
    <article className="pb-24 pt-32">
      <div className="container-editorial">
        <Link href="/#work" className="mb-10 inline-flex items-center gap-2 text-body text-foreground/60 hover:text-foreground">
          <ArrowLeft size={16} /> {t("projectDetail.backToWorks")}
        </Link>

        <h1 className="text-display-sm font-display md:text-h1">{t(project.titleKey)}</h1>
        <p className="mt-3 text-body text-foreground/60">
          {t(project.categoryKey)} · {project.year}
        </p>

        <div
          className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted"
          style={{ aspectRatio: project.imageAspect }}
        >
          <Image src={project.image} alt={t(project.titleKey)} fill className="object-cover" priority />
        </div>

        <div className="mt-16 grid gap-16 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-12">
            <section>
              <h2 className="mb-3 text-h3 font-display">{t("projectDetail.overview")}</h2>
              <p className="text-body text-foreground/80">{t(project.caseStudy.overviewKey)}</p>
            </section>

            <section>
              <h2 className="mb-3 text-h3 font-display">{t("projectDetail.challenge")}</h2>
              <p className="text-body text-foreground/80">{t(project.caseStudy.problemKey)}</p>
            </section>

            <section>
              <h2 className="mb-3 text-h3 font-display">{t("projectDetail.solution")}</h2>
              <p className="text-body text-foreground/80">{t(project.caseStudy.solutionKey)}</p>
            </section>

            <section>
              <h2 className="mb-3 text-h3 font-display">{t("projectDetail.keyFeatures")}</h2>
              <ul className="flex flex-col gap-2 text-body text-foreground/80">
                {project.caseStudy.featuresKeys.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </section>

            {project.gallery.length > 0 && (
              <section>
                <h2 className="mb-4 text-h3 font-display">{t("projectDetail.gallery")}</h2>
                <ProjectGallery
                  images={project.gallery}
                  title={t(project.titleKey)}
                  aspect={project.imageAspect}
                />
              </section>
            )}

            <section>
              <h2 className="mb-3 text-h3 font-display">{t("projectDetail.results")}</h2>
              <p className="text-body text-foreground/80">{t(project.caseStudy.resultKey)}</p>
            </section>
          </div>

          <aside className="flex flex-col gap-8">
            <div>
              <h3 className="mb-3 text-caption text-foreground/50">{t("projectDetail.techStack")}</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {project.demoUrl && (
                <Button href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  {t("projectDetail.liveDemo")}
                </Button>
              )}
              {project.githubUrl && (
                <Button href={project.githubUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                  {t("projectDetail.sourceCode")}
                </Button>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-20 grid gap-6 border-t border-border pt-10 sm:grid-cols-2">
          {prev && (
            <Link href={`/projects/${prev.slug}`} className="group">
              <p className="text-caption text-foreground/50">{t("projectDetail.previousProject")}</p>
              <p className="mt-1 text-h3 font-display group-hover:text-accent">{t(prev.titleKey)}</p>
            </Link>
          )}
          {next && (
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <p className="text-caption text-foreground/50">{t("projectDetail.nextProject")}</p>
              <p className="mt-1 text-h3 font-display group-hover:text-accent">{t(next.titleKey)}</p>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
