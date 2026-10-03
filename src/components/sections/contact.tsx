"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Instagram, Send, MessageCircle } from "lucide-react";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import { useIntersection } from "@/hooks/use-intersection";
import { Button } from "@/components/ui/button";
import { BrutalCard } from "@/components/ui/brutal-card";
import { SectionHeading } from "@/components/ui/section-heading";

const socialLinks = [
  { key: "linkedin", href: `https://linkedin.com/in/${socials.linkedin}`, icon: Linkedin, tone: "bg-brutal-blue" },
  { key: "github", href: `https://github.com/${socials.github}`, icon: Github, tone: "bg-brutal-yellow" },
  { key: "instagram", href: `https://instagram.com/${socials.instagram}`, icon: Instagram, tone: "bg-brutal-pink" },
];

const fieldStyles =
  "w-full rounded-sm border-[3px] border-border bg-background px-4 py-3 text-body transition-all duration-150 focus:outline-none focus:shadow-brutal-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue";

export function Contact() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Project Collaboration",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send message.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "Project Collaboration", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="relative py-24">
      <div ref={ref} className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-14 flex flex-col items-center text-center"
        >
          <div className="mb-6">
            <SectionHeading eyebrow={t("contact.eyebrow")} icon={MessageCircle} iconTone="yellow" className="mb-0">
              <span className="highlight">{t("contact.title1")}</span> {t("contact.title2")}
            </SectionHeading>
          </div>
          <p className="mx-auto max-w-2xl text-body text-foreground/70">{t("contact.description")}</p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.2fr] lg:gap-16">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1.5 }}
            animate={isVisible ? { opacity: 1, y: 0, rotate: -1.5 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="space-y-8"
          >
            <BrutalCard tone="yellow" hover={false} tilt={-1.5} className="bubble-tail p-6 sm:p-7">
              <h3 className="mb-4 font-display text-caption font-extrabold uppercase tracking-[0.2em] text-brutal-ink/70">
                {t("contact.directEmail")}
              </h3>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-3 break-all font-display text-h3 font-extrabold uppercase leading-tight tracking-tighter text-brutal-ink underline decoration-[5px] decoration-brutal-pink underline-offset-4 transition-colors hover:text-brutal-pink"
              >
                <Mail size={26} strokeWidth={3} className="shrink-0" />
                {profile.email}
              </a>
            </BrutalCard>

            <BrutalCard tone="purple" hover={false} tilt={1.5} className="p-6 sm:p-7">
              <h3 className="mb-4 font-display text-caption font-extrabold uppercase tracking-[0.2em] text-brutal-ink/70">
                {t("contact.socialPresence")}
              </h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map(({ key, href, icon: Icon, tone }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-14 w-14 items-center justify-center rounded-sm border-[3px] border-border text-brutal-ink shadow-brutal transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue ${tone}`}
                    aria-label={key}
                  >
                    <Icon size={24} strokeWidth={2.75} />
                  </a>
                ))}
              </div>
            </BrutalCard>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 1 }}
            animate={isVisible ? { opacity: 1, y: 0, rotate: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <BrutalCard tone="green" hover={false} tilt={1} className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/70"
                  >
                    {t("contact.yourName")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={fieldStyles}
                    placeholder={t("contact.namePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/70"
                  >
                    {t("contact.yourEmail")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={fieldStyles}
                    placeholder={t("contact.emailPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/70"
                  >
                    {t("contact.subject")}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={fieldStyles}
                  >
                    <option value="Project Collaboration">{t("contact.subjects.collaboration")}</option>
                    <option value="Job Opportunity">{t("contact.subjects.job")}</option>
                    <option value="General Inquiry">{t("contact.subjects.inquiry")}</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-metadata font-display font-extrabold uppercase tracking-[0.2em] text-foreground/70"
                  >
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={fieldStyles}
                    placeholder={t("contact.messagePlaceholder")}
                  />
                </div>

                {status === "success" && (
                  <p className="border-[3px] border-border bg-brutal-green px-4 py-3 text-caption font-bold">
                    {t("contact.success")}
                  </p>
                )}
                {status === "error" && (
                  <p className="border-[3px] border-border bg-brutal-pink px-4 py-3 text-caption font-bold text-brutal-ink">
                    {errorMsg}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={status === "loading"} className="w-full">
                  {status === "loading" ? t("common.sending") : t("contact.send")}
                  <Send size={18} strokeWidth={3} />
                </Button>
              </form>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
