'use client';

import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import { usersData as initialUsers } from '@/lib/mock-data';
import { Plus, Minus, Ban, Search, UserCheck, Info } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useUI();
  const router = useRouter();

  const handleToggleBan = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'Banned' ? 'Active' : 'Banned';
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(`User ${newStatus === 'Banned' ? 'banned' : 'unbanned'} successfully`, newStatus === 'Banned' ? 'error' : 'success');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">View and manage all registered users in the system.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-64"
            />
          </div>
          <button 
            onClick={() => showToast('Exporting user data...')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            Export Users
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <DataTable
          data={filteredUsers}
          compact={true}
          selectedId={selectedId || undefined}
          onRowClick={(item) => setSelectedId(item.id)}
          columns={[
            { header: 'Name', accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-slate-900">{item.name}</span>
              </div>
            )},
            { header: 'Email', accessor: 'email' },
            { header: 'Referral Code', accessor: (item) => (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600">
                {item.referralCode}
              </code>
            )},
            { header: 'Coins', accessor: (item) => (
              <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                <span>{item.coins.toLocaleString()}</span>
              </div>
            )},
            { header: 'Referrals', accessor: 'referrals' },
            { header: 'Status', accessor: (item) => (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {item.status}
              </span>
            )},
            { header: 'Actions', accessor: (item) => (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/users/${item.id}`);
                  }}
                  title="View Info" 
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Info size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBan(item.id);
                  }}
                  title={item.status === 'Banned' ? 'Unban User' : 'Ban User'} 
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    item.status === 'Banned' ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  )}
                >
                  {item.status === 'Banned' ? <UserCheck size={14} /> : <Ban size={14} />}
                </button>
              </div>
            )},
          ]}
        />
      </div>
    </div>
  );
}
