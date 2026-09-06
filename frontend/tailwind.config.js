/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#1a3636",
          50: "#edf3f0",
          100: "#dbe7e2",
          600: "#2a5350",
          700: "#1f4140",
          800: "#16302f",
          900: "#122727",
        },
        cream: "#f8f7f2",
        card: "#fffefa",
        line: "#e7e3d7",
        mist: "#64756e",
        ink: "#0c1b23",
      },
      fontFamily: {
        brand: ['"Bricolage Grotesque"', "ui-sans-serif", "sans-serif"],
        sans: ['"Schibsted Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};