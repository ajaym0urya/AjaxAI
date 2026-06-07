/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        accent: {
          indigo: "#6366f1",
          violet: "#8b5cf6",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
};
