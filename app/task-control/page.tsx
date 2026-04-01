'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Save, PlaySquare, Keyboard, Image as ImageIcon, Ticket, RotateCw, Loader2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { SkeletonBlock } from '@/components/Skeleton';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface TaskConfig {
  reward: number | string;
  limitInRow: number | string;
  cooldownMinutes: number | string;
  dailyLimit: number | string;
}

interface TaskSettingsState {
  [key: string]: TaskConfig;
  ads: TaskConfig;
  typing: TaskConfig;
  logo: TaskConfig;
  scratch: TaskConfig;
  spin: TaskConfig;
}

const defaultState: TaskSettingsState = {
  ads: { reward: 20, limitInRow: 10, cooldownMinutes: 60, dailyLimit: 50 },
  typing: { reward: 10, limitInRow: 5, cooldownMinutes: 10, dailyLimit: 100 },
  logo: { reward: 15, limitInRow: 10, cooldownMinutes: 60, dailyLimit: 50 },
  scratch: { reward: 20, limitInRow: 10, cooldownMinutes: 60, dailyLimit: 50 },
  spin: { reward: 10, limitInRow: 1, cooldownMinutes: 10, dailyLimit: 100 },
};

const TASK_CATEGORIES = [
  { key: 'ads', title: 'Video Ads', icon: PlaySquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'typing', title: 'Captcha Typing', icon: Keyboard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'logo', title: 'Logo Matcher', icon: ImageIcon, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { key: 'scratch', title: 'Scratch Cards', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'spin', title: 'Lucky Wheel', icon: RotateCw, color: 'text-violet-600', bg: 'bg-violet-50' },
];

export default function TaskControlPage() {
  const { showToast } = useUI();
  const [settings, setSettings] = useState<TaskSettingsState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'config', 'app_config');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data.taskSettings && mounted) {
            // Merge defaults with database values gently in case they added new keys
            setSettings({ ...defaultState, ...data.taskSettings });
          }
        }
      } catch (e) {
        console.error("Failed fetching config:", e);
        showToast("Error pulling live config.", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchConfig();
    return () => { mounted = false; };
  }, [showToast]);

  const handleChange = (taskKey: string, field: keyof TaskConfig, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // 1. Mathematically enforce all strings into rigid Numbers to protect mobile computations!
      const parsedSettings: TaskSettingsState = { ...settings };
      
      Object.keys(parsedSettings).forEach(taskKey => {
         parsedSettings[taskKey] = {
            reward: Number(parsedSettings[taskKey].reward) || 0,
            limitInRow: Number(parsedSettings[taskKey].limitInRow) || 0,
            cooldownMinutes: Number(parsedSettings[taskKey].cooldownMinutes) || 0,
            dailyLimit: Number(parsedSettings[taskKey].dailyLimit) || 0,
         };
      });

      const configRef = doc(db, 'config', 'app_config');
      
      // 2. Transmit cleanly into structural Firestore Dictionary
      await setDoc(configRef, { taskSettings: parsedSettings }, { merge: true });
      
      // Update local state visually to replace strings with stripped parsed numbers perfectly
      setSettings(parsedSettings);
      
      showToast('Master constraints synchronized successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Synchronization error across Firestore bounds.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
           <div className="space-y-2 w-full max-w-md">
             <div className="h-8 w-2/3 bg-slate-200 rounded-lg animate-pulse" />
             <div className="h-4 w-full bg-slate-100 rounded-lg animate-pulse" />
           </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
           <SkeletonBlock />
           <SkeletonBlock />
           <SkeletonBlock />
           <SkeletonBlock />
           <SkeletonBlock />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Control Core</h1>
          <p className="text-slate-500">Remotely manipulate rigid constraints & payouts across the entire earning app dynamically.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Transmitting...' : 'Save All Configurations'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start 2xl:grid-cols-3">
        {TASK_CATEGORIES.map((category) => {
          const config = settings[category.key];
          if (!config) return null;

          return (
            <div key={category.key} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 p-5">
                 <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", category.bg, category.color)}>
                   <category.icon size={24} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{category.title}</h3>
                   <p className="text-xs text-slate-500 font-mono">config.taskSettings.{category.key}</p>
                 </div>
               </div>
               
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5 focus-within:text-indigo-600">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors">Reward Payout (Coins)</label>
                   <input 
                     type="number"
                     min={0}
                     value={config.reward}
                     onChange={(e) => handleChange(category.key, 'reward', e.target.value)}
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                   />
                 </div>
                 
                 <div className="space-y-1.5 focus-within:text-rose-600">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors">Combo Limit (In a Row)</label>
                   <input 
                     type="number"
                     min={1}
                     value={config.limitInRow}
                     onChange={(e) => handleChange(category.key, 'limitInRow', e.target.value)}
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all"
                   />
                 </div>
                 
                 <div className="space-y-1.5 focus-within:text-amber-600">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors">Cooldown (Minutes)</label>
                   <div className="relative">
                     <input 
                       type="number"
                       min={0}
                       value={config.cooldownMinutes}
                       onChange={(e) => handleChange(category.key, 'cooldownMinutes', e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MIN</span>
                   </div>
                 </div>

                 <div className="space-y-1.5 focus-within:text-emerald-600">
                   <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors">Maximum Daily Cap</label>
                   <div className="relative">
                     <input 
                       type="number"
                       min={1}
                       value={config.dailyLimit}
                       onChange={(e) => handleChange(category.key, 'dailyLimit', e.target.value)}
                       className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">/ 24H</span>
                   </div>
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
