'use client';

import * as React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePWA } from '@/hooks/usePWA';

/**
 * Install prompt banner for PWA
 * Shows at bottom of screen on mobile, prompting user to install app
 */

export function InstallPrompt() {
  const { showingInstallPrompt, install, dismissInstallPrompt } = usePWA();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      console.log('PWA installed successfully');
    }
  };

  if (!showingInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-8 md:left-auto md:right-8 md:max-w-md">
      <Card className="shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Download className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="mb-1 text-base font-semibold">
                安裝 CocoBu 應用程式
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                將 CocoBu 加到主畫面，享受更快速的存取和離線功能
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 sm:flex-none"
                >
                  安裝
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={dismissInstallPrompt}
                  className="flex-1 sm:flex-none"
                >
                  稍後再說
                </Button>
              </div>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className={cn(
                'shrink-0 rounded-md p-1 transition-colors',
                'hover:bg-gray-100',
                'touch-target'
              )}
              aria-label="關閉"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
