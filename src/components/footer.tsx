import { useTranslations } from "next-intl";
import { Github, Linkedin, Instagram } from "lucide-react";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";

const socialLinks = [
  { label: "GitHub", href: `https://github.com/${socials.github}`, icon: Github, tone: "bg-brutal-yellow" },
  { label: "LinkedIn", href: `https://linkedin.com/in/${socials.linkedin}`, icon: Linkedin, tone: "bg-brutal-blue" },
  { label: "Instagram", href: `https://instagram.com/${socials.instagram}`, icon: Instagram, tone: "bg-brutal-pink" },
];

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t-[5px] border-border bg-brutal-purple">
      <div className="bg-halftone-lg">
        {/* Extra bottom padding keeps the row clear of the fixed music player. */}
        <div className="container-editorial flex flex-col gap-6 py-7 pb-28 sm:pb-24 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-block -rotate-2 border-[3px] border-border bg-brutal-yellow px-3 py-1 font-display text-metadata font-extrabold uppercase tracking-[0.2em] text-brutal-ink shadow-brutal-sm">
              {t("common.endOfPage")}
            </span>
            <span className="font-display text-caption font-extrabold uppercase tracking-tight text-brutal-ink">
              © {currentYear} {profile.name}
            </span>
            <span className="text-metadata font-medium text-brutal-ink/60">{t("common.allRights")}</span>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon, tone }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-[3px] border-border text-brutal-ink shadow-brutal transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue ${tone}`}
              >
                <Icon size={20} strokeWidth={2.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
