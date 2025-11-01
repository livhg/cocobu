import { create } from 'zustand';

/**
 * Navigation store for mobile-first navigation state
 * Manages bottom tabs and drawer state
 */

export type TabId = 'dashboard' | 'books' | 'profile';

interface NavigationStore {
  // Current active tab
  currentTab: TabId;

  // Mobile drawer state
  drawerOpen: boolean;

  // Navigation visibility (for hide-on-scroll)
  navigationVisible: boolean;

  // Actions
  setTab: (tab: TabId) => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  showNavigation: () => void;
  hideNavigation: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentTab: 'dashboard',
  drawerOpen: false,
  navigationVisible: true,

  setTab: (tab) => set({ currentTab: tab }),

  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

  openDrawer: () => set({ drawerOpen: true }),

  closeDrawer: () => set({ drawerOpen: false }),

  showNavigation: () => set({ navigationVisible: true }),

  hideNavigation: () => set({ navigationVisible: false }),
}));
