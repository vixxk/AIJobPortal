/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3882F6",
        background: "#F3FAFC",
        text: "#0F172A",
        active: "#EEF4FF"
      }
    },
  },
  plugins: [],
}
