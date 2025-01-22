/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        pop: "popIn 0.5s ease-in-out",
      },
      keyframes: {
        popIn: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      fontFamily: {
        openSans: ['"Open Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
