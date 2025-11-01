import { useEffect } from 'react';
import { usePWAStore } from '@/stores/pwa-store';

/**
 * Hook to manage PWA installation and updates
 * Handles beforeinstallprompt, appinstalled events
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const {
    isInstalled,
    showingInstallPrompt,
    deferredPrompt,
    setInstalled,
    setDeferredPrompt,
    showInstallPrompt,
    hideInstallPrompt,
    dismissPrompt,
    triggerInstall,
  } = usePWAStore();

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);

      // Show install prompt after a delay (10 seconds)
      // Only if user hasn't dismissed it before
      const hasUserDismissed =
        localStorage.getItem('pwa-install-dismissed') === 'true';

      if (!hasUserDismissed) {
        setTimeout(() => {
          showInstallPrompt();
        }, 10000); // 10 seconds delay
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstalled(true);
      hideInstallPrompt();
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setInstalled, setDeferredPrompt, showInstallPrompt, hideInstallPrompt]);

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available
                console.log('New service worker available');
                // You can show an update prompt here
              }
            });
          }
        });
      });
    }
  }, []);

  return {
    isInstalled,
    showingInstallPrompt,
    canInstall: !!deferredPrompt,
    install: triggerInstall,
    dismissInstallPrompt: dismissPrompt,
  };
}
