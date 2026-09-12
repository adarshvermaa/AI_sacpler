/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0d14",
        card: "#111622",
        cardBorder: "#1e293b",
        primary: "#3b82f6",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        neonCyan: "#06b6d4",
        neonGreen: "#22c55e"
      }
    },
  },
  plugins: [],
};
