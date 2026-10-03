"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Sun, Moon, Globe, Check } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { MobileMenu } from "./mobile-menu";

const languages = [
  { code: "id", label: "Bahasa Indonesia", flag: "/images/bendera/indonesia.webp" },
  { code: "en", label: "English", flag: "/images/bendera/amerika.webp" },
];

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const { theme, toggle } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "#home", label: t("nav.home"), tone: "bg-brutal-yellow" },
    { href: "#about", label: t("nav.about"), tone: "bg-brutal-blue" },
    { href: "#work", label: t("nav.projects"), tone: "bg-brutal-pink" },
    { href: "#journey", label: t("nav.journey"), tone: "bg-brutal-green" },
    { href: "#guestbook", label: t("nav.guestbook"), tone: "bg-brutal-orange" },
    { href: "#contact", label: t("nav.contact"), tone: "bg-brutal-purple" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 120);
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setLangOpen(false);
  };

  return (
    <motion.header
      animate={{ y: hidden ? -120 : 0 }}
      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="border-b-[3px] border-border bg-background">
        <div className="container-editorial flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="#home" className="group flex items-center gap-3">
            {/* The tile is yellow in both themes, so the mark stays dark ink —
                a cream mark on yellow would only reach 1.32:1. mark-ink.png is
                the tightly cropped mark (hitam.png is 89% empty padding). */}
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-brutal-ink bg-brutal-yellow p-0.5 shadow-brutal-sm transition-transform duration-200 group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-brutal">
              <Image
                src="/images/mark-ink.png"
                alt=""
                width={40}
                height={40}
                priority
                className="object-contain"
              />
            </span>
            <span className="hidden font-display text-caption font-extrabold uppercase leading-tight tracking-tighter sm:block">
              Aradhana
              <br />
              <span className="text-foreground/50">Dev</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-sm border-[3px] border-border px-3 py-1.5 text-caption font-display font-extrabold uppercase leading-none tracking-tight text-brutal-ink transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue ${link.tone}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div ref={langRef} className="relative hidden md:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Switch language"
                aria-expanded={langOpen}
                className="flex h-11 items-center gap-1.5 rounded-sm border-[3px] border-border bg-background px-3 text-caption font-display font-extrabold uppercase transition-all duration-150 hover:bg-brutal-blue hover:text-brutal-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
              >
                <Globe size={14} strokeWidth={3} />
                <span>{locale.toUpperCase()}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-3 w-52 border-[3px] border-border bg-background shadow-brutal-md">
                  {languages.map((lang, i) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-caption font-bold transition-colors hover:bg-brutal-yellow hover:text-brutal-ink ${
                        i > 0 ? "border-t-[3px] border-border" : ""
                      }`}
                    >
                      <Image src={lang.flag} alt="" width={24} height={16} className="rounded-[2px] border-[2px] border-border" />
                      <span className="flex-1 text-left">{lang.label}</span>
                      {locale === lang.code && <Check size={16} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="flex h-11 w-11 items-center justify-center rounded-sm border-[3px] border-border bg-foreground text-background transition-all duration-150 hover:bg-brutal-purple hover:text-brutal-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue"
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={3} /> : <Moon size={18} strokeWidth={3} />}
            </button>

            <MobileMenu />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
