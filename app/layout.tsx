'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <UIProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
