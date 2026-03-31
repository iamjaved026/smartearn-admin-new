'use client';

import React, { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { Settings, Save, BellRing, Loader2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default configuration based on the Google AI Studio report
  const [config, setConfig] = useState({
    minWithdrawalCoins: 500,
    spinCooldownMinutes: 60,
    typingTasksInRow: 10,
    notice: 'Welcome to SmartEarn Admin! We have updated our referral rewards.',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'app_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        showToast('Failed to load settings from Firebase', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'app_config');
      // Merge true allows us to keep any other backend config fields safe
      await setDoc(docRef, config, { merge: true });
      showToast('Application settings saved successfully', 'success');
    } catch (error) {
      console.error("Error saving config:", error);
      showToast('Failed to save settings. Check your permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Application Settings</h1>
        <p className="text-slate-500">Configure global application parameters, tasks, and announcements.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">General Configuration</h3>
                <p className="text-sm text-slate-500">Core system values and task limits.</p>
              </div>
            </div>

            <div className="space-y-6">
              <FormInput 
                label="Minimum Withdraw Amount (Coins)" 
                type="number" 
                name="minWithdrawalCoins"
                value={config.minWithdrawalCoins}
                onChange={handleChange}
                placeholder="e.g. 500"
                helperText="Minimum coin threshold to request a payout"
              />
              <FormInput 
                label="Spin Cooldown (Minutes)" 
                type="number" 
                name="spinCooldownMinutes"
                value={config.spinCooldownMinutes}
                onChange={handleChange}
                placeholder="e.g. 60"
                helperText="Time required between wheel spins"
              />
              <FormInput 
                label="Typing Tasks Limits" 
                type="number" 
                name="typingTasksInRow"
                value={config.typingTasksInRow}
                onChange={handleChange}
                placeholder="e.g. 10"
                helperText="Number of consecutive typing tasks allowed before cooldown"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm h-fit">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Announcements</h3>
              <p className="text-sm text-slate-500">Broadcast messages to all app users.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Global Banner Notice
              </label>
              <textarea 
                name="notice"
                value={config.notice || ''}
                onChange={handleChange}
                className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="Enter message to display in the user app..."
              />
              <p className="text-xs text-slate-400">This message will appear prominently on the user side instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 transition-all"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
