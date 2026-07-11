/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (not the default 'media') is required for colorScheme.set() to work at
  // all on web — with 'media' it throws, since dark mode would only be OS-driven.
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
