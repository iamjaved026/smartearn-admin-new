'use client';

import React from 'react';
import FormInput from '@/components/FormInput';
import { Gamepad2, Save } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function TaskControlPage() {
  const { showToast } = useUI();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tasks Control</h1>
        <p className="text-slate-500">Configure reward amounts for various in-app tasks.</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Gamepad2 size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Reward Configuration</h3>
            <p className="text-sm text-slate-500">Set the number of coins users earn per task completion.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormInput 
            label="Ad Reward" 
            type="number" 
            defaultValue="10" 
            helperText="Coins per video ad watched"
          />
          <FormInput 
            label="Spin Reward" 
            type="number" 
            defaultValue="5" 
            helperText="Average coins per lucky spin"
          />
          <FormInput 
            label="Typing Reward" 
            type="number" 
            defaultValue="2" 
            helperText="Coins per captcha/typing task"
          />
          <FormInput 
            label="Logo Match Reward" 
            type="number" 
            defaultValue="8" 
            helperText="Coins per successful logo match"
          />
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={() => showToast('Task rewards updated successfully')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
