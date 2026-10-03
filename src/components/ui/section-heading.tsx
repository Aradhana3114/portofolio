import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
  /** Tone for the icon tile. */
  iconTone?: "yellow" | "blue" | "pink" | "green" | "orange" | "purple";
  id?: string;
  className?: string;
  scribble?: boolean;
  highlight?: boolean;
};

const iconToneMap = {
  yellow: "bg-brutal-yellow",
  blue: "bg-brutal-blue",
  pink: "bg-brutal-pink",
  green: "bg-brutal-green",
  orange: "bg-brutal-orange",
  purple: "bg-brutal-purple",
} as const;

export function SectionHeading({
  children,
  eyebrow,
  icon: Icon,
  iconTone = "yellow",
  id,
  className,
  scribble = true,
  highlight = false,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-10", className)}>
      {eyebrow && (
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-block h-[3px] w-10 bg-brutal-pink" aria-hidden="true" />
          <span className="text-caption font-display font-extrabold uppercase tracking-[0.2em] text-foreground/70">
            {eyebrow}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <h2 id={id} className={cn("text-h1 display-caps", highlight && "highlight")}>
          {children}
        </h2>

        {Icon && (
          <span
            aria-hidden="true"
            style={{ rotate: "-4deg" }}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-[3px] border-brutal-ink text-brutal-ink shadow-brutal-sm",
              "transition-transform duration-200 ease-editorial motion-safe:hover:animate-wiggle",
              iconToneMap[iconTone]
            )}
          >
            <Icon size={22} strokeWidth={2.75} />
          </span>
        )}
      </div>

      {scribble && (
        <svg
          className="mt-3 h-3 w-40 max-w-full text-brutal-pink"
          viewBox="0 0 240 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8.5C31 3 61 2.5 92 4.5c26 1.7 48 3.4 72 1.6 20-1.5 44-3.6 73-1.9"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
