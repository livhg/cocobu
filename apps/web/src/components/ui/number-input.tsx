import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Allow decimal numbers (default: false)
   */
  allowDecimal?: boolean;

  /**
   * Currency symbol to display (optional)
   */
  currency?: string;

  /**
   * Error message
   */
  error?: string;
}

/**
 * Number input optimized for mobile keyboards
 * Shows numeric keyboard on mobile devices
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, allowDecimal = false, currency, error, ...props }, ref) => {
    return (
      <div className="relative">
        {currency && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
            {currency}
          </span>
        )}
        <input
          type="text"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          pattern={allowDecimal ? '[0-9]*\\.?[0-9]*' : '[0-9]*'}
          className={cn(
            'flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900',
            'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'touch-target',
            currency && 'pl-8',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
