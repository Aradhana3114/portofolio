import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
          secondary: "rgb(var(--accent-secondary) / <alpha-value>)",
        },
        brutal: {
          blue: "rgb(var(--brutal-blue) / <alpha-value>)",
          yellow: "rgb(var(--brutal-yellow) / <alpha-value>)",
          pink: "rgb(var(--brutal-pink) / <alpha-value>)",
          green: "rgb(var(--brutal-green) / <alpha-value>)",
          orange: "rgb(var(--brutal-orange) / <alpha-value>)",
          purple: "rgb(var(--brutal-purple) / <alpha-value>)",
          ink: "rgb(var(--brutal-ink) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.25rem,6vw,5.75rem)", { lineHeight: "0.88", letterSpacing: "-0.035em" }],
        "display-sm": ["clamp(1.75rem,4vw,3rem)", { lineHeight: "0.94", letterSpacing: "-0.03em" }],
        h1: ["clamp(2.25rem,5vw,3.75rem)", { lineHeight: "0.94", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.75rem,3.6vw,2.75rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        h3: ["clamp(1.25rem,2.2vw,1.75rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        body: ["16px", { lineHeight: "28px" }],
        caption: ["14px", { lineHeight: "20px" }],
        metadata: ["12px", { lineHeight: "16px" }],
      },
      maxWidth: {
        content: "1280px",
      },
      borderWidth: {
        brutal: "3px",
        "brutal-lg": "5px",
      },
      borderRadius: {
        brutal: "6px",
        "brutal-lg": "10px",
      },
      boxShadow: {
        "brutal-sm": "2px 2px 0 0 rgb(var(--border))",
        brutal: "4px 4px 0 0 rgb(var(--border))",
        "brutal-md": "6px 6px 0 0 rgb(var(--border))",
        "brutal-lg": "10px 10px 0 0 rgb(var(--border))",
        "brutal-xl": "14px 14px 0 0 rgb(var(--border))",
        "brutal-blue": "4px 4px 0 0 rgb(var(--brutal-blue))",
        "brutal-yellow": "4px 4px 0 0 rgb(var(--brutal-yellow))",
        "brutal-pink": "4px 4px 0 0 rgb(var(--brutal-pink))",
        "brutal-green": "4px 4px 0 0 rgb(var(--brutal-green))",
        "brutal-orange": "4px 4px 0 0 rgb(var(--brutal-orange))",
        "brutal-purple": "4px 4px 0 0 rgb(var(--brutal-purple))",
        "brutal-lg-blue": "8px 8px 0 0 rgb(var(--brutal-blue))",
        "brutal-lg-yellow": "8px 8px 0 0 rgb(var(--brutal-yellow))",
        "brutal-lg-pink": "8px 8px 0 0 rgb(var(--brutal-pink))",
        "brutal-lg-green": "8px 8px 0 0 rgb(var(--brutal-green))",
        "brutal-lg-orange": "8px 8px 0 0 rgb(var(--brutal-orange))",
        "brutal-lg-purple": "8px 8px 0 0 rgb(var(--brutal-purple))",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
        brutal: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tilt, 0deg))" },
          "50%": { transform: "translateY(-12px) rotate(var(--tilt, 0deg))" },
        },
        "bob-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        stamp: {
          "0%": { transform: "scale(2.4) rotate(-14deg)", opacity: "0" },
          "60%": { transform: "scale(0.94) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.86)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.6s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "bob-slow": "bob-slow 2.4s ease-in-out infinite",
        stamp: "stamp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
