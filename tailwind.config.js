/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter',          'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        mono:    ['"JetBrains Mono"','monospace'],
      },
      colors: {
        accent: { DEFAULT:'#6366f1', light:'#a5b4fc', purple:'#a855f7' },
        surface: { base:'#0a0a0f', DEFAULT:'#0f0f18', elevated:'#14141f' },
      },
    },
  },
  plugins: [],
};