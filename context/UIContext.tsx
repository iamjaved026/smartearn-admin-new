'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast, { ToastType } from '@/components/Toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'withdrawal' | 'info' | 'alert';
  date: string;
  read: boolean;
  link?: string;
  actionLabel?: string;
  actionLink?: string;
}

export interface Admin {
  id: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Super Admin';
  name: string;
}

interface UIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  showToast: (message: string, type?: ToastType) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
  admins: Admin[];
  addAdmin: (admin: Omit<Admin, 'id'>) => void;
  currentUser: Admin | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLogoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;
  confirmLogout: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Admin | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('smart_earn_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  
  const [admins, setAdmins] = useState<Admin[]>(() => {
    if (typeof window !== 'undefined') {
      const initialAdmins: Admin[] = [
        { id: '1', email: 'admin@smartearn.com', password: 'admin123', role: 'Super Admin', name: 'Super Admin' },
        { id: '2', email: 'jvdhussain09@gmail.com', password: 'admin123', role: 'Super Admin', name: 'Owner' }
      ];

      const savedAdmins = localStorage.getItem('smart_earn_admins');
      if (savedAdmins) {
        const parsed = JSON.parse(savedAdmins);
        // Merge initial admins if they don't exist in saved ones
        const merged = [...parsed];
        initialAdmins.forEach(initial => {
          if (!merged.find(a => a.email === initial.email)) {
            merged.push(initial);
          }
        });
        if (merged.length !== parsed.length) {
          localStorage.setItem('smart_earn_admins', JSON.stringify(merged));
        }
        return merged;
      }
      
      localStorage.setItem('smart_earn_admins', JSON.stringify(initialAdmins));
      return initialAdmins;
    }
    return [];
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Withdrawal Request',
      message: 'John Doe requested ₹500 withdrawal.',
      type: 'withdrawal',
      date: '2 mins ago',
      read: false,
      link: '/withdraw-requests/1',
      actionLabel: 'Process',
      actionLink: '/withdraw-requests/1'
    }
  ]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const addNotification = React.useCallback((n: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      date: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    showToast(`New Notification: ${n.title}`);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared');
  };

  const addAdmin = (admin: Omit<Admin, 'id'>) => {
    const newAdmin = { ...admin, id: Math.random().toString(36).substr(2, 9) };
    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('smart_earn_admins', JSON.stringify(updatedAdmins));
    showToast('New admin added successfully');
  };

  const login = (email: string, password: string): boolean => {
    const admin = admins.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentUser(admin);
      localStorage.setItem('smart_earn_user', JSON.stringify(admin));
      showToast(`Welcome back, ${admin.name}!`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smart_earn_user');
    setLogoutModalOpen(false);
    window.location.href = '/login';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <UIContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      closeSidebar, 
      showToast,
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      unreadCount,
      admins,
      addAdmin,
      currentUser,
      login,
      logout,
      isLogoutModalOpen,
      setLogoutModalOpen,
      confirmLogout
    }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
