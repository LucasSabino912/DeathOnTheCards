/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pulse: {
          '100%': { opacity: '1' },
        },
      },
      animation: {
        pulse: 'pulse 4s cubic-bezier(0, 0, 1, 1) infinite',
      },
    },
  },
  plugins: [],
}
