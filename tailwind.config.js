/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '380px',
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-bottom))',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '0',
          sm: '0',
          lg: '0',
          xl: '0',
          '2xl': '0',
        },
      },
    },
  },
  plugins: [],
}
