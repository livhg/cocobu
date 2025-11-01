'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './icon-button';

interface BottomSheetProps {
  /**
   * Whether the sheet is open
   */
  open: boolean;

  /**
   * Callback when sheet should close
   */
  onClose: () => void;

  /**
   * Title of the sheet
   */
  title?: string;

  /**
   * Sheet content
   */
  children: React.ReactNode;

  /**
   * Sheet height variant
   * - 'half': 50vh
   * - 'full': 90vh
   * - 'auto': Content-based height
   */
  height?: 'half' | 'full' | 'auto';

  /**
   * Enable swipe-to-close (default: true)
   */
  swipeToClose?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  height = 'half',
  swipeToClose = true,
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToClose) return;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeToClose || !isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!swipeToClose || !isDragging) return;

    setIsDragging(false);

    // Close if dragged more than 100px
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
  };

  if (!open) return null;

  const heightClasses = {
    half: 'h-[50vh]',
    full: 'h-[90vh]',
    auto: 'max-h-[90vh]',
  };

  return (
    <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        style={{
          opacity: open && !isDragging ? 1 : 0,
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10',
          'flex flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl',
          'transition-transform duration-300 ease-out',
          'md:relative md:max-w-2xl md:rounded-2xl',
          heightClasses[height]
        )}
        style={{
          transform: isDragging
            ? `translateY(${dragOffset}px)`
            : open
              ? 'translateY(0)'
              : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle - Mobile only */}
        <div className="flex justify-center py-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
            <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
            <IconButton
              variant="ghost"
              size="default"
              onClick={onClose}
              aria-label="關閉"
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
