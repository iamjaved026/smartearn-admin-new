'use client';

import React from 'react';
import { useUI, Notification } from '@/context/UIContext';
import { Wallet, Info, AlertTriangle, CheckCircle2, ArrowLeft, Trash2, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useUI();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'withdrawal': return <Wallet size={24} className="text-emerald-500" />;
      case 'alert': return <AlertTriangle size={24} className="text-rose-500" />;
      default: return <Info size={24} className="text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.link) {
      router.push(n.link);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">Stay updated with the latest activities</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <CheckSquare size={18} />
            Mark all as read
          </button>
          <button 
            onClick={clearNotifications}
            className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-all"
          >
            <Trash2 size={18} />
            Clear all
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Info size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No notifications</h3>
            <p className="text-slate-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex items-start gap-6 p-6 transition-all cursor-pointer hover:bg-slate-50/50",
                  !n.read && "bg-indigo-50/30 border-l-4 border-l-indigo-500"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  n.type === 'withdrawal' ? "bg-emerald-50" : n.type === 'alert' ? "bg-rose-50" : "bg-blue-50"
                )}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("text-lg font-bold", n.read ? "text-slate-700" : "text-slate-900")}>
                      {n.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {n.date}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.message}</p>
                  
                  {n.actionLabel && n.actionLink && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(n.actionLink!);
                      }}
                      className="mt-4 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      {n.actionLabel}
                    </button>
                  )}
                </div>

                {!n.read && (
                  <div className="mt-2 h-3 w-3 rounded-full bg-indigo-500 shadow-sm" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
