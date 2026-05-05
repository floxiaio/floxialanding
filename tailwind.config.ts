import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Arial", "sans-serif"]
      },
      colors: {
        ink: "#111827",
        cloud: "#f7f8fb",
        signal: "#18a0a6",
        coral: "#f26d5b",
        lime: "#c5f267",
        violet: "#5c4dff"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(17, 24, 39, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
