import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'CocoBu 叩叩簿',
  description: 'Expense tracking and split book',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
