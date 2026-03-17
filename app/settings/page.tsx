'use client';

import React from 'react';
import FormInput from '@/components/FormInput';
import { Settings, Save, BellRing } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function SettingsPage() {
  const { showToast } = useUI();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Application Settings</h1>
        <p className="text-slate-500">Configure global application parameters and announcements.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">General Configuration</h3>
              <p className="text-sm text-slate-500">Core system values and conversion rates.</p>
            </div>
          </div>

          <div className="space-y-6">
            <FormInput 
              label="Minimum Withdraw Amount" 
              type="number" 
              defaultValue="100" 
              placeholder="e.g. 100"
              helperText="Minimum INR required to request a withdrawal"
            />
            <FormInput 
              label="Coin to INR Conversion Rate" 
              type="number" 
              defaultValue="100" 
              placeholder="e.g. 100"
              helperText="How many coins equal 1 INR"
            />
            <FormInput 
              label="Referral Reward Amount" 
              type="number" 
              defaultValue="50" 
              placeholder="e.g. 50"
              helperText="Coins given to inviter for each successful referral"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
                Announcement Message
              </label>
              <textarea 
                className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="Enter message to display in the app..."
                defaultValue="Welcome to Smart Earn! We have updated our referral rewards. Invite more friends to earn more coins!"
              />
              <p className="text-xs text-slate-400">This message will appear on the user&apos;s home screen.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => showToast('Application settings saved successfully')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Save size={18} />
          Save All Settings
        </button>
      </div>
    </div>
  );
}
