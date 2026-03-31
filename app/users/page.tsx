'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '@/components/DataTable';
import { Ban, Search, UserCheck, Info, Loader2, Filter, ArrowRight, MoreVertical } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'name' | 'email' | 'id'>('name');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useUI();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const isBanned = data.bannedUntil && new Date(data.bannedUntil).getTime() > Date.now();
        usersData.push({
          id: doc.id,
          name: data.displayName || 'Unknown User',
          email: data.email || 'No Email',
          coins: data.coins || 0,
          referrals: data.referrals || 0,
          status: isBanned ? 'Banned' : 'Active',
          referralCode: data.referralCode || 'N/A',
        });
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      showToast('Failed to load users from Firebase', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleToggleBan = async (id: string, currentStatus: string) => {
    try {
      const userRef = doc(db, 'users', id);
      if (currentStatus === 'Banned') {
        await updateDoc(userRef, {
          bannedUntil: null,
          bannedReason: null
        });
        showToast('User unbanned successfully', 'success');
      } else {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10);
        await updateDoc(userRef, {
          bannedUntil: futureDate.toISOString(),
          bannedReason: 'Admin Action'
        });
        showToast('User banned', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to update ban status', 'error');
    }
  };

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchFilter]);

  // Derived state: Filtered Users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    
    return users.filter(u => {
      if (searchFilter === 'name') return u.name?.toLowerCase().includes(query);
      if (searchFilter === 'email') return u.email?.toLowerCase().includes(query);
      if (searchFilter === 'id') return u.id?.toLowerCase().includes(query);
      return true;
    });
  }, [users, searchQuery, searchFilter]);

  // Derived state: Paginated Users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-6 pt-4">

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Advanced Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 flex-1 w-full max-w-2xl">
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Filter size={16} />
                 </div>
                 <select 
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value as any)}
                    className="h-10 border border-slate-200 bg-slate-50 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 outline-none font-medium text-slate-700"
                 >
                    <option value="name">Search by Name</option>
                    <option value="email">Search by Email</option>
                    <option value="id">Search by UID</option>
                 </select>
              </div>
              
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Type to search...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button 
                  onClick={() => document.querySelector('input')?.focus()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-indigo-50 p-1 text-indigo-600 hover:bg-indigo-100"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
           </div>
           
           <button 
             title="Export Options"
             onClick={() => showToast('Export Options menu')}
             className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-all shrink-0"
           >
             <MoreVertical size={18} />
           </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <DataTable
            data={paginatedUsers}
            compact={true}
            selectedId={selectedId || undefined}
            onRowClick={(item) => router.push(`/users/${item.id}`)}
            pagination={{
               currentPage,
               totalPages,
               totalItems: filteredUsers.length,
               itemsPerPage,
               onPageChange: (page) => setCurrentPage(page)
            }}
            columns={[
              { header: 'Name', accessor: (item) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    {item.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
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
                      handleToggleBan(item.id, item.status);
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
        )}
      </div>
    </div>
  );
}
