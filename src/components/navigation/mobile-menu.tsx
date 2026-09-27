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
    { href: "#home", label: t("nav.home") },
    { href: "#about", label: t("nav.about") },
    { href: "#work", label: t("nav.projects") },
    { href: "#journey", label: t("nav.journey") },
    { href: "#guestbook", label: t("nav.guestbook") },
    { href: "#contact", label: t("nav.contact") },
  ];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur-xl"
          >
            <ul className="container-editorial flex flex-col gap-1 py-4">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-body font-medium text-foreground/70 transition-all hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="border-t border-border pt-2 mt-2">
                <div className="px-4 py-2">
                  <p className="mb-2 text-caption font-semibold text-foreground/50">Language</p>
                  <div className="flex flex-col gap-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-body font-medium text-foreground/70 transition-all hover:bg-muted hover:text-foreground"
                      >
                        <Image src={lang.flag} alt={lang.label} width={24} height={16} className="rounded-[2px]" />
                        <span className="flex-1 text-left">{lang.label}</span>
                        {locale === lang.code && <Check size={14} className="text-accent" />}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-body font-medium text-foreground/70 transition-all hover:bg-muted hover:text-foreground"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
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
