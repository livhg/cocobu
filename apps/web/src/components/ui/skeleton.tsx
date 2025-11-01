import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton loading component for better perceived performance
 * Shows placeholder while content is loading
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

/**
 * Skeleton for card components
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        {/* Description */}
        <Skeleton className="h-4 w-24" />
        {/* Date */}
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

/**
 * Skeleton for list items
 */
function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/**
 * Skeleton for text content
 */
function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for button
 */
function SkeletonButton() {
  return <Skeleton className="h-11 w-24 rounded-md" />;
}

/**
 * Skeleton for input field
 */
function SkeletonInput() {
  return <Skeleton className="h-11 w-full rounded-md" />;
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
};
