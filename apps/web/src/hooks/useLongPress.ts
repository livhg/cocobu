import { useCallback, useRef } from 'react';

/**
 * Hook for detecting long press gestures
 * Triggers callback when user presses and holds for specified duration
 */

interface UseLongPressOptions {
  /**
   * Callback when long press is triggered
   */
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;

  /**
   * Optional callback when press starts
   */
  onPressStart?: () => void;

  /**
   * Optional callback when press ends without triggering long press
   */
  onPressEnd?: () => void;

  /**
   * Duration in ms to trigger long press (default: 500)
   */
  delay?: number;

  /**
   * Enable mouse support for desktop testing (default: true)
   */
  trackMouse?: boolean;
}

export function useLongPress({
  onLongPress,
  onPressStart,
  onPressEnd,
  delay = 500,
  trackMouse = true,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      // Prevent context menu on desktop
      event.preventDefault();

      isLongPressRef.current = false;

      if (onPressStart) {
        onPressStart();
      }

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress(event);
      }, delay);
    },
    [onLongPress, onPressStart, delay]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isLongPressRef.current && onPressEnd) {
      onPressEnd();
    }

    isLongPressRef.current = false;
  }, [onPressEnd]);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: cancel,
    onTouchMove: cancel,
    ...(trackMouse && {
      onMouseDown: (e: React.MouseEvent) => start(e),
      onMouseUp: cancel,
      onMouseLeave: cancel,
    }),
  };

  return handlers;
}
