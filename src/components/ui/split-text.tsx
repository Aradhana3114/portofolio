"use client";

interface SplitTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
  wave?: boolean;
  /** Per-letter tilt in degrees, applied progressively down the word. */
  tilt?: number;
}

export function SplitText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  play = true,
  wave = false,
  tilt = 0,
}: SplitTextProps) {
  const words = text.split(" ");
  const loopActive = play && wave;
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
              const charTilt = tilt === 0 ? 0 : ci % 2 === 0 ? tilt : -tilt;
              index += 1;
              return (
                <span
                  key={ci}
                  className="inline-block will-change-transform"
                  style={{
                    opacity: play ? 1 : 0,
                    transform: play ? "none" : "translateY(0.6em) rotate(-6deg) scale(0.86)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "600ms",
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                    transitionDelay: play ? `${letterDelay}ms` : "0ms",
                  }}
                >
                  <span
                    className={wave ? "split-char-loop" : undefined}
                    style={{ animationDelay: `${waveDelay}ms`, rotate: `${charTilt}deg` }}
                  >
                    {char}
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
