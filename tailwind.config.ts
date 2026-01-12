import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#1f2937",
        mist: "#f8fafc",
        sea: "#0ea5a8",
        coral: "#f97316",
        sand: "#fcd34d"
      },
      boxShadow: {
        "soft-xl": "0 25px 60px -35px rgba(15, 23, 42, 0.45)",
        glow: "0 0 35px rgba(14, 165, 168, 0.35)"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-serif", "Georgia"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
