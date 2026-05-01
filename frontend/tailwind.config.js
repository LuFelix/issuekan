/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

