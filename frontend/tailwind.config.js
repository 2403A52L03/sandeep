/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534', // Primary Forest Green
          900: '#14532d',
          950: '#052e16',
        },
        fresh: {
          DEFAULT: '#22C55E', // Fresh Green
          light: '#4ADE80',
          dark: '#16A34A',
        },
        agri: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          slate: '#0F172A',
          subtext: '#475569',
          border: '#E2E8F0',
          amber: '#F59E0B',
          red: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

