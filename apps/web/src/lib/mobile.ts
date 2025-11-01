/**
 * Mobile-first utilities and constants
 */

// Breakpoint constants (matching Tailwind config)
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Touch target minimum sizes (WCAG 2.1 AAA)
export const TOUCH_TARGET = {
  min: 44, // Minimum for AAA compliance
  recommended: 48, // Material Design recommendation
} as const;

// Mobile viewport sizes for testing
export const VIEWPORTS = {
  mobile: {
    width: 375,
    height: 667,
    name: 'iPhone SE',
  },
  mobileLarge: {
    width: 414,
    height: 896,
    name: 'iPhone 11 Pro Max',
  },
  tablet: {
    width: 768,
    height: 1024,
    name: 'iPad',
  },
  desktop: {
    width: 1280,
    height: 800,
    name: 'Desktop',
  },
} as const;

/**
 * Hook to detect if viewport is mobile size
 */
export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Hook to detect if viewport is tablet size
 */
export function useIsTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg
  );
}

/**
 * Hook to detect if viewport is desktop size
 */
export function useIsDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get current breakpoint name
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;

  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}
