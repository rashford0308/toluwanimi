import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF7F0", cream: "#F5EDE0", champagne: "#E9D8B4", blush: "#F2D4D0",
        rose: "#C99A8E", burgundy: "#6E1F2E", ink: "#3A2A2A",
      },
      fontFamily: {
        serif: ["var(--f-serif)", "Georgia", "serif"],
        script: ["var(--f-script)", "cursive"],
        sans: ["var(--f-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
