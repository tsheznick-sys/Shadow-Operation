/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        jarvis: { bg: "#0a0a0f", card: "#13131a", teal: "#14b8a6", purple: "#8b5cf6", gold: "#f59e0b" }
      }
    }
  },
  plugins: []
};
