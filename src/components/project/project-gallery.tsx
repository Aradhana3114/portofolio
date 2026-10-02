"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function ProjectGallery({ images, title, aspect }: { images: string[]; title: string; aspect?: string }) {
  const [active, setActive] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted"
            style={aspect ? { aspectRatio: aspect } : undefined}
          >
            <Image src={src} alt={`${title} screenshot ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-6"
            onClick={() => setActive(null)}
          >
            <button
              aria-label="Close gallery"
              className="absolute right-6 top-6 text-background"
              onClick={() => setActive(null)}
            >
              <X size={24} />
            </button>
            <div className="relative aspect-[16/10] w-full max-w-3xl">
              <Image src={images[active]} alt={`${title} screenshot`} fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
