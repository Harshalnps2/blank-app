import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Low-light friendly palette: dark slate background with calm accents.
        night: {
          bg: "#0b1020",
          surface: "#141a2e",
          border: "#1f2742",
          text: "#e6e9f5",
          muted: "#9aa3c0",
          accent: "#7c9cff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
