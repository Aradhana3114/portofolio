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
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        asimovian: ["var(--font-asimovian)", "sans-serif"],
      },
      fontSize: {
        display: ["72px", { lineHeight: "80px", letterSpacing: "-0.02em" }],
        "display-sm": ["40px", { lineHeight: "46px", letterSpacing: "-0.02em" }],
        h1: ["48px", { lineHeight: "56px", letterSpacing: "-0.01em" }],
        h2: ["36px", { lineHeight: "44px" }],
        h3: ["24px", { lineHeight: "32px" }],
        body: ["16px", { lineHeight: "28px" }],
        caption: ["14px", { lineHeight: "20px" }],
        metadata: ["12px", { lineHeight: "16px" }],
      },
      maxWidth: {
        content: "1280px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
