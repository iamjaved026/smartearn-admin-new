'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
  const { unreadCount } = useUI();
  const router = useRouter();

  return (
    <div className="relative">
      <button 
        onClick={() => router.push('/notifications')}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
        title="View Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-4 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
