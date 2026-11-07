/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        branchCairo: {
          light: '#3B82F6',
          DEFAULT: '#1E3A8A',
          dark: '#172554'
        },
        branchAlex: {
          light: '#14B8A6',
          DEFAULT: '#0D9488',
          dark: '#115E59'
        },
        branchMansoura: {
          light: '#22C55E',
          DEFAULT: '#15803D',
          dark: '#14532D'
        }
      }
    },
  },
  plugins: [],
}
