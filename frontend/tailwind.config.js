/**
 * Tailwind CSS Configuration
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        secondary: "#6b21a8",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
