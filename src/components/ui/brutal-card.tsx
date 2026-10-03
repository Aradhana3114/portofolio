import { cn } from "@/lib/utils";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { type BrutalTone } from "./sticker";

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

type BrutalCardProps = {
  children: ReactNode;
  as?: ElementType;
  tone?: BrutalTone;
  tilt?: number;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function BrutalCard({
  children,
  as: Tag = "div",
  tone = "default",
  tilt = 0,
  hover = true,
  className,
  style,
}: BrutalCardProps) {
  const toneClasses = toneMap[tone];

  return (
    <Tag
      style={tilt ? { rotate: `${tilt}deg`, ...style } : style}
      className={cn(
        "relative border-[3px] border-brutal-ink",
        "transition-transform duration-200 ease-editorial",
        toneClasses.bg,
        toneClasses.shadow,
        hover && cn("hover:-translate-x-[3px] hover:-translate-y-[3px]", toneClasses.hoverShadow),
        className
      )}
    >
      {children}
    </Tag>
  );
}
