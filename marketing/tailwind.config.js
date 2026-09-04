/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#0F5132',
          950: '#0B1D17',
        },
        slate: {
          900: '#0F172A',
          950: '#090D16',
        },
        teal: {
          50: '#F0FDFA',
          600: '#0F766E',
          700: '#115E59',
          800: '#0d5c56',
        },
        ink: '#0F172A',
        body: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 6s ease infinite',
        'marquee': 'marquee 25s linear infinite',
        'mesh-fluid': 'mesh-fluid 15s ease-in-out infinite alternate',
        'shine': 'shine 3s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'mesh-fluid': {
          '0%': { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate(5%, 10%) scale(1.1) rotate(3deg)' },
          '100%': { transform: 'translate(-3%, -5%) scale(0.95) rotate(-2deg)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '20%, 100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'emerald-glow-lg': '0 0 40px -5px rgba(16, 185, 129, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

