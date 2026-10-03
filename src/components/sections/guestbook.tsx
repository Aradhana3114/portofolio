"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GuestbookEntryWithReply } from "@/data/types";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIntersection } from "@/hooks/use-intersection";
import { profile } from "@/data/profile";
import { BrutalCard } from "@/components/ui/brutal-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { NotebookPen } from "lucide-react";

// Author label is fixed, never taken from input, so nobody can impersonate the
// owner through the guestbook form.
const OWNER_LABEL = profile.name.split(" ")[0];

const tapeCycle = ["bg-brutal-yellow", "bg-brutal-blue", "bg-brutal-pink", "bg-brutal-green"] as const;

export function Guestbook() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const [entries, setEntries] = useState<GuestbookEntryWithReply[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/guestbook")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to post.");
      }

      setEntries((prev) => [data.entry, ...prev]);
      setName("");
      setMessage("");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="guestbook" className="relative py-24">
      <div ref={ref} className="container-editorial grid gap-14 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -1 }}
          animate={isVisible ? { opacity: 1, y: 0, rotate: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <SectionHeading eyebrow={t("guestbook.eyebrow")} icon={NotebookPen} iconTone="orange">
            {t("guestbook.title")}
          </SectionHeading>
          <p className="-mt-4 mb-8 max-w-md text-body text-foreground/70">{t("guestbook.subtitle")}</p>

          <BrutalCard tone="muted" hover={false} className="p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                placeholder={t("guestbook.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
              />
              <Textarea
                placeholder={t("guestbook.messagePlaceholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                required
              />
              {status === "error" && (
                <p className="border-[3px] border-border bg-brutal-pink px-3 py-2 text-caption font-bold text-brutal-ink">
                  {errorMsg}
                </p>
              )}
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? t("common.sending") : t("guestbook.sign")}
              </Button>
            </form>
          </BrutalCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex max-h-[520px] flex-col gap-6 overflow-y-auto pr-2 pt-4"
        >
          {entries.length === 0 && (
            <p className="border-[3px] border-border bg-brutal-yellow px-4 py-3 text-body font-bold text-brutal-ink shadow-brutal-sm">
              {t("guestbook.empty")}
            </p>
          )}

          {entries.map((entry, i) => (
            <div key={entry.id} className="tape relative pt-4">
              <div
                className={`absolute left-1/2 top-0 h-3 w-20 -translate-x-1/2 -rotate-2 border-x-[3px] border-border ${tapeCycle[i % tapeCycle.length]}`}
                aria-hidden="true"
              />
              <article className="border-[3px] border-border bg-background p-5 shadow-brutal transition-transform duration-200 ease-editorial hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-md">
                <div className="mb-3 flex items-center justify-between gap-4 border-b-[3px] border-border pb-3">
                  <span className="font-display text-caption font-extrabold uppercase tracking-tight">{entry.name}</span>
                  <span className="shrink-0 border-[3px] border-border bg-muted px-2 py-0.5 text-metadata font-bold">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-body text-foreground/75">{entry.message}</p>

                {entry.reply && (
                  <div className="mt-4 border-[3px] border-border bg-brutal-blue p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="border-[3px] border-border bg-brutal-ink px-2 py-0.5 font-display text-metadata font-extrabold uppercase text-brutal-yellow">
                        {OWNER_LABEL}
                      </span>
                      <span className="text-metadata font-bold text-brutal-ink/60">
                        {new Date(entry.reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-body text-brutal-ink">{entry.reply.reply}</p>
                  </div>
                )}
              </article>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
