'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Coins, Share2, Shield, Plus, Minus, Send, Loader2, Edit2, Save, Ban as BanIcon, History, Calendar, ArrowUpRight, ArrowDownRight, MessageSquare } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import FormInput from '@/components/FormInput';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SkeletonBlock } from '@/components/Skeleton';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useUI();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Coin Adjustments
  const [coinsToAdjust, setCoinsToAdjust] = useState<number | ''>('');
  const [adjusting, setAdjusting] = useState(false);
  
  // Messaging
  const [message, setMessage] = useState('');
  
  // Profile Edits
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Ban Interface
  const [banDuration, setBanDuration] = useState('7');
  const [banReason, setBanReason] = useState('');

  // Aggregated Stats
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    const userRef = doc(db, 'users', params.id as string);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isBanned = data.bannedUntil && new Date(data.bannedUntil).getTime() > Date.now();
        setUser({
          id: docSnap.id,
          name: data.displayName || 'Unnamed User',
          email: data.email || 'No email provided',
          coins: data.coins || 0,
          referrals: data.referrals || 0,
          referralCode: data.referralCode || 'N/A',
          status: isBanned ? 'Banned' : 'Active',
          bannedUntil: data.bannedUntil || null,
          bannedReason: data.bannedReason || null,
          joinedAt: data.joinedAt ? new Date(data.joinedAt).toLocaleDateString() : 'Unknown',
          notifications: data.notifications || []
        });
        setEditName(data.displayName || 'Unnamed User');
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      showToast('Error loading user profile', 'error');
      setLoading(false);
    });

    // Fetch Aggregated Stats safely
    const fetchStats = async () => {
       try {
          const wq = query(collection(db, 'withdrawals'), where('uid', '==', params.id), where('status', '==', 'completed'));
          const ws = await getDocs(wq);
          let sumW = 0;
          ws.forEach(d => sumW += Number(d.data().amount || 0));
          setTotalWithdrawn(sumW);

          const tq = query(collection(db, 'transactions'), where('uid', '==', params.id));
          const ts = await getDocs(tq);
          setTotalTransactions(ts.size);
       } catch(e) { console.error("Stats error", e); }
    }
    fetchStats();

    return () => unsubscribe();
  }, [params.id, showToast]);

  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', params.id as string), {
        displayName: editName
      });
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (e) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAdjustCoins = async (type: 'add' | 'subtract') => {
    if (coinsToAdjust === '' || coinsToAdjust <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setAdjusting(true);
    try {
      const amount = type === 'add' ? coinsToAdjust : -coinsToAdjust;
      const userRef = doc(db, 'users', params.id as string);
      const batch = writeBatch(db);
      
      batch.update(userRef, { coins: increment(amount) });
      const newTransactionRef = doc(collection(db, 'transactions'));
      batch.set(newTransactionRef, {
         uid: params.id,
         type: "Admin Adjustment",
         amount: amount,
         status: "completed",
         description: type === 'add' ? "Manually added by Admin" : "Manually deducted by Admin",
         date: new Date().toISOString()
      });
      
      await batch.commit();
      showToast(`${type === 'add' ? 'Added' : 'Subtracted'} ${coinsToAdjust} coins`, 'success');
      setCoinsToAdjust('');
      setTotalTransactions(prev => prev + 1);
    } catch (e) {
      console.error(e);
      showToast('Failed to adjust coins', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }
    try {
      const userRef = doc(db, 'users', params.id as string);
      const newNotification = {
        id: Math.random().toString(36).substring(7),
        title: 'Message from Admin',
        message: message,
        date: new Date().toISOString(),
        read: false
      };
      await updateDoc(userRef, {
        notifications: arrayUnion(newNotification)
      });
      showToast('Message sent to user successfully', 'success');
      setMessage('');
    } catch (e) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleBanAction = async () => {
    if (user.status === 'Active' && !banReason.trim()) {
       showToast('Please provide a ban reason', 'error');
       return;
    }
    try {
      const userRef = doc(db, 'users', params.id as string);
      if (user.status === 'Banned') {
         await updateDoc(userRef, { bannedUntil: null, bannedReason: null });
         showToast('User unbanned successfully', 'success');
      } else {
         const futureDate = new Date();
         if (banDuration === '7') futureDate.setDate(futureDate.getDate() + 7);
         else if (banDuration === '30') futureDate.setDate(futureDate.getDate() + 30);
         else futureDate.setFullYear(futureDate.getFullYear() + 100);
         
         await updateDoc(userRef, {
           bannedUntil: futureDate.toISOString(),
           bannedReason: banReason
         });
         showToast(`User banned for ${banDuration === '36500' ? 'Life' : banDuration + ' Days'}`, 'error');
         setBanReason('');
      }
    } catch (e) { showToast('Action failed', 'error'); }
  };

  if (loading) {
    return (
       <div className="space-y-6 animate-in fade-in pb-12">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
             <SkeletonBlock />
             <div className="lg:col-span-2 space-y-6">
               <SkeletonBlock />
               <SkeletonBlock />
             </div>
          </div>
       </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">User not found</h2>
          <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const sortedNotifications = user.notifications.slice().sort((a:any,b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Users DB
      </button>

      {/* Main Profile Header */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
         <div className="bg-slate-900 p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
               <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-2xl font-black text-white">
                 {user?.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()}
               </div>
               <div className="text-white space-y-1">
                 {isEditing ? (
                    <div className="flex items-center gap-2">
                       <input 
                         type="text" 
                         value={editName} 
                         onChange={(e) => setEditName(e.target.value)}
                         className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xl font-bold text-white outline-none focus:border-white/40"
                       />
                       <button onClick={handleUpdateProfile} className="p-2 bg-emerald-500 rounded-lg hover:bg-emerald-600"><Save size={16} /></button>
                       <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">Cancel</button>
                    </div>
                 ) : (
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-bold">{user.name}</h1>
                       <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-white"><Edit2 size={16}/></button>
                    </div>
                 )}
                 <p className="text-slate-400 flex items-center gap-2">
                   <Mail size={14}/> {user.email} <span className="opacity-50">|</span> 
                   <Calendar size={14}/> Joined {user.joinedAt}
                 </p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                  <p className="text-slate-400 text-xs font-bold uppercase">Balance</p>
                  <p className="text-amber-400 text-2xl font-black">{user.coins.toLocaleString()} <span className="text-sm font-medium opacity-70">Coins</span></p>
               </div>
               <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                  <p className="text-slate-400 text-xs font-bold uppercase">Status</p>
                  <p className={`text-lg font-black ${user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>{user.status}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Col - Stats & Deep Insights */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><ArrowUpRight size={16} className="text-indigo-600"/> Lifetime Progress</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Withdrawals</span>
                <span className="font-bold text-slate-900">₹{totalWithdrawn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Activity Events</span>
                <span className="font-bold text-slate-900">{totalTransactions} trxs</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Referrals</span>
                <span className="font-bold text-slate-900">{user.referrals}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-indigo-600">
                <span className="text-sm font-medium">Referral Code</span>
                <span className="font-mono font-bold bg-indigo-50 px-2 rounded">{user.referralCode}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><BanIcon size={16} className="text-rose-600"/> Account Restriction</h3>
            {user.status === 'Banned' ? (
               <div className="space-y-4">
                 <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <p className="text-rose-800 text-sm font-bold mb-1">Restricted Access</p>
                    <p className="text-rose-600 text-xs mb-2">Until: {new Date(user.bannedUntil).toLocaleDateString()}</p>
                    <p className="text-rose-700 text-sm italic bg-rose-100 p-2 rounded">"{user.bannedReason}"</p>
                 </div>
                 <button onClick={handleBanAction} className="w-full bg-slate-900 text-white rounded-xl py-2 font-semibold hover:bg-slate-800 text-sm transition-all">Revoke Ban & Restore Access</button>
               </div>
            ) : (
               <div className="space-y-4">
                 <select value={banDuration} onChange={e => setBanDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-rose-500">
                    <option value="7">Suspend for 7 Days</option>
                    <option value="30">Suspend for 30 Days</option>
                    <option value="36500">Permanent Ban</option>
                 </select>
                 <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason for ban (visible to user)..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-rose-500" />
                 <button onClick={handleBanAction} className="w-full bg-rose-600 text-white rounded-xl py-2 font-semibold hover:bg-rose-700 text-sm shadow-lg shadow-rose-200 transition-all">Enforce Restriction</button>
               </div>
            )}
          </div>
        </div>

        {/* Right Col - Core Controls */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
              <Coins size={18} className="text-amber-500" /> Administrative Bank Transfer 
            </h3>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                 <FormInput 
                   label="Amount to inject / deduct"
                   type="number"
                   value={coinsToAdjust}
                   onChange={(e) => setCoinsToAdjust(e.target.value === '' ? '' : parseInt(e.target.value))}
                   placeholder="Enter explicit coin amount..."
                   helperText="Values altered here will reflect permanently on the user's ledger."
                 />
              </div>
              <div className="flex gap-2 w-full md:w-auto pb-[22px]">
                <button 
                  disabled={adjusting}
                  onClick={() => handleAdjustCoins('add')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-[10.5px] text-sm font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-70"
                >
                  <Plus size={16} /> Credit
                </button>
                <button 
                  disabled={adjusting}
                  onClick={() => handleAdjustCoins('subtract')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-[10.5px] text-sm font-bold text-white shadow-md shadow-rose-100 hover:bg-rose-700 transition-all disabled:opacity-70"
                >
                  <Minus size={16} /> Debit
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col md:flex-row">
             <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><Send size={18} className="text-indigo-600" /> Push Realtime Notice</h3>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type an exact alert to push directly to their device..."
                  className="w-full h-32 rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none mb-4 shadow-inner"
                />
                <button 
                  onClick={handleSendMessage}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <Send size={16} /> Issue Notification
                </button>
             </div>
             <div className="p-8 md:w-1/2">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><History size={18} className="text-slate-400" /> Notice History Log</h3>
                <div className="h-[200px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                   {sortedNotifications.length > 0 ? sortedNotifications.map((n:any) => (
                      <div key={n.id} className="bg-white border text-left border-slate-100 rounded-xl p-4 shadow-sm relative group">
                         <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800 text-sm">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(n.date).toLocaleDateString()}</span>
                         </div>
                         <p className="text-sm text-slate-600">{n.message}</p>
                      </div>
                   )) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <MessageSquare size={32} className="mb-2 opacity-20"/>
                         <p className="text-sm">No prior notices issued.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
