'use client';

import * as React from 'react';
import Link from 'next/link';
import { X, Settings, HelpCircle, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigation-store';
import { useAuthStore } from '@/stores/auth-store';
import { IconButton } from '@/components/ui/icon-button';

/**
 * Mobile drawer component for secondary navigation
 * Slides in from left side with backdrop overlay
 */

interface DrawerItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

export function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useNavigationStore();
  const { logout } = useAuthStore();

  const drawerItems: DrawerItem[] = [
    {
      label: '設定',
      icon: Settings,
      href: '/settings', // TODO: Create settings page
    },
    {
      label: '說明',
      icon: HelpCircle,
      href: '/help', // TODO: Create help page
    },
    {
      label: '登出',
      icon: LogOut,
      onClick: () => {
        logout();
        closeDrawer();
        window.location.href = '/auth/login';
      },
    },
  ];

  // Close drawer on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    };

    if (drawerOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      {/* Backdrop overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="次要導航"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">選單</h2>
          <IconButton
            icon={<X className="h-5 w-5" />}
            onClick={closeDrawer}
            aria-label="關閉選單"
            variant="ghost"
          />
        </div>

        {/* Drawer content */}
        <nav className="p-4">
          <ul className="space-y-2">
            {drawerItems.map((item) => {
              const Icon = item.icon;

              if (item.href) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={closeDrawer}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2',
                        'touch-target transition-colors',
                        'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-base font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              }

              if (item.onClick) {
                return (
                  <li key={item.label}>
                    <button
                      onClick={item.onClick}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2',
                        'touch-target transition-colors',
                        item.label === '登出'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-base font-medium">
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

/**
 * Menu button to open the drawer
 * Place this in your header/navbar
 */
export function MenuButton() {
  const { openDrawer } = useNavigationStore();

  return (
    <IconButton
      icon={<Menu className="h-5 w-5" />}
      onClick={openDrawer}
      aria-label="開啟選單"
      variant="ghost"
      className="md:hidden"
    />
  );
}
