'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withdrawRequests, usersData } from '@/lib/mock-data';
import { ArrowLeft, Wallet, User, Calendar, Hash, CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function WithdrawalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, addNotification } = useUI();
  
  // Find request directly during render for static mock data
  const initialRequest = withdrawRequests.find(r => r.id.toString() === params.id);
  const [request, setRequest] = useState<any>(initialRequest);

  // Find the user ID for messaging
  const userObj = usersData.find(u => u.name === request?.user);
  const userId = userObj?.id || '1';

  if (!request) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Request not found</h2>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleAction = (status: 'Approved' | 'Rejected') => {
    setRequest((prev: any) => ({ ...prev, status }));
    showToast(`Request ${status} successfully`, status === 'Approved' ? 'success' : 'error');
    
    if (status === 'Approved') {
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
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Requests
      </button>

      {request.status === 'Approved' && (
        <div className="max-w-3xl mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-500">
          <CheckCircle2 size={24} className="text-emerald-500" />
          <div>
            <p className="font-bold">Withdrawal Approved!</p>
            <p className="text-sm">The withdrawal request has been successfully processed and approved.</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <Wallet size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Withdrawal Detail</h1>
                  <p className="text-sm text-slate-400">Request ID: #{request.id}</p>
                </div>
              </div>
              <div className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${
                request.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                request.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {request.status}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-slate-400"><User size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Name</p>
                    <p className="text-lg font-semibold text-slate-900">{request.user}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-slate-400"><Hash size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID / Payment Address</p>
                    <p className="text-lg font-mono font-bold text-indigo-600">{request.upi}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-slate-400"><Calendar size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Date</p>
                    <p className="text-lg font-semibold text-slate-900">{request.date}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-slate-400"><Wallet size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                    <p className="text-2xl font-black text-slate-900">₹{request.amount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              {request.status === 'Pending' ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleAction('Approved')}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                  >
                    <CheckCircle2 size={20} />
                    Approve Request
                  </button>
                  <button 
                    onClick={() => handleAction('Rejected')}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 text-sm font-bold text-white shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                  >
                    <XCircle size={20} />
                    Reject Request
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500">
                  <div className="flex items-center gap-3">
                    <Clock size={20} />
                    <p className="text-sm font-medium">This request was processed on {request.date}</p>
                  </div>
                  {request.status === 'Approved' && (
                    <button 
                      onClick={() => router.push(`/users/${userId}`)}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
