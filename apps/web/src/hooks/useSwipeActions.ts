import { useSwipeable, SwipeableHandlers } from 'react-swipeable';

/**
 * Hook for swipe actions on cards/items
 * Provides swipe-to-delete and swipe-to-edit functionality
 */

interface UseSwipeActionsOptions {
  /**
   * Callback when swiped left (typically delete)
   */
  onSwipeLeft?: () => void;

  /**
   * Callback when swiped right (typically edit/archive)
   */
  onSwipeRight?: () => void;

  /**
   * Minimum distance in pixels to trigger swipe (default: 50)
   */
  threshold?: number;

  /**
   * Enable mouse tracking for desktop testing (default: true)
   */
  trackMouse?: boolean;
}

export function useSwipeActions({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  trackMouse = true,
}: UseSwipeActionsOptions): SwipeableHandlers {
  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (Math.abs(eventData.deltaX) >= threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    },
    onSwipedRight: (eventData) => {
      if (Math.abs(eventData.deltaX) >= threshold && onSwipeRight) {
        onSwipeRight();
      }
    },
    trackMouse,
    delta: threshold,
    preventScrollOnSwipe: false,
    trackTouch: true,
  });

  return handlers;
}
