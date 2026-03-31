'use client';

import React, { useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Send, Users, User, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import FormInput from '@/components/FormInput';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { showToast } = useUI();
  const [activeTab, setActiveTab] = useState<'global' | 'specific'>('global');

  // Global State
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');
  const [isSendingGlobal, setIsSendingGlobal] = useState(false);

  // Specific User State
  const [specificUid, setSpecificUid] = useState('');
  const [specificTitle, setSpecificTitle] = useState('');
  const [specificMessage, setSpecificMessage] = useState('');
  const [isSendingSpecific, setIsSendingSpecific] = useState(false);

  const handleSendGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalTitle.trim() || !globalMessage.trim()) return showToast('Please fill all fields', 'error');
    
    setIsSendingGlobal(true);
    try {
      const newNotification = {
        date: new Date().toISOString(),
        title: globalTitle.trim(),
        message: globalMessage.trim(),
      };
      await addDoc(collection(db, 'global_notifications'), newNotification);
      showToast('Global notification broadcasted successfully!', 'success');
      setGlobalTitle('');
      setGlobalMessage('');
    } catch (error) {
      console.error(error);
      showToast('Failed to broadcast global message.', 'error');
    } finally {
      setIsSendingGlobal(false);
    }
  };

  const handleSendSpecific = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specificUid.trim() || !specificTitle.trim() || !specificMessage.trim()) return showToast('Please fill all fields', 'error');
    
    setIsSendingSpecific(true);
    try {
      const userRef = doc(db, 'users', specificUid.trim());
      const newNotification = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        title: specificTitle.trim(),
        message: specificMessage.trim(),
        read: false
      };
      
      await updateDoc(userRef, {
        notifications: arrayUnion(newNotification)
      });
      showToast('Targeted message dispatched successfully!', 'success');
      setSpecificUid('');
      setSpecificTitle('');
      setSpecificMessage('');
    } catch (error) {
      console.error(error);
      showToast('Failed to dispatch targeted message. Check UID.', 'error');
    } finally {
      setIsSendingSpecific(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Push Center</h1>
        <p className="text-slate-500">Dispatch system-wide broadcast alerts or private targeted notices natively to devices.</p>
      </div>

      <div className="max-w-4xl">
        {/* Dual Tab Controls */}
        <div className="flex w-full mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
             onClick={() => setActiveTab('global')}
             className={cn(
               "flex flex-1 items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all text-sm",
               activeTab === 'global' ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
             )}
          >
             <Globe size={18} /> Global Broadcaster
          </button>
          <button
             onClick={() => setActiveTab('specific')}
             className={cn(
               "flex flex-1 items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all text-sm",
               activeTab === 'specific' ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
             )}
          >
             <User size={18} /> Direct User Targeting
          </button>
        </div>

        {/* Global Tab Content */}
        {activeTab === 'global' && (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative overflow-hidden">
                <Globe size={120} className="absolute -right-6 -bottom-6 text-white/10" />
                <h3 className="text-2xl font-bold mb-2 relative z-10">Global Broadcast</h3>
                <p className="text-indigo-100 max-w-lg relative z-10 text-sm leading-relaxed">
                   Messages formulated here will be permanently injected into the global feed. All actively registered devices syncing down the global_notifications database will trigger an event.
                </p>
             </div>
             <form onSubmit={handleSendGlobal} className="p-8 space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                   <AlertTriangle size={20} className="shrink-0 text-amber-500" />
                   <p className="text-sm font-medium">Use Global broadcast sparingly. Heavy global spam can trigger Firebase quota bumps and irritate your userbase.</p>
                </div>
                
                <FormInput
                   label="Alert Title"
                   value={globalTitle}
                   onChange={(e) => setGlobalTitle(e.target.value)}
                   placeholder="e.g. Server Maintenance, Welcome Event!"
                   required
                />
                
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-700">Notification Payload Message</label>
                   <textarea
                      value={globalMessage}
                      onChange={(e) => setGlobalMessage(e.target.value)}
                      placeholder="Type the massive broadcast message you want everyone to see..."
                      className="w-full h-32 rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner"
                      required
                   />
                </div>

                <div className="pt-4 flex justify-end">
                   <button 
                     type="submit"
                     disabled={isSendingGlobal}
                     className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 w-full sm:w-auto"
                   >
                     {isSendingGlobal ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     Broadcast to All Users
                   </button>
                </div>
             </form>
          </div>
        )}

        {/* Specific Tab Content */}
        {activeTab === 'specific' && (
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <Users size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                <h3 className="text-2xl font-bold mb-2 relative z-10">Targeted Notification</h3>
                <p className="text-slate-400 max-w-lg relative z-10 text-sm leading-relaxed">
                   Bypass the public feed and push a private alert securely into a specific user's document using their Firebase UID. They will receive this alert securely.
                </p>
             </div>
             <form onSubmit={handleSendSpecific} className="p-8 space-y-6">
                
                <FormInput
                   label="Target Firebase UID"
                   value={specificUid}
                   onChange={(e) => setSpecificUid(e.target.value)}
                   placeholder="e.g. eaDZpC1ljJVJlmbzAQLMkJGWiu53"
                   helperText="Ensure you paste the exact ID. Incorrect IDs will silent fail on Firebase."
                   required
                />

                <FormInput
                   label="Private Notice Title"
                   value={specificTitle}
                   onChange={(e) => setSpecificTitle(e.target.value)}
                   placeholder="e.g. Your Cash Has Been Approved!"
                   required
                />
                
                <div className="space-y-1.5">
                   <label className="text-sm font-semibold text-slate-700">Detailed Message</label>
                   <textarea
                      value={specificMessage}
                      onChange={(e) => setSpecificMessage(e.target.value)}
                      placeholder="Type the private instructions or receipt message directly to them..."
                      className="w-full h-32 rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
                      required
                   />
                </div>

                <div className="pt-4 flex justify-end">
                   <button 
                     type="submit"
                     disabled={isSendingSpecific}
                     className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 w-full sm:w-auto"
                   >
                     {isSendingSpecific ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     Dispatch Private Notice
                   </button>
                </div>
             </form>
          </div>
        )}

      </div>
    </div>
  );
}
