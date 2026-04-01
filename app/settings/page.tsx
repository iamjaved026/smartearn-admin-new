'use client';

import React, { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import Modal from '@/components/Modal';
import { 
  Settings, Save, BellRing, Loader2, PlaySquare, AlertTriangle, 
  LifeBuoy, Mail, Phone, MessageCircle, Activity, LayoutTemplate 
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { SkeletonBlock } from '@/components/Skeleton';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [confirmOverlay, setConfirmOverlay] = useState({
    isOpen: false,
    section: '',
    title: '',
    message: '',
  });

  const [config, setConfig] = useState({
    appStatus: 'normal',
    
    adsEnabled: true,
    bannerAdId: '',
    vastAdScript: '',
    
    supportEmail: '',
    supportPhone: '',
    supportWhatsApp: '',
    
    notice: '',
    noticeActive: true,
  });

  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'app_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && mounted) {
          setConfig((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        showToast('Failed to load settings from Firebase', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchConfig();
    return () => { mounted = false; };
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else {
      setConfig((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const triggerUpdate = (section: string) => {
    let title = '';
    let message = '';
    
    if (section === 'lifecycle') { 
      title = "Confirm App Lifecycle Overwrite"; 
      message = "Are you absolutely sure you want to change the foundational accessibility of the app globally? This will immediately lock active users out if Maintenance or Blocked is applied."; 
    }
    else if (section === 'ads') { 
      title = "Deploy New Advertisement Logic"; 
      message = "Double check your Tracker IDs before pushing. Pushing an invalid ad script will instantly crash all active monetization logic for the user app entirely.";
    }
    else if (section === 'support') { 
      title = "Update Global Contact Routes"; 
      message = "Are you sure you want to redirect the official support destination endpoints dynamically? In-app links will route to these targets instantaneously.";
    }
    else if (section === 'notice') { 
      title = "Broadcast Notice Modification"; 
      message = "Pushing these alert changes will immediately reflect natively for every single targeted user online across the world.";
    }
    
    setConfirmOverlay({ isOpen: true, section, title, message });
  };

  const commitUpdate = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'config', 'app_config');
      let partialConfig = {};
      
      if (confirmOverlay.section === 'lifecycle') {
        partialConfig = { appStatus: config.appStatus };
      } else if (confirmOverlay.section === 'ads') {
        partialConfig = { adsEnabled: config.adsEnabled, bannerAdId: config.bannerAdId, vastAdScript: config.vastAdScript };
      } else if (confirmOverlay.section === 'support') {
        partialConfig = { supportEmail: config.supportEmail, supportPhone: config.supportPhone, supportWhatsApp: config.supportWhatsApp };
      } else if (confirmOverlay.section === 'notice') {
        partialConfig = { notice: config.notice || '', noticeActive: config.noticeActive }; // Robust bypass for null strings
      }
      
      await setDoc(docRef, partialConfig, { merge: true });
      showToast('Master Logic Block Updated And Synchronized', 'success');
      setConfirmOverlay((prev) => ({...prev, isOpen: false }));
    } catch (error) {
      console.error("Error saving config:", error);
      showToast('Critical exception attempting to bypass config document.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
           <div className="space-y-2 w-full max-w-md">
             <div className="h-8 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
             <div className="h-4 w-full bg-slate-100 rounded-lg animate-pulse" />
           </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
          <h1 className="text-2xl font-bold text-slate-900">Application Parameters</h1>
          <p className="text-slate-500">Segmented global orchestration of App State, Ad Networking, and Contact modules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* App Status Controls */}
          <div className={cn(
            "rounded-2xl border p-8 shadow-sm transition-colors duration-500",
            config.appStatus === 'maintenance' ? "border-amber-300 bg-amber-50" :
            config.appStatus === 'blocked' ? "border-rose-300 bg-rose-50" :
            "border-slate-200 bg-white"
          )}>
            <div className="mb-8 flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                config.appStatus === 'maintenance' ? "bg-amber-100 text-amber-600" :
                config.appStatus === 'blocked' ? "bg-rose-100 text-rose-600" :
                "bg-emerald-100 text-emerald-600"
              )}>
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Application Lifecycle</h3>
                <p className="text-sm font-medium text-slate-500">Master Kill-Switch & Accessibility Control.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Enforcement Status</label>
                <select 
                  name="appStatus"
                  value={config.appStatus || 'normal'}
                  onChange={handleChange}
                  className={cn(
                    "w-full rounded-xl border-2 px-4 py-3 text-sm font-bold tracking-wide outline-none transition-all",
                    config.appStatus === 'maintenance' ? "border-amber-400 bg-amber-100 text-amber-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20" :
                    config.appStatus === 'blocked' ? "border-rose-400 bg-rose-100 text-rose-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" :
                    "border-emerald-200 bg-emerald-50 text-emerald-900 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  )}
                >
                  <option value="normal">🟢 NORMAL - ALL SYSTEMS ONLINE</option>
                  <option value="maintenance">🟡 MAINTENANCE MODE - TEMPORARY OFFLINE</option>
                  <option value="blocked">🔴 BLOCKED - CRITICAL SUSPENSION</option>
                </select>
              </div>
              
              <button 
                onClick={() => triggerUpdate('lifecycle')}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
              >
                Force Accessibility Override
              </button>
            </div>
          </div>

          {/* Advertisement Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <PlaySquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Monetization Networking</h3>
                <p className="text-sm text-slate-500">Inject raw VAST endpoints and control ad saturation.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ads Toggle</label>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="adsEnabled" checked={config.adsEnabled || false} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                 </label>
              </div>
            </div>

            <div className="space-y-6">
              <FormInput 
                label="Banner Script Identifier (String)" 
                type="text" 
                name="bannerAdId"
                value={config.bannerAdId || ''}
                onChange={handleChange}
                placeholder="ca-app-pub-3940256099942544/6300978111"
                helperText="Paste your exact AdMob/LeadBolt tracking hash."
              />
              <div className="space-y-1.5 focus-within:text-purple-600">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors">VAST XML Tracking URL</label>
                 <div className="relative">
                   <LayoutTemplate size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text"
                     name="vastAdScript"
                     value={config.vastAdScript || ''}
                     onChange={handleChange}
                     placeholder="https://googleads.g.doubleclick.net/pagead/ads?..."
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all font-mono"
                   />
                 </div>
              </div>
              <button 
                onClick={() => triggerUpdate('ads')}
                className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-200 hover:bg-purple-700 transition-colors"
              >
                Upload Ad Schematics
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Support Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <LifeBuoy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">User Contact Tracing</h3>
                <p className="text-sm text-slate-500">Official channels displayed directly inside the app Help screen.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative">
                 <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="email" name="supportEmail" value={config.supportEmail || ''} onChange={handleChange} placeholder="support@smartearn.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-cyan-500 focus:bg-white transition-colors" />
              </div>
              <div className="relative">
                 <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="tel" name="supportPhone" value={config.supportPhone || ''} onChange={handleChange} placeholder="+1 800 234 5678" className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-cyan-500 focus:bg-white transition-colors" />
              </div>
              <div className="relative">
                 <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="tel" name="supportWhatsApp" value={config.supportWhatsApp || ''} onChange={handleChange} placeholder="WhatsApp dial number..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-cyan-500 focus:bg-white transition-colors" />
              </div>
              <button 
                onClick={() => triggerUpdate('support')}
                className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-200 hover:bg-cyan-700 transition-colors mt-2"
              >
                Redirect Contact Tunnels
              </button>
            </div>
          </div>

          {/* Announcement Broadcasting */}
          <div className={cn(
            "rounded-2xl border p-8 shadow-sm transition-all duration-300",
            config.noticeActive ? "border-amber-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"
          )}>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                   "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                   config.noticeActive ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"
                )}>
                  <BellRing size={20} className={cn(config.noticeActive && "animate-ping-slow")} />
                </div>
                <div>
                  <h3 className={cn("font-bold", config.noticeActive ? "text-amber-900" : "text-slate-900")}>Alert Broadcasting</h3>
                  <p className="text-sm text-slate-500">Inject high-priority notices.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Reveal Alert</label>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="noticeActive" checked={config.noticeActive || false} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                 </label>
              </div>
            </div>

            <div className="space-y-4">
              <textarea 
                name="notice"
                value={config.notice || ''}
                onChange={handleChange}
                disabled={!config.noticeActive}
                className={cn(
                   "w-full min-h-[140px] rounded-xl border-2 p-4 text-sm font-semibold outline-none transition-all resize-none",
                   config.noticeActive 
                     ? "border-amber-100 bg-amber-50/50 text-amber-900 focus:border-amber-400 focus:bg-white placeholder:text-amber-300" 
                     : "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                )}
                placeholder="Write your official global dispatch here..."
              />
              <button 
                onClick={() => triggerUpdate('notice')}
                className={cn(
                   "w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition-all",
                   config.noticeActive ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-slate-600 hover:bg-slate-700" 
                )}
              >
                Transmit Push Vector
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <Modal 
        isOpen={confirmOverlay.isOpen} 
        onClose={() => setConfirmOverlay(prev => ({ ...prev, isOpen: false }))} 
        title={confirmOverlay.title}
      >
        <div className="space-y-5">
          <p className="text-slate-600 text-[15px] font-medium leading-relaxed">
            {confirmOverlay.message}
          </p>
          <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100">
             <AlertTriangle className="text-red-500" size={24} />
             <p className="text-xs text-red-600 font-bold uppercase tracking-wider">This action writes directly to production logic.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setConfirmOverlay(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Abort Upload
            </button>
            <button 
              onClick={commitUpdate}
              disabled={saving}
              className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {saving ? 'Writing...' : 'Confirm Overwrite'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
