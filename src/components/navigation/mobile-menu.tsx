"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X, Sun, Moon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const languages = [
  { code: "id", label: "Bahasa Indonesia", flag: "/images/bendera/indonesia.webp" },
  { code: "en", label: "English", flag: "/images/bendera/amerika.webp" },
];

export function MobileMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const links = [
    { href: "#home", label: t("nav.home"), tone: "bg-brutal-yellow" },
    { href: "#about", label: t("nav.about"), tone: "bg-brutal-blue" },
    { href: "#work", label: t("nav.projects"), tone: "bg-brutal-pink" },
    { href: "#journey", label: t("nav.journey"), tone: "bg-brutal-green" },
    { href: "#guestbook", label: t("nav.guestbook"), tone: "bg-brutal-orange" },
    { href: "#contact", label: t("nav.contact"), tone: "bg-brutal-purple" },
  ];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-pink text-brutal-ink shadow-brutal-sm transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
      >
        {open ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-x-3 top-full mt-3 border-[3px] border-border bg-background p-3 shadow-brutal-lg"
          >
            <ul className="flex flex-col gap-2">
              {links.map((link, i) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{ rotate: `${i % 2 === 0 ? -1 : 1}deg` }}
                    className={`block rounded-sm border-[3px] border-border px-4 py-3 text-body font-display font-extrabold uppercase leading-none tracking-tight text-brutal-ink transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue ${link.tone}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              <li className="mt-2 border-t-[3px] border-border pt-3">
                <p className="mb-2 px-1 text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/60">
                  Language
                </p>
                <div className="flex flex-col gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className="flex items-center gap-3 rounded-sm border-[3px] border-border bg-muted px-3 py-2.5 text-caption font-bold transition-colors hover:bg-brutal-yellow hover:text-brutal-ink"
                    >
                      <Image src={lang.flag} alt="" width={24} height={16} className="rounded-[2px] border-[2px] border-border" />
                      <span className="flex-1 text-left">{lang.label}</span>
                      {locale === lang.code && <Check size={16} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </li>

              <li>
                <button
                  onClick={toggle}
                  className="flex w-full items-center gap-2 rounded-sm border-[3px] border-border bg-foreground px-4 py-3 text-body font-display font-extrabold uppercase leading-none text-background transition-all duration-150 hover:bg-brutal-purple hover:text-brutal-ink"
                >
                  {theme === "dark" ? <Sun size={18} strokeWidth={3} /> : <Moon size={18} strokeWidth={3} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
