/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints (Tailwind defaults are already mobile-first)
      screens: {
        xs: '375px',  // Small phones
        sm: '640px',  // Large phones
        md: '768px',  // Tablets
        lg: '1024px', // Desktops
        xl: '1280px', // Large desktops
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // Touch target utility for WCAG 2.1 AAA compliance
    function ({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          'min-width': '44px',
          'min-height': '44px',
        },
        '.touch-target-sm': {
          'min-width': '48px',
          'min-height': '48px',
        },
      });
    },
  ],
};
