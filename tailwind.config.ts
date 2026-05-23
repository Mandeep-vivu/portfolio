import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712",
        surface: "#0f1729",
        surface2: "#111827",
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#06b6d4",
        accent2: "#a78bfa",
        neon: "#00d8ff",
        muted: "#64748b",
        border: "rgba(99,102,241,0.2)",
        glow: "rgba(99,102,241,0.4)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #030712 0%, #0f1729 50%, #030712 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(6,182,212,0.05) 100%)",
      },
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "slide-in-left": "slideInLeft 0.6s ease forwards",
        "slide-in-right": "slideInRight 0.6s ease forwards",
        "fade-up": "fadeUp 0.6s ease forwards",
        "typewriter": "typewriter 3s steps(40) forwards",
        "blink": "blink 1s step-end infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(99,102,241,0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pulseNeon: {
          "0%, 100%": { opacity: "1", textShadow: "0 0 10px #00d8ff, 0 0 20px #00d8ff" },
          "50%": { opacity: "0.7", textShadow: "0 0 20px #00d8ff, 0 0 40px #00d8ff, 0 0 80px #00d8ff" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(99,102,241,0.3)" },
          "50%": { borderColor: "rgba(99,102,241,0.8)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-60px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(60px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon-sm": "0 0 10px rgba(99,102,241,0.5)",
        "neon-md": "0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.3)",
        "neon-lg": "0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(99,102,241,0.4)",
        "neon-cyan": "0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.3)",
        "card": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.2)",
        "glow-purple": "0 0 30px rgba(139,92,246,0.5)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.5)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      maxWidth: {
        "5xl": "1120px",
        "6xl": "1240px",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
    },
  },
  plugins: [],
};

export default config;
