'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';

/**
 * Floating Action Button (FAB) for primary actions
 * Positioned in bottom-right corner, thumb-friendly on mobile
 */

interface FloatingActionButtonProps {
  /**
   * Click handler for the FAB
   */
  onClick: () => void;

  /**
   * Icon to display (defaults to Plus)
   */
  icon?: React.ReactNode;

  /**
   * Accessible label
   */
  'aria-label': string;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Whether to hide on scroll (default: true)
   */
  hideOnScroll?: boolean;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  'aria-label': ariaLabel,
  className,
  hideOnScroll = true,
}: FloatingActionButtonProps) {
  const { navigationVisible } = useNavigationStore();
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hideOnScroll]);

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        // Base styles
        'fixed z-40 flex items-center justify-center rounded-full shadow-lg',
        'bg-gray-900 text-white hover:bg-gray-800',
        'transition-all duration-300',
        'touch-target-sm', // 48x48px for better touch
        'h-14 w-14', // 56px (larger than minimum for prominence)
        // Position: bottom-right, above bottom navigation
        'bottom-20 right-4 md:bottom-8 md:right-8',
        // Visibility based on scroll and navigation state
        isVisible && navigationVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-16 opacity-0 pointer-events-none',
        className
      )}
    >
      {icon}
    </button>
  );
}
