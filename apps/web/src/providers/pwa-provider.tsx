'use client';

import * as React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';

/**
 * PWA Provider component
 * Initializes PWA functionality and renders PWA-related UI components
 */

export function PWAProvider({ children }: { children: React.ReactNode }) {
  // Initialize PWA hooks (install prompt, offline detection, etc.)
  usePWA();

  return (
    <>
      {/* Offline status banner */}
      <OfflineBanner />

      {/* PWA install prompt */}
      <InstallPrompt />

      {/* App content */}
      {children}
    </>
  );
}
