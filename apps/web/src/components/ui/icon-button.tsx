import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * IconButton component for mobile-first touch interactions
 * Always enforces 44x44px minimum touch target (WCAG 2.1 AAA)
 */

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/90',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/90',
        outline:
          'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
      },
      size: {
        default: 'h-11 w-11', // 44px x 44px (WCAG AAA)
        sm: 'h-12 w-12', // 48px x 48px (Material Design)
        lg: 'h-14 w-14', // 56px x 56px (larger touch target)
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /**
   * Icon to display (pass a Lucide React icon component)
   */
  icon?: React.ReactNode;
  /**
   * Accessible label for screen readers
   */
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon || children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
