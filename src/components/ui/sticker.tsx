import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

export type BrutalTone = "default" | "muted" | "yellow" | "blue" | "pink" | "green" | "orange" | "purple" | "ink";

const toneMap: Record<BrutalTone, { bg: string; shadow: string; hoverShadow: string }> = {
  default: { bg: "bg-background", shadow: "shadow-brutal", hoverShadow: "hover:shadow-brutal-lg" },
  muted: { bg: "bg-muted", shadow: "shadow-brutal", hoverShadow: "hover:shadow-brutal-lg" },
  yellow: { bg: "bg-brutal-yellow", shadow: "shadow-brutal-yellow", hoverShadow: "hover:shadow-brutal-lg-yellow" },
  blue: { bg: "bg-brutal-blue", shadow: "shadow-brutal-blue", hoverShadow: "hover:shadow-brutal-lg-blue" },
  pink: { bg: "bg-brutal-pink", shadow: "shadow-brutal-pink", hoverShadow: "hover:shadow-brutal-lg-pink" },
  green: { bg: "bg-brutal-green", shadow: "shadow-brutal-green", hoverShadow: "hover:shadow-brutal-lg-green" },
  orange: { bg: "bg-brutal-orange", shadow: "shadow-brutal-orange", hoverShadow: "hover:shadow-brutal-lg-orange" },
  purple: { bg: "bg-brutal-purple", shadow: "shadow-brutal-purple", hoverShadow: "hover:shadow-brutal-lg-purple" },
  ink: { bg: "bg-foreground text-background", shadow: "shadow-brutal", hoverShadow: "hover:shadow-brutal-lg" },
};

const shapeMap = {
  square: "rounded-sm",
  round: "rounded-brutal-lg",
  pill: "rounded-full",
  circle: "rounded-full aspect-square",
} as const;

type StickerProps = {
  children: ReactNode;
  tone?: BrutalTone;
  shape?: keyof typeof shapeMap;
  rotate?: number;
  wiggle?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Sticker({
  children,
  tone = "yellow",
  shape = "square",
  rotate = 0,
  wiggle = false,
  className,
  style,
}: StickerProps) {
  const toneClasses = toneMap[tone];

  return (
    <span
      style={{ rotate: `${rotate}deg`, ...style }}
      className={cn(
        "inline-flex select-none items-center gap-2 border-[3px] border-brutal-ink px-4 py-1.5 text-caption font-display font-extrabold uppercase leading-none tracking-tight",
        "transition-transform duration-200 ease-editorial",
        toneClasses.bg,
        shapeMap[shape],
        wiggle && "hover:animate-wiggle motion-reduce:hover:animate-none",
        !wiggle && "hover:rotate-0",
        className
      )}
    >
      {children}
    </span>
  );
}
