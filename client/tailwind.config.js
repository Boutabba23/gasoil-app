/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // Nécessaire pour ShadCN UI
  content: [
    "./pages/**/*.{ts,tsx}",
    "./index.html",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Important d'avoir les bons chemins
  ],
  prefix: "", // ShadCN UI
  theme: {
    container: {
      // ShadCN UI
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        // ShadCN UI
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      textShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.25)",
        sm: "0 1px 3px rgba(0,0,0,0.30)",
        DEFAULT: "0 2px 4px rgba(0,0,0,0.25)", // Default text-shadow
        md: "0 2px 5px rgba(0,0,0,0.30)",
        lg: "0 8px 16px rgba(0,0,0,0.25)",
      },
      animation: {
        // ShadCN UI
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ matchUtilities, theme }) {
      // Plugin to generate text-shadow utilities
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    },
  ], // ShadCN UI
};
