/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cat-blue': '#1a73e8',
        'cat-green': '#26b226',
        'cat-orange': '#f5a623',
        'cat-purple': '#7b2d8b',
        'cat-grey': '#f5f5f5',
        'cat-dark': '#333333',
      },
    },
  },
  plugins: [],
}
