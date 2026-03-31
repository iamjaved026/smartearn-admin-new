'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast, { ToastType } from '@/components/Toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  unreadCount: number;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
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
      unreadCount
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
