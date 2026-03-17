'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-2xl border p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300",
      type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
    )}>
      {type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-rose-500" />}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 rounded-lg p-1 hover:bg-black/5 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}
