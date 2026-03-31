'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Check, X, Info, Send, Loader2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { processWithdrawalAction } from '@/lib/firebase-transactions';

export default function WithdrawRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();
  const router = useRouter();

  useEffect(() => {
    // We order by date descending to show newest withdrawals first
    const q = query(collection(db, 'withdrawals'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        const item = doc.data();
        data.push({
          id: doc.id,
          userUid: item.uid,
          amount: item.amount || 0,
          upi: item.details || item.method || 'N/A',
          status: item.status === 'completed' ? 'Approved' : item.status === 'failed' ? 'Rejected' : 'Pending',
          date: item.date ? new Date(item.date).toLocaleDateString() : 'Unknown',
          transactionId: item.transactionId,
        });
      });
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching withdrawals:", error);
      showToast('Error loading withdrawal requests', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleAction = async (id: string, transactionId: string, status: 'Approved' | 'Rejected') => {
    try {
      await processWithdrawalAction(id, transactionId, status);
      showToast(`Request ${status} successfully`, status === 'Approved' ? 'success' : 'error');
    } catch (error) {
      console.error(error);
      showToast(`Failed to update request`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Withdrawal Requests</h1>
        <p className="text-slate-500">Manage and process user withdrawal requests.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <DataTable
          data={requests}
          compact={true}
          onRowClick={(item) => router.push(`/withdraw-requests/${item.id}`)}
          columns={[
            { header: 'User UID', accessor: 'userUid', className: 'font-medium text-slate-900 text-xs' },
            { header: 'Amount', accessor: (item) => (
              <span className="font-bold text-slate-900">₹{item.amount}</span>
            )},
            { header: 'Details', accessor: 'upi', className: 'font-mono text-xs' },
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
                  {item.status === 'Pending' && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item.id, item.transactionId, 'Approved');
                        }}
                        title="Approve" 
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item.id, item.transactionId, 'Rejected');
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
      )}
    </div>
  );
}
