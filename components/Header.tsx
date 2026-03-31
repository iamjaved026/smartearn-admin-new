'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Modal from './Modal';

export default function Header() {
  const { toggleSidebar } = useUI();
  const { user } = useAuth();
  const pathname = usePathname();
  
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setLogoutModalOpen(false);
      // Firebase listener in AuthContext handles native router.push('/login') seamlessly
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
             {pathname.includes('/users') ? 'User Management' : 
              pathname.includes('/withdraw-requests') ? 'Withdraw Requests' : 
              pathname.includes('/settings') ? 'Global Settings' : 
              pathname.includes('/admins') ? 'Admin Configuration' : 
              pathname.includes('/referrals') ? 'Analytics & Referrals' :
              pathname.includes('/notifications') ? 'Push Control Center' :
              'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="relative flex items-center gap-3 pl-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-none">{user?.displayName || user?.email?.split('@')[0] || 'Admin User'}</span>
            <span className="text-xs text-slate-500 mt-1">Authorized Clearance</span>
          </div>
          <div className="group relative">
            <button onClick={() => setLogoutModalOpen(true)} className="flex items-center gap-1 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-2 ring-white shadow-sm hover:bg-rose-100 hover:text-rose-600 transition-colors">
                <LogOut size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setLogoutModalOpen(false)} 
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to terminate your secure admin session? You will be returned to the login screen.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setLogoutModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmLogout}
              className="flex-1 flex justify-center gap-2 items-center rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              <LogOut size={16} /> Logout Now
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
