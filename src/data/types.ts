export interface Project {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  year: string;
  categoryKey: string;
  featured: boolean;
  technologies: string[];
  image: string;
  gallery: string[];
  demoUrl?: string;
  githubUrl?: string;
  caseStudy: {
    overviewKey: string;
    problemKey: string;
    solutionKey: string;
    featuresKeys: string[];
    challengesKeys: string[];
    resultKey: string;
  };
}

export interface JourneyItem {
  year: string;
  titleKey: string;
  organizationKey: string;
  descriptionKey: string;
  type: "education" | "project" | "work" | "learning";
  technologies?: string[];
}

export interface TechStack {
  categoryKey: string;
  items: {
    name: string;
    level?: "learning" | "intermediate" | "proficient";
  }[];
}

export interface Service {
  titleKey: string;
  descriptionKey: string;
  deliverablesKeys: string[];
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export interface GuestbookReply {
  id: string;
  entry_id: string;
  reply: string;
  created_at: string;
  updated_at: string;
}

/** Public shape: an entry plus at most one owner reply, nested for rendering. */
export interface GuestbookEntryWithReply extends GuestbookEntry {
  reply: GuestbookReply | null;
}

/** Admin shape: every entry with all its replies, plus unread-first ordering. */
export interface AdminGuestbookEntry extends GuestbookEntry {
  replies: GuestbookReply[];
}
