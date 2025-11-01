import { create } from 'zustand';

/**
 * PWA store for managing Progressive Web App state
 * Handles install prompts and PWA installation status
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStore {
  // Whether the app is installed as PWA
  isInstalled: boolean;

  // Whether the install prompt is currently shown
  showingInstallPrompt: boolean;

  // The deferred install prompt event
  deferredPrompt: BeforeInstallPromptEvent | null;

  // Whether the user has dismissed the install prompt
  hasUserDismissedPrompt: boolean;

  // Actions
  setInstalled: (installed: boolean) => void;
  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  dismissPrompt: () => void;
  triggerInstall: () => Promise<boolean>;
}

export const usePWAStore = create<PWAStore>((set, get) => ({
  isInstalled: false,
  showingInstallPrompt: false,
  deferredPrompt: null,
  hasUserDismissedPrompt:
    typeof window !== 'undefined'
      ? localStorage.getItem('pwa-install-dismissed') === 'true'
      : false,

  setInstalled: (installed) => set({ isInstalled: installed }),

  setDeferredPrompt: (event) => set({ deferredPrompt: event }),

  showInstallPrompt: () => {
    const { hasUserDismissedPrompt, deferredPrompt } = get();
    if (!hasUserDismissedPrompt && deferredPrompt) {
      set({ showingInstallPrompt: true });
    }
  },

  hideInstallPrompt: () => set({ showingInstallPrompt: false }),

  dismissPrompt: () => {
    set({
      showingInstallPrompt: false,
      hasUserDismissedPrompt: true,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  },

  triggerInstall: async () => {
    const { deferredPrompt } = get();

    if (!deferredPrompt) {
      return false;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferred prompt
    set({ deferredPrompt: null, showingInstallPrompt: false });

    if (outcome === 'accepted') {
      set({ isInstalled: true });
      return true;
    } else {
      set({ hasUserDismissedPrompt: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      return false;
    }
  },
}));
