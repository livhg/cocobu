'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  /**
   * Current pull distance in pixels
   */
  pullDistance: number;

  /**
   * Whether refresh is in progress
   */
  isRefreshing: boolean;

  /**
   * Whether pull distance exceeds threshold
   */
  willRefresh: boolean;

  /**
   * Threshold distance to trigger refresh
   */
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  willRefresh,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  // Don't show if not pulling
  if (pullDistance === 0 && !isRefreshing) return null;

  // Calculate rotation based on pull distance
  const rotation = Math.min((pullDistance / threshold) * 360, 360);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing ? 'transform 0.3s ease' : 'none',
      }}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full shadow-lg',
          willRefresh || isRefreshing
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-600'
        )}
      >
        <RefreshCw
          className={cn('h-6 w-6', isRefreshing && 'animate-spin')}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease',
          }}
        />
      </div>
    </div>
  );
}
