import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          300: "#EBD27A",
          400: "#E5C358",
          500: "#D4AF37",
          600: "#C49A2C",
          metallic: "#FFD700",
          dark: "#C49A2C",
        },
        "energy-red": {
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          glow: "rgba(220, 38, 38, 0.4)",
        },
        "dark-surface": {
          950: "#050507",
          900: "#08080A",
          850: "#121216",
          800: "#1C1C22",
          700: "#2A2A32",
        },
        brand: {
          red: "#C1121F",
          redLight: "#E63946",
        },
        dark: {
          DEFAULT: "#08080A",
          soft: "#0E0E12",
          card: "#121216",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(180deg, #CDAA62 0%, #B8964A 100%)",
      },
      boxShadow: {
        gold: "0 1px 2px rgba(0, 0, 0, 0.4)",
        red: "none",
      },
    },
  },
  plugins: [],
};

export default config;
