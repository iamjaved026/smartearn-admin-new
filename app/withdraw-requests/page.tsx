'use client';

import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import { withdrawRequests as initialRequests, usersData } from '@/lib/mock-data';
import { Check, X, Info, Send } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';

export default function WithdrawRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const { showToast, addNotification } = useUI();
  const router = useRouter();

  const handleAction = (id: number, status: 'Approved' | 'Rejected') => {
    const request = requests.find(r => r.id === id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showToast(`Request ${status} successfully`, status === 'Approved' ? 'success' : 'error');

    if (status === 'Approved' && request) {
      const userObj = usersData.find(u => u.name === request.user);
      const userId = userObj?.id || '1';
      
      addNotification({
        title: 'Withdrawal Processed',
        message: `Withdrawal of ₹${request.amount} for ${request.user} has been approved.`,
        type: 'info',
        actionLabel: 'Send Message',
        actionLink: `/users/${userId}`
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Withdrawal Requests</h1>
        <p className="text-slate-500">Manage and process user withdrawal requests.</p>
      </div>

      <DataTable
        data={requests}
        compact={true}
        onRowClick={(item) => router.push(`/withdraw-requests/${item.id}`)}
        columns={[
          { header: 'User', accessor: 'user', className: 'font-medium text-slate-900' },
          { header: 'Amount', accessor: (item) => (
            <span className="font-bold text-slate-900">₹{item.amount}</span>
          )},
          { header: 'UPI ID', accessor: 'upi', className: 'font-mono text-xs' },
          { header: 'Status', accessor: (item) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
              item.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'
            }`}>
              {item.status}
            </span>
          )},
          { header: 'Date', accessor: 'date' },
          { header: 'Actions', accessor: (item) => {
            const userObj = usersData.find(u => u.name === item.user);
            const userId = userObj?.id || '1';
            
            return (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/withdraw-requests/${item.id}`);
                  }}
                  title="View Details" 
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Info size={14} />
                </button>
                {item.status === 'Approved' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/users/${userId}`);
                    }}
                    title="Send Message" 
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                )}
                {item.status === 'Pending' && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item.id, 'Approved');
                      }}
                      title="Approve" 
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item.id, 'Rejected');
                      }}
                      title="Reject" 
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            );
          }},
        ]}
      />
    </div>
  );
}
