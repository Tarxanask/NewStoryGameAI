/** @type {import('tailwindcss').Config} */
const { heroui } = require('@heroui/react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Include App Router pages
    './components/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#805af5", // Default primary color (e.g., blue)
          light: "#ac97ea",  // Lighter shade
          dark: "#34216d",   // Darker shade
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
}
