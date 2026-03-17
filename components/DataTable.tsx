import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  selectedId?: string | number;
  compact?: boolean;
}

export default function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  title,
  className,
  onRowClick,
  selectedId,
  compact = false
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {title && (
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column, idx) => (
                <th key={idx} className={cn(compact ? "px-4 py-2" : "px-6 py-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50/50 transition-all cursor-pointer relative",
                  selectedId === item.id && "bg-blue-50/50"
                )}
              >
                {columns.map((column, idx) => (
                  <td 
                    key={idx} 
                    className={cn(
                      compact ? "px-4 py-2.5" : "px-6 py-4", 
                      "text-slate-600", 
                      column.className,
                      selectedId === item.id && idx === 0 && "border-l-4 border-blue-500",
                      selectedId === item.id && idx === columns.length - 1 && "border-r-4 border-blue-500"
                    )}
                  >
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
