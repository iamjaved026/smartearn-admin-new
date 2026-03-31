'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/DataTable';
import { UserPlus, Shield, Mail, Lock, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useUI } from '@/context/UIContext';

export default function AdminsPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useUI();
  
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
     const q = query(collection(db, 'users'), where('role', '==', 'admin'));
     const unsubscribe = onSnapshot(q, (snapshot) => {
        const adminData: any[] = [];
        snapshot.forEach(doc => {
           adminData.push({
             id: doc.id,
             name: doc.data().displayName || doc.data().name || 'Unknown',
             email: doc.data().email || 'No Email',
             role: 'Admin',
           });
        });
        
        // Add hardcoded super admins safely to the view
        if (!adminData.find(a => a.email === 'jvdhussain2008@gmail.com')) {
           adminData.unshift({
             id: 'master-owner-1',
             name: 'Javed Hussain',
             email: 'jvdhussain2008@gmail.com',
             role: 'Admin'
           });
        }
        
        setAdmins(adminData);
        setLoading(false);
     }, (err) => {
        console.error(err);
        setLoading(false);
     });
     
     return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
       return showToast('Complete all fields', 'error');
    }
    
    setIsSubmitting(true);
    
    try {
       // 1. Check if user already exists
       const userQuery = query(collection(db, 'users'), where('email', '==', formData.email.trim()));
       const userSnap = await getDocs(userQuery);
       
       if (!userSnap.empty) {
          // User exists, elevate their role natively
          const existingUserDoc = userSnap.docs[0];
          await updateDoc(doc(db, 'users', existingUserDoc.id), {
             role: 'admin'
          });
          showToast(`Elevated ${formData.email} to Admin successfully!`, 'success');
       } else {
          // 2. Instantiate Ghost Auth Sandbox to prevent Session Wipe
          const secondaryApp = initializeApp(app.options, `GhostApp_${Date.now()}`);
          const secondaryAuth = getAuth(secondaryApp);
          
          try {
             // Create Auth Profile securely
             const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email.trim(), formData.password);
             const newUid = userCredential.user.uid;
             
             // Setup exact Database Document Structure using the PRIMARY Admin session to bypass Role injection blocks
             await setDoc(doc(db, 'users', newUid), {
                displayName: formData.name.trim(),
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: 'admin',
                coins: 0,
                joinedAt: new Date().toISOString(),
                isBanned: false,
                completedTasks: 0,
                referrals: 0,
                notifications: []
             });
             
             showToast(`Admin ${formData.email} provisioned successfully!`, 'success');
          } catch (authError: any) {
             console.error('Firebase Auth Creation Guard:', authError);
             throw new Error(authError.message || 'Auth provisioning failed. Password may be too weak or email malformed.');
          } finally {
             // 3. Implode the Ghost Sandbox securely
             await secondaryAuth.signOut();
             await deleteApp(secondaryApp);
          }
       }
       
       setIsAdding(false);
       setFormData({ name: '', email: '', password: '' });
    } catch (error: any) {
       console.error(error);
       showToast(error.message || 'Failed provisioning administrative privileges.', 'error');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
     if (email === 'jvdhussain2008@gmail.com') return; // Master Lock
     const confirmed = window.confirm(`Are you sure you want to revoke Admin access for ${email}?`);
     if (!confirmed) return;
     
     try {
        await updateDoc(doc(db, 'users', id), {
            role: 'user'
        });
        showToast('Administrative privileges revoked.', 'success');
     } catch (e) {
        showToast('Failed to revoke privileges.', 'error');
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Create and manage administrative accounts via Firebase Secure Provisioning.</p>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Provision Admin Account</h3>
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Grant Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex rounded-2xl border border-slate-200 bg-white items-center justify-center text-indigo-500">
           <Loader2 size={32} className="animate-spin" />
        </div>
      ) : (
        <DataTable 
          data={admins}
          title="Active Privileged Accounts"
          columns={[
            { header: 'Name', accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase">
                  {item.name[0]}
                </div>
                <span className="font-semibold text-slate-900">{item.name}</span>
              </div>
            )},
            { header: 'Email', accessor: 'email' },
            { header: 'Clearance Range', accessor: (item) => (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.email === 'jvdhussain2008@gmail.com' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
              )}>
                {item.email === 'jvdhussain2008@gmail.com' ? <ShieldCheck size={10} /> : <Shield size={10} />}
                {item.role}
              </span>
            )},
            { header: 'Revoke Access', accessor: (item) => (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleRemoveAdmin(item.id, item.email)}
                  title="Demote to User Profile"
                  disabled={item.email === 'jvdhussain2008@gmail.com' || item.id === currentUser?.uid || item.email === currentUser?.email}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          ]}
        />
      )}
    </div>
  );
}
