/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "#060A0F",
          panel: "rgba(10, 18, 28, 0.72)",
          border: "rgba(120, 255, 255, 0.16)",
          cyan: "#5DF2FF",
          blue: "#2F9BFF",
          amber: "#FFB020",
          red: "#FF3B3B",
          text: "#D9F7FF",
          muted: "rgba(217, 247, 255, 0.65)"
        }
      },
      boxShadow: {
        hud: "0 0 0 1px rgba(120,255,255,0.10), 0 12px 50px rgba(0,0,0,0.55)",
        glow: "0 0 18px rgba(93,242,255,0.18)",
      }
    },
  },
  plugins: [],
}
