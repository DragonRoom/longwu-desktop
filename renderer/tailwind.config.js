const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      gray: colors.gray,
      blue: colors.blue,
    },
    extend: {
      colors: {
        'gray-custom': '#e8e8e8',
        'blue-custom': '#c0d4d7'
      },
    },
  },
  plugins: [],
}
