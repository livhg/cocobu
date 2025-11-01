'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api, type User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { MobileDrawer, MenuButton } from '@/components/navigation/MobileDrawer';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, logout, setLoading } =
    useAuthStore();

  // Enable hide-on-scroll behavior for navigation
  useScrollDirection({ threshold: 50, enabled: true });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // Try to fetch current user
        try {
          const response = await api.get<{ user: User }>('/users/me');
          setUser(response.user);
        } catch {
          // Not authenticated, redirect to login
          router.push('/auth/login');
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, router, setUser, setLoading]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      logout();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Navigation Header - Mobile First */}
      <header className="sticky top-0 z-30 border-b bg-white md:static">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-8">
            {/* Menu button for mobile */}
            <MenuButton />

            <Link href="/dashboard" className="text-lg font-bold md:text-xl">
              CocoBu 叩叩簿
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user.display_name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden md:inline-flex"
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First Padding */}
      <main
        className="container mx-auto px-4 py-4 pb-24 md:ml-64 md:pb-8 md:pt-8"
        // pb-24 for bottom navigation on mobile, md:pb-8 for desktop
        // md:ml-64 for desktop sidebar offset
      >
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
}
