/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        premium: {
          navy: {
            DEFAULT: '#0A1929',
            dark: '#05101F',
            light: '#1a365d',
            lighter: '#2d4a6b',
          },
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F5A623',
            bright: '#FFB800',
            dark: '#B8941F',
          },
          teal: {
            DEFAULT: '#14B8A6',
            dark: '#0D9488',
            light: '#5EEAD4',
          },
          cream: {
            DEFAULT: '#F8F6F0',
            light: '#FAF9F5',
          },
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
