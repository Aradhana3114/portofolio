"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GuestbookEntry } from "@/data/types";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIntersection } from "@/hooks/use-intersection";

export function Guestbook() {
  const t = useTranslations();
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
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
    <section id="guestbook" className="border-b border-border py-24">
      <div ref={ref} className="container-editorial grid gap-12 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mb-6 text-h2 font-display">{t("guestbook.title")}</h2>
          <p className="mb-8 max-w-md text-body text-foreground/70">
            {t("guestbook.subtitle")}
          </p>

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
            {status === "error" && <p className="text-caption text-red-600">{errorMsg}</p>}
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? t("common.sending") : t("guestbook.sign")}
            </Button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex max-h-[420px] flex-col gap-4 overflow-y-auto border-t border-border pt-6 md:border-t-0 md:border-l md:pl-16 md:pt-0"
        >
          {entries.length === 0 && (
            <p className="text-body text-foreground/50">{t("guestbook.empty")}</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="border-b border-border/60 pb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-body font-medium">{entry.name}</span>
                <span className="text-metadata text-foreground/40">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-body text-foreground/70">{entry.message}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
