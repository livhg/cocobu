import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Include time picker (default: false)
   */
  includeTime?: boolean;

  /**
   * Error message
   */
  error?: string;
}

/**
 * Date input using native HTML5 date picker
 * Provides optimal mobile UX with native date/time pickers
 */
const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, includeTime = false, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={includeTime ? 'datetime-local' : 'date'}
          className={cn(
            'flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900',
            'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'touch-target',
            // Hide the default calendar icon on some browsers and use consistent styling
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
            '[&::-webkit-calendar-picker-indicator]:h-5',
            '[&::-webkit-calendar-picker-indicator]:w-5',
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

DateInput.displayName = 'DateInput';

export { DateInput };
