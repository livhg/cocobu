'use client';

import * as React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Offline banner that shows when network connection is lost
 * Displays at top of screen to inform user of offline status
 */

export function OfflineBanner() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show if online and banner timeout has passed
  if (isOnline && !showBanner) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-transform duration-300',
        showBanner ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium',
          isOnline ? 'bg-green-500 text-white' : 'bg-yellow-500 text-gray-900'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>已恢復網路連線</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>離線模式 - 部分功能可能無法使用，資料可能不是最新</span>
          </>
        )}
      </div>
    </div>
  );
}
