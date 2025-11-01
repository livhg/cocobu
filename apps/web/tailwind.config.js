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
        xs: '375px', // Small phones
        sm: '640px', // Large phones
        md: '768px', // Tablets
        lg: '1024px', // Desktops
        xl: '1280px', // Large desktops
        '2xl': '1536px',
      },
      // Mobile-optimized typography
      fontSize: {
        // Base sizes - minimum 16px for mobile readability (prevents zoom on iOS)
        xs: ['0.75rem', { lineHeight: '1.5' }], // 12px - use sparingly
        sm: ['0.875rem', { lineHeight: '1.5' }], // 14px - secondary text
        base: ['1rem', { lineHeight: '1.5' }], // 16px - body text (default)
        lg: ['1.125rem', { lineHeight: '1.5' }], // 18px - large body
        xl: ['1.25rem', { lineHeight: '1.4' }], // 20px - small headings
        '2xl': ['1.5rem', { lineHeight: '1.4' }], // 24px - h3
        '3xl': ['1.875rem', { lineHeight: '1.3' }], // 30px - h2
        '4xl': ['2.25rem', { lineHeight: '1.3' }], // 36px - h1
        '5xl': ['3rem', { lineHeight: '1.2' }], // 48px - hero
        '6xl': ['3.75rem', { lineHeight: '1.2' }], // 60px - display
      },
      lineHeight: {
        relaxed: '1.625', // 1.625 for better readability
        loose: '1.75', // 1.75 for very comfortable reading
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
