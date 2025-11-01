import { useEffect, useRef, useState } from 'react';

/**
 * Hook for pull-to-refresh functionality
 * Detects pull down gesture at the top of the page and triggers refresh callback
 */

interface UsePullToRefreshOptions {
  /**
   * Callback function when refresh is triggered
   */
  onRefresh: () => Promise<void>;

  /**
   * Distance in pixels to trigger refresh (default: 80)
   */
  threshold?: number;

  /**
   * Maximum pull distance (default: 120)
   */
  maxPullDistance?: number;

  /**
   * Enable pull-to-refresh (default: true)
   */
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let touchStartY = 0;
    let touchMoveY = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate if scrolled to top
      isAtTop = window.scrollY === 0;
      if (!isAtTop || isRefreshing) return;

      touchStartY = e.touches[0].clientY;
      startY.current = touchStartY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      touchMoveY = e.touches[0].clientY;
      currentY.current = touchMoveY;

      const distance = touchMoveY - touchStartY;

      // Only allow pulling down
      if (distance > 0) {
        // Apply resistance effect - gets harder to pull as distance increases
        const resistance = 0.5;
        const actualDistance = Math.min(distance * resistance, maxPullDistance);
        setPullDistance(actualDistance);

        // Prevent default scroll behavior when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isAtTop || isRefreshing) return;

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold); // Snap to threshold position

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Reset pull distance if not enough
        setPullDistance(0);
      }

      // Reset touch positions
      touchStartY = 0;
      touchMoveY = 0;
    };

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    enabled,
    isRefreshing,
    pullDistance,
    threshold,
    maxPullDistance,
    onRefresh,
  ]);

  return {
    pullDistance,
    isRefreshing,
    isPulling: pullDistance > 0,
    willRefresh: pullDistance >= threshold,
  };
}
