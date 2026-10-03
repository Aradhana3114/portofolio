import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border-[3px] border-border bg-background px-3 py-1 text-caption font-display font-bold uppercase leading-none tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
