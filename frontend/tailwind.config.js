/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryClr: "#075985",
        secondaryClr: "#0a1a24ff",
        terciaryClr: "#FFFFFF",
        backgroundClr: "#F1EEFF",
        status: {
          intransit: "#F59E0B",
          loading: "#3B82F6",
          delivered: "#10B981",
          cancelled: "#EF4444"
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        fadeInUp: 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}