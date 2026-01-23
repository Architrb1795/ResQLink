/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0056D2", // Medical Blue
        critical: "#D93025", // Signal Red
        warning: "#F9AB00", // Amber
        success: "#188038", // Green
        background: "#F8F9FA", // Off-White
        surface: "#FFFFFF",
        text: {
          DEFAULT: "#202124", // Charcoal
          muted: "#5F6368",
        },
        border: "#E0E0E0",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
