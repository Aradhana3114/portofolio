"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const frameCycle = ["bg-brutal-yellow", "bg-brutal-blue", "bg-brutal-pink", "bg-brutal-green"] as const;

export function ProjectGallery({ images, title, aspect }: { images: string[]; title: string; aspect?: string }) {
  const [active, setActive] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`${title} screenshot ${i + 1}`}
            className={`group relative border-[3px] border-border p-2 shadow-brutal transition-transform duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue ${
              frameCycle[i % frameCycle.length]
            }`}
          >
            <div className="relative aspect-[16/10] bg-muted" style={aspect ? { aspectRatio: aspect } : undefined}>
              <Image
                src={src}
                alt={`${title} screenshot ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-105"
              />
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="bg-foreground/95 fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setActive(null)}
          >
            <button
              aria-label="Close gallery"
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-yellow text-brutal-ink shadow-brutal transition-transform duration-150 hover:rotate-90"
              onClick={() => setActive(null)}
            >
              <X size={24} strokeWidth={3} />
            </button>
            <div className="relative aspect-[16/10] w-full max-w-3xl border-[3px] border-border bg-muted p-2 shadow-brutal-lg">
              <Image src={images[active]} alt={`${title} screenshot`} fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
