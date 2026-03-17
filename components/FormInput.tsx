import React from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export default function FormInput({ label, error, helperText, className, ...props }: FormInputProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10",
          props.disabled && "bg-slate-50 cursor-not-allowed text-slate-500"
        )}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
