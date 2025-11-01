import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputMode?:
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';
  error?: string;
}

/**
 * Input with floating label for better mobile UX
 * Label floats up when input has value or is focused
 */
const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, type, inputMode, error, id, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const inputId =
    id || `floating-input-${label.toLowerCase().replace(/\s/g, '-')}`;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const isFloating =
    isFocused || hasValue || !!props.value || !!props.defaultValue;

  return (
    <div className="relative">
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        className={cn(
          'peer flex h-14 w-full rounded-md border border-gray-300 bg-white px-3 pb-2 pt-6 text-base text-gray-900',
          'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'touch-target',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 origin-left -translate-y-1/2 text-base text-gray-500 transition-all',
          'peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-blue-600',
          isFloating && 'top-3 translate-y-0 text-xs',
          error && 'text-red-600 peer-focus:text-red-600'
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };
