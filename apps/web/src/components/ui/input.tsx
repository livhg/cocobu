import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Mobile keyboard optimization
   * - 'none': No keyboard
   * - 'text': Standard keyboard
   * - 'decimal': Numeric keyboard with decimal
   * - 'numeric': Numeric keyboard
   * - 'tel': Phone keyboard
   * - 'search': Search keyboard
   * - 'email': Email keyboard
   * - 'url': URL keyboard
   */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    return (
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          // Updated to h-11 (44px) for touch target compliance
          'flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-target',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
