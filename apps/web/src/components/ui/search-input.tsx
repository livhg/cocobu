import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './icon-button';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;
}

/**
 * Search input optimized for mobile
 * Shows search keyboard layout and includes clear button
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState('');
    const displayValue = value !== undefined ? value : internalValue;
    const hasValue = !!displayValue;

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          inputMode="search"
          className={cn(
            'flex h-11 w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-base text-gray-900',
            'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'touch-target',
            // Remove default search input clear button
            '[&::-webkit-search-cancel-button]:hidden',
            '[&::-webkit-search-decoration]:hidden',
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {hasValue && (
          <IconButton
            variant="ghost"
            size="default"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
            onClick={handleClear}
            aria-label="清除搜尋"
            type="button"
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
