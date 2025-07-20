import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthSync } from '@/components/auth-sync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'מערכת ניהול פסולת ירוקה',
  description: 'מערכת ניהול פסולת ירוקה לרשויות מקומיות',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <AuthProvider>
          <AuthSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
