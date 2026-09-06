export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14161A",
        inkSoft: "#1F2228",
        paper: "#F6F4EF",
        paperDim: "#EDE9DE",
        steel: "#7D818A",
        line: "#DAD5C8",
        lineDark: "#2C2F36",
        accent: {
          DEFAULT: "#A8672E",
          deep: "#7C4A1F",
          soft: "#C68A52",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      maxWidth: {
        prose: "72ch",
      },
    },
  },
  plugins: [],
};
