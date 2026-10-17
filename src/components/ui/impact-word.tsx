import type { ImpactTone, ImpactToken } from "@/data/impact-headline";
import { cn } from "@/lib/utils";

const toneClass: Record<ImpactTone, string> = {
  /* light: ink on a lime marker chip, dark: plain lime text */
  lime:
    "text-impact-ink bg-impact-lime px-[0.05em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] dark:bg-transparent dark:text-impact-lime",
  bone: "text-impact-ink dark:text-impact-bone",
};

export function ImpactWord({ token }: { token: ImpactToken }) {
  return (
    <span
      className={cn(
        "inline-block",
        toneClass[token.tone ?? "bone"],
        token.serif
          ? "font-serif font-normal text-[1.06em] tracking-[-0.015em]"
          : "font-display font-bold tracking-[-0.035em]"
      )}
    >
      {token.text}
    </span>
  );
}
