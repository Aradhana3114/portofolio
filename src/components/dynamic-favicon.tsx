"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export function DynamicFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    const href = theme === "dark" ? "/images/mark-cream.png" : "/images/mark-ink.png";
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = href;
  }, [theme]);

  return null;
}
