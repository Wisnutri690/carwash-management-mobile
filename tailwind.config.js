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
        pureBlack: "#000000",
        pureWhite: "#ffffff",
        subtleGray: "#f4f4f5",
        lineGray: "#e4e4e7",
        mutedGray: "#71717a",
      },
    },
  },
  plugins: [],
};
