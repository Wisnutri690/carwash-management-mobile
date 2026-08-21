/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a0a0a",
        darkSurface: "#121212",
        darkInput: "#1a1a1a",
        darkBorder: "#262626",
        neonPurple: "#a855f7",
        neonPink: "#fc00e7",
      },
    },
  },
  plugins: [],
};
