'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersData } from '@/lib/mock-data';
import { ArrowLeft, Mail, Coins, Share2, Shield, Plus, Minus, Save, CheckCircle2, Send } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import FormInput from '@/components/FormInput';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useUI();
  
  // Find user directly during render for static mock data
  const initialUser = usersData.find(u => u.id === params.id);
  const [user, setUser] = useState<any>(initialUser);
  const [coinsToAdjust, setCoinsToAdjust] = useState<number>(0);
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">User not found</h2>
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

  const handleAdjustCoins = (type: 'add' | 'subtract') => {
    if (coinsToAdjust <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const amount = type === 'add' ? coinsToAdjust : -coinsToAdjust;
    setUser((prev: any) => ({
      ...prev,
      coins: Math.max(0, prev.coins + amount)
    }));
    
    showToast(`${type === 'add' ? 'Added' : 'Subtracted'} ${coinsToAdjust} coins successfully`);
    setCoinsToAdjust(0);
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Users
      </button>

      {/* Withdrawal Approval Banner */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-emerald-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="font-bold">Withdrawal Request Approved</p>
          <p className="text-sm">This user has a recently approved withdrawal request. You can now send them a confirmation message.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* User Profile Card */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-3xl font-bold text-indigo-600">
                {user.name.split(' ').map((n: any) => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              
              <div className="mt-6 flex w-full flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {user.status}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-xs font-medium text-slate-500 uppercase">User ID</span>
                  <span className="text-xs font-mono font-semibold text-slate-700">#{user.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-xs font-medium text-amber-600 uppercase">Coins</p>
                <p className="text-lg font-bold text-amber-700">{user.coins.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-4 text-center">
                <p className="text-xs font-medium text-indigo-600 uppercase">Referrals</p>
                <p className="text-lg font-bold text-indigo-700">{user.referrals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Details & Actions */}
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
              <Shield size={18} className="text-indigo-600" />
              User Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Gmail / Email</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Referral Code</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                  <Share2 size={16} className="text-slate-400" />
                  <span className="text-sm font-mono font-bold">{user.referralCode}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
              <Coins size={18} className="text-amber-500" />
              Manage Coins
            </h3>

            <div className="max-w-md space-y-6">
              <FormInput 
                label="Amount to adjust"
                type="number"
                value={coinsToAdjust}
                onChange={(e) => setCoinsToAdjust(parseInt(e.target.value) || 0)}
                placeholder="Enter coin amount..."
                helperText="Enter the number of coins you want to add or subtract from this user's balance."
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => handleAdjustCoins('add')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  <Plus size={18} />
                  Add Coins
                </button>
                <button 
                  onClick={() => handleAdjustCoins('subtract')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  <Minus size={18} />
                  Subtract Coins
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
              <Send size={18} className="text-indigo-600" />
              Send Message to User
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Message Content</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here... (e.g. Your withdrawal has been processed)"
                  className="w-full h-32 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>
              <button 
                onClick={() => {
                  showToast('Message sent to user successfully');
                  setMessage('');
                }}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Send size={16} />
                Send Notification
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => showToast('User profile updated successfully')}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
