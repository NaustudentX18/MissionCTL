import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber-Minimalist palette
        cyber: {
          black: "#050508",
          dark: "#0a0a0f",
          card: "#0f0f18",
          border: "#1a1a2e",
          muted: "#252540",
        },
        neon: {
          claude: "#a855f7",    // Purple for Claude/Anthropic
          openai: "#10b981",    // Green for OpenAI
          gemini: "#3b82f6",    // Blue for Gemini
          groq: "#f59e0b",      // Amber for Groq
          white: "#e2e8f0",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "cyber-grid": "linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)",
        "glow-purple": "radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
        "glow-green": "radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
        "glow-blue": "radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
        "glow-amber": "radial-gradient(circle at center, rgba(245,158,11,0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scan": "scan 4s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px currentColor, 0 0 20px currentColor" },
          "100%": { boxShadow: "0 0 10px currentColor, 0 0 40px currentColor, 0 0 80px currentColor" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
