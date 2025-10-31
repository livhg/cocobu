import { useState, useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigation-store';

/**
 * Hook to detect scroll direction and update navigation visibility
 * Hides navigation when scrolling down, shows when scrolling up
 */

interface UseScrollDirectionOptions {
  /**
   * Minimum scroll distance before hiding (default: 50px)
   */
  threshold?: number;

  /**
   * Whether to enable hide-on-scroll behavior (default: true)
   */
  enabled?: boolean;
}

export function useScrollDirection({
  threshold = 50,
  enabled = true,
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const { showNavigation, hideNavigation } = useNavigationStore();

  useEffect(() => {
    if (!enabled) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        // Not scrolled enough to trigger
        ticking = false;
        return;
      }

      if (scrollY > lastScrollY && scrollY > threshold) {
        // Scrolling down
        setScrollDirection('down');
        hideNavigation();
      } else if (scrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection('up');
        showNavigation();
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, enabled, hideNavigation, showNavigation]);

  return scrollDirection;
}
