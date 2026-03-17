import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Share2, 
  Wallet, 
  Gamepad2, 
  Settings, 
  LogOut,
  TrendingUp,
  X,
  Shield,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Share2, label: 'Referrals', href: '/referrals' },
  { icon: Wallet, label: 'Withdraw Requests', href: '/withdraw-requests' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Shield, label: 'Admins', href: '/admins' },
  { icon: Gamepad2, label: 'Tasks Control', href: '/task-control' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, logout } = useUI();

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-10 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <TrendingUp size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Smart Earn</span>
            </div>
            <button 
              onClick={closeSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-indigo-50 text-indigo-600" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={20} className="text-slate-400 group-hover:text-red-600" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
