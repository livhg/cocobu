import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { PWAProvider } from '@/providers/pwa-provider';

export const metadata: Metadata = {
  title: 'CocoBu 叩叩簿',
  description:
    '輕鬆管理支出，分帳結算不再混亂。支援個人記帳、多人分帳、智慧結算的記帳工具。',
  applicationName: 'CocoBu 叩叩簿',
  authors: [{ name: 'CocoBu Team' }],
  keywords: [
    '記帳',
    '分帳',
    '帳本',
    '支出管理',
    'expense tracker',
    'split bill',
    'bookkeeping',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CocoBu 叩叩簿',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'CocoBu 叩叩簿',
    title: 'CocoBu 叩叩簿',
    description: '輕鬆管理支出，分帳結算不再混亂',
  },
  twitter: {
    card: 'summary',
    title: 'CocoBu 叩叩簿',
    description: '輕鬆管理支出，分帳結算不再混亂',
  },
};

export const viewport: Viewport = {
  themeColor: '#1f2937',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <QueryProvider>
          <PWAProvider>{children}</PWAProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
