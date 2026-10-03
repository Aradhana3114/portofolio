import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface BaseProps {
  variant?: "primary" | "secondary" | "ink" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

type Props = ButtonAsButton | ButtonAsLink;

const variantMap = {
  primary: "bg-brutal-yellow text-brutal-ink border-border shadow-brutal hover:shadow-brutal-md",
  ink: "bg-foreground text-background border-border shadow-brutal hover:shadow-brutal-md",
  secondary: "bg-background text-foreground border-border shadow-brutal hover:shadow-brutal-md",
  ghost: "bg-transparent text-foreground border-transparent shadow-none hover:bg-muted",
} as const;

const sizeMap = {
  sm: "px-4 py-2 text-metadata",
  md: "px-6 py-3 text-body",
  lg: "px-8 py-4 text-body",
} as const;

export function Button({ variant = "primary", size = "md", children, className, ...props }: Props) {
  const styles = cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-sm border-[3px] font-display font-extrabold uppercase leading-none tracking-tight",
    "transition-all duration-150 ease-editorial",
    "hover:-translate-x-[2px] hover:-translate-y-[2px]",
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue",
    "disabled:pointer-events-none disabled:opacity-50",
    variantMap[variant],
    sizeMap[size],
    className
  );

  if ("href" in props && props.href) {
    const { href, target, rel } = props as ButtonAsLink;
    return (
      <Link href={href} target={target} rel={rel} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
