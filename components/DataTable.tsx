import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  selectedId?: string | number;
  compact?: boolean;
  pagination?: PaginationProps;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  title,
  className,
  onRowClick,
  selectedId,
  compact = false,
  pagination,
  isLoading = false
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-w-0 w-full", className)}>
      {title && (
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column, idx) => (
                <th key={idx} className={cn("whitespace-nowrap", compact ? "px-4 py-3" : "px-6 py-4", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, idx) => (
                 <tr key={`skeleton-${idx}`}>
                   {columns.map((_, i) => (
                      <td key={i} className={cn("whitespace-nowrap", compact ? "px-4 py-3" : "px-6 py-4")}>
                         <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100"></div>
                      </td>
                   ))}
                 </tr>
               ))
            ) : data.length === 0 ? (
               <tr>
                 <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                    No records found.
                 </td>
               </tr>
            ) : (
                data.map((item, idx) => (
                  <tr 
                    key={`${item.id}-${idx}`} 
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
                          "whitespace-nowrap",
                          compact ? "px-4 py-3" : "px-6 py-4", 
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
                ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{pagination.totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="font-semibold text-slate-900">{pagination.totalItems}</span> total
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}</span>
            <button 
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
