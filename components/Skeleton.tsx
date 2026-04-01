import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonBanner({ className }: { className?: string }) {
  return (
     <div className={cn("animate-pulse rounded-2xl bg-slate-200", className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4", className)}>
       <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 rounded-lg bg-slate-200"></div>
            <div className="h-3 w-1/4 rounded-lg bg-slate-100"></div>
          </div>
       </div>
       <div className="space-y-2 pt-2">
         <div className="h-8 w-1/2 rounded-lg bg-slate-200"></div>
       </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: { rows?: number, className?: string }) {
  return (
    <div className={cn("animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
         <div className="h-5 w-48 rounded-lg bg-slate-300"></div>
         <div className="h-4 w-24 rounded-lg bg-slate-200"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex px-6 py-4 gap-6">
            <div className="h-4 w-1/4 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-1/3 rounded-lg bg-slate-100"></div>
            <div className="h-4 w-24 rounded-lg bg-slate-200 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
     <div className={cn("animate-pulse rounded-2xl bg-white border border-slate-200 shadow-sm p-8", className)}>
         <div className="space-y-4">
            <div className="h-6 w-1/4 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-1/2 bg-slate-100 rounded-lg"></div>
            <div className="pt-6 space-y-3">
               <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
               <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
               <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
            </div>
         </div>
     </div>
  );
}
