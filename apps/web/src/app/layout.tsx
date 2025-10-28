import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
