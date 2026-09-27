"use client";

interface SplitTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
}

export function SplitText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  play = true,
}: SplitTextProps) {
  const words = text.split(" ");
  let index = 0;

  return (
    <Tag className={className} aria-label={text}>
      <span className="inline">
        {words.map((word, wi) => (
          <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap" aria-hidden="true">
            {Array.from(word).map((char, ci) => {
              const letterDelay = (delay + index * stagger) * 1000;
              index += 1;
              return (
                <span
                  key={ci}
                  className="inline-block transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    opacity: play ? 1 : 0,
                    transform: play ? "translateY(0)" : "translateY(0.75em)",
                    transitionDelay: play ? `${letterDelay}ms` : "0ms",
                  }}
                >
                  {char}
                </span>
              );
            })}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
}
