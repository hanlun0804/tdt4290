/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      body: ["Calibri", "ui-serif", "Georgia"],
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "cursive"],
      },
      colors: {
        ol: {
          100: "#54daff",
          200: "#249ee4",
          300: "#0078d4",
          400: "#034fa0",
          500: "#0f3464",
        },
      },
    },
  },
  plugins: [],
};
