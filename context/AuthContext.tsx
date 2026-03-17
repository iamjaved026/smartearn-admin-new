'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = localStorage.getItem('smart_earn_auth');
    Promise.resolve().then(() => {
      setIsAuthenticated(authStatus === 'true');
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, pathname, isLoading, router]);

  const login = async (email: string, pass: string) => {
    // Check dynamic admins from localStorage
    const savedAdmins = localStorage.getItem('smart_earn_admins');
    const admins = savedAdmins ? JSON.parse(savedAdmins) : [
      { email: 'admin@smartearn.com', password: 'admin123', name: 'Super Admin', role: 'Super Admin' },
      { email: 'jvdhussain09@gmail.com', password: 'admin123', name: 'Owner', role: 'Super Admin' }
    ];

    const admin = admins.find((a: any) => a.email === email && a.password === pass);
    
    if (admin) {
      localStorage.setItem('smart_earn_auth', 'true');
      localStorage.setItem('smart_earn_user', JSON.stringify(admin));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('smart_earn_auth');
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
