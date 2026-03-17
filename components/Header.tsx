import React, { useState } from 'react';
import { Search, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import NotificationCenter from './NotificationCenter';
import Modal from './Modal';

export default function Header() {
  const { toggleSidebar, currentUser, isLogoutModalOpen, setLogoutModalOpen, confirmLogout } = useUI();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden w-96 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:flex">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search analytics, users, tasks..." 
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <NotificationCenter />

        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-none">{currentUser?.name || 'Admin User'}</span>
            <span className="text-xs text-slate-500 mt-1">{currentUser?.role || 'Super Admin'}</span>
          </div>
          <div className="flex items-center gap-1 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-2 ring-white shadow-sm">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setLogoutModalOpen(false)} 
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to logout? You will need to login again to access the dashboard.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setLogoutModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmLogout}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
