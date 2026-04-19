import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        yt: {
          base: "var(--yt-bg-base)",
          elevated: "var(--yt-bg-elevated)",
          hover: "var(--yt-bg-hover)",
          chip: "var(--yt-bg-chip)",
          chipSelected: "var(--yt-bg-chip-selected)",
          input: "var(--yt-bg-input)",
          sidebar: "var(--yt-bg-sidebar)",
          overlay: "var(--yt-bg-overlay)",
          textPrimary: "var(--yt-text-primary)",
          textSecondary: "var(--yt-text-secondary)",
          textDisabled: "var(--yt-text-disabled)",
          textChipSelected: "var(--yt-text-chip-selected)",
          accent: "var(--yt-accent)",
          likeActive: "var(--yt-like-active)",
          subscribeBg: "var(--yt-subscribe-bg)",
          subscribeText: "var(--yt-subscribe-text)",
          border: "var(--yt-border)",
          pill: "var(--yt-pill-bg)",
          pillHover: "var(--yt-pill-bg-hover)",
          pillBorder: "var(--yt-pill-border)",
          scrollbar: "var(--yt-scrollbar)",
        },
      },
      borderRadius: {
        ytCard: "12px",
        ytButton: "999px",
        ytMenu: "12px",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
