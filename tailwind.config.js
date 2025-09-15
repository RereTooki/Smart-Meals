/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      vsm: "1px",
      md: "375px",
      xmd: "455px",
      tab: "565px",
      tabImg: "601px",
      lg: "750px",
      nxl: "800px",
      mxl: "900px",
      xl: "1000px",
      xxl: "1100px",
      xxxl: "1200px",
    },

    extend: {
      colors: {
        whites: "hsl(0, 0%, 100%)", //Added s at the end of every name to avoid clashes
        darkblue: "#062e6f",
        greens: "#1F3C0C",
      },
    },
  },
  plugins: [],
};
