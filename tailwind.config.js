/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E8A87C',
          dark: '#D4956B',
        },
        surface: '#FDF8F5',
        card: '#FFFFFF',
        'text-primary': '#2D2D2D',
        'text-secondary': '#8B8B8B',
        divider: '#F0EBE6',
        accent: '#E87461',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '10px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
