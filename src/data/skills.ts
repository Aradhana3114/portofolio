import { TechStack } from "./types";

export const techStack: TechStack[] = [
  {
    categoryKey: "categories.frontend",
    items: [
      { name: "Next.js", level: "intermediate" },
      { name: "React", level: "intermediate" },
      { name: "TypeScript", level: "intermediate" },
      { name: "Tailwind CSS", level: "proficient" },
    ],
  },
  {
    categoryKey: "categories.backend",
    items: [
      { name: "Node.js", level: "intermediate" },
      { name: "Supabase", level: "proficient" },
      { name: "REST API", level: "proficient" },
    ],
  },
  {
    categoryKey: "categories.database",
    items: [
      { name: "PostgreSQL", level: "intermediate" },
      { name: "MySQL", level: "proficient" },
    ],
  },
  {
    categoryKey: "categories.tools",
    items: [
      { name: "Git & GitHub", level: "proficient" },
      { name: "Figma", level: "intermediate" },
      { name: "Vercel", level: "proficient" },
    ],
  },
];

export const skillCategories: Record<string, Record<string, string>> = {
  id: {
    frontend: "Frontend",
    backend: "Backend",
    database: "Database",
    tools: "Tools & Design",
  },
  en: {
    frontend: "Frontend",
    backend: "Backend",
    database: "Database",
    tools: "Tools & Design",
  },
};
