"use client";

interface SplitTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
  wave?: boolean;
  shine?: boolean;
}

export function SplitText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  play = true,
  wave = true,
  shine = true,
}: SplitTextProps) {
  const words = text.split(" ");
  const loopActive = play && (wave || shine);
  let index = 0;

  return (
    <Tag
      className={[className, loopActive ? "split-loop-active" : ""].filter(Boolean).join(" ")}
      aria-label={text}
    >
      <span className="inline">
        {words.map((word, wi) => (
          <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap" aria-hidden="true">
            {Array.from(word).map((char, ci) => {
              const letterDelay = (delay + index * stagger) * 1000;
              const waveDelay = letterDelay + 700 + index * 70;
              index += 1;
              return (
                <span
                  key={ci}
                  className="inline-block"
                  style={{
                    opacity: play ? 1 : 0,
                    transform: play ? "translateY(0)" : "translateY(0.75em)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "500ms",
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                    transitionDelay: play ? `${letterDelay}ms` : "0ms",
                  }}
                >
                  <span
                    className={wave ? "split-char-loop" : ""}
                    style={{ animationDelay: `${waveDelay}ms` }}
                  >
                    <span className={shine && play ? "split-char-shine" : undefined}>{char}</span>
                  </span>
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
