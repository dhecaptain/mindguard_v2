/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#174A3A',
          50: '#EEF5F1',
          100: '#DCEBE3',
          200: '#BBD6C8',
          300: '#8FBDA6',
          400: '#62A889',
          500: '#3F8A6C',
          600: '#2A6B54',
          700: '#1F5744',
          800: '#174A3A',
          900: '#123A2E',
          950: '#0C2720',
        },
        sand: {
          DEFAULT: '#D9B77A',
          50: '#FBF6EC',
          100: '#F5EBD6',
          200: '#EBD4AB',
          300: '#D9B77A',
          400: '#CB9E51',
          500: '#B8873B',
        },
        ink: '#17211D',
        'ink-soft': '#53615A',
        mist: '#F7F8F5',
        surface: '#FFFFFF',
        'surface-soft': '#EFF3EF',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,33,29,0.04), 0 8px 24px -12px rgba(23,33,29,0.12)',
        'card-hover': '0 2px 4px rgba(23,33,29,0.05), 0 20px 40px -16px rgba(23,33,29,0.18)',
        lift: '0 6px 20px -8px rgba(23,33,29,0.16)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        container: '76rem',
      },
    },
  },
  plugins: [],
}
