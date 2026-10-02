import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer";
import { ProjectDetail } from "@/components/project/project-detail";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicFavicon } from "@/components/dynamic-favicon";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.titleKey} — Case Study`,
    description: project.descriptionKey,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <ThemeProvider>
        <DynamicFavicon />
        <Navbar />
        <ProjectDetail project={project} />
        <Footer />
      </ThemeProvider>
    </>
  );
}
