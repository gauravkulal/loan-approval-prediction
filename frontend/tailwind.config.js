/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf4",
          100: "#d6f4e2",
          500: "#14a44d",
          600: "#0f8a40",
        },
        danger: {
          50: "#fff2f2",
          100: "#ffe0e0",
          500: "#dc2626",
        },
        dark: {
          bg: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          text: "#e2e8f0",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        soft: "0 14px 34px -18px rgba(20, 31, 60, 0.35)",
        "soft-dark": "0 14px 34px -18px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
