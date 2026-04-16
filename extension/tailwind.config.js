/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        accent: "#a855f7",
        surface: "rgba(255,255,255,0.05)",
        "surface-hover": "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "app-gradient": "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      },
    },
  },
  plugins: [],
};
