/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0C111A',
        card: '#161F2E',
        primary: '#4338CA', 
        accent: '#10B981',
        danger: '#F43F5E',
        textMain: '#F3F4F6',
        textMuted: '#9CA3AF'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
