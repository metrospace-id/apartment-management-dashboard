// eslint-disable-next-line import/no-import-module-exports
import { themeExtends, themeOutline } from './src/styles/formio'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/tailwind-datepicker-react/dist/**/*.js',
  ],
  theme: {
    extend: {
      ...themeExtends,
    },
    outline: {
      ...themeOutline,
    },
  },
  plugins: [],
}
