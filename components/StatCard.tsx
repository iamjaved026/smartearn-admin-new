import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
};

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorMap[color])}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.isUp ? '+' : '-'}{trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
