import defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      ...defaultTheme.screens,
      sm: '390px', // <- your new breakpoint
    },
    extend: {
      colors: {
        'header-brown': '#6B4E44',
        'button-khaki': '#A8A38F',
        'button-khaki-hover': '#9A9585',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
