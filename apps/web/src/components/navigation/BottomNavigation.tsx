'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore, type TabId } from '@/stores/navigation-store';

/**
 * Bottom navigation component for mobile-first design
 * Provides thumb-friendly access to primary app sections
 */

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: '主頁',
    icon: Home,
    href: '/dashboard',
  },
  {
    id: 'books',
    label: '帳簿',
    icon: BookOpen,
    href: '/dashboard', // TODO: Update when books page is created
  },
  {
    id: 'profile',
    label: '個人',
    icon: User,
    href: '/dashboard', // TODO: Update when profile page is created
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { currentTab, setTab, navigationVisible } = useNavigationStore();

  const isActive = (item: NavItem) => {
    // For now, use simple path matching
    // TODO: Implement more sophisticated routing logic
    return pathname === item.href || currentTab === item.id;
  };

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden',
          'transition-transform duration-300',
          navigationVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        aria-label="主要導航"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 touch-target',
                  'flex-1 transition-colors',
                  active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar navigation (hidden on mobile) */}
      <nav
        className="hidden md:fixed md:left-0 md:top-0 md:flex md:h-screen md:w-64 md:flex-col md:border-r md:border-gray-200 md:bg-white md:p-6"
        aria-label="主要導航"
      >
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                  'touch-target',
                  active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
