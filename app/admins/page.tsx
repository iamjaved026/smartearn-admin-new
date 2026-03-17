'use client';

import React, { useState } from 'react';
import { useUI, Admin } from '@/context/UIContext';
import DataTable from '@/components/DataTable';
import { UserPlus, Shield, Mail, Lock, Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminsPage() {
  const { admins, addAdmin, currentUser } = useUI();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin' as 'Admin' | 'Super Admin'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAdmin(formData);
    setIsAdding(false);
    setFormData({ name: '', email: '', password: '', role: 'Admin' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Create and manage administrative accounts.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <UserPlus size={18} />
          {isAdding ? 'Cancel' : 'New Admin'}
        </button>
      </div>

      {isAdding && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Add New Admin</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="text" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Gmail Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="email" 
                  placeholder="admin@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Grant Access
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable 
        data={admins}
        title="Administrative Accounts"
        columns={[
          { header: 'Name', accessor: (item) => (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs">
                {item.name[0]}
              </div>
              <span className="font-semibold text-slate-900">{item.name}</span>
            </div>
          )},
          { header: 'Email', accessor: 'email' },
          { header: 'Role', accessor: (item) => (
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              item.role === 'Super Admin' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
            )}>
              {item.role === 'Super Admin' ? <ShieldCheck size={10} /> : <Shield size={10} />}
              {item.role}
            </span>
          )},
          { header: 'Actions', accessor: (item) => (
            <div className="flex items-center gap-2">
              <button 
                disabled={item.role === 'Super Admin' || item.id === currentUser?.id}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        ]}
      />
    </div>
  );
}
