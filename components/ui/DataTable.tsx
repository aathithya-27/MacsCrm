import React from 'react';
import { Edit2, Trash2, Database } from 'lucide-react';
import { Toggle } from './Toggle';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggleStatus?: (item: T) => void;
  keyField?: keyof T; 
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  selectedId?: string | number;
}

export function DataTable<T extends { status?: number }>({ 
  data, 
  columns, 
  loading, 
  onEdit, 
  onDelete,
  onToggleStatus, 
  keyField = 'id' as keyof T,
  emptyMessage = "No records found",
  actions,
  onRowClick,
  selectedId
}: DataTableProps<T>) {
  
  const SkeletonRow = () => (
    <tr className="border-b border-slate-50 dark:border-slate-800">
      <td className="px-6 py-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      {columns.map((_, idx) => (
        <td key={idx} className="px-6 py-4">
          <Skeleton className="h-4 w-3/4" />
        </td>
      ))}
      {(onToggleStatus || onEdit || onDelete || actions) && (
         <td className="px-6 py-4"><Skeleton className="h-8 w-16 mx-auto" /></td>
      )}
    </tr>
  );

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-slate-800 rounded-b-lg border-t border-slate-200 dark:border-slate-700 relative">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-800/80 backdrop-blur text-xs font-bold text-slate-500 dark:text-slate-400 uppercase sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-3 w-12 text-center">#</th>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-3 ${col.width || ''} text-${col.align || 'left'} ${col.className || ''} tracking-wider`}>
                {col.header}
              </th>
            ))}
            {onToggleStatus && <th className="px-6 py-3 w-24 text-center tracking-wider">Status</th>}
            {(onEdit || onDelete || actions) && <th className="px-6 py-3 w-24 text-center tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 4} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                    <Database size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const isSelected = selectedId !== undefined && item[keyField] === selectedId;
              
              return (
                <tr 
                  key={String(item[keyField])} 
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`
                    transition-colors group border-l-4
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' 
                      : 'hover:bg-blue-50/50 dark:hover:bg-slate-700/30 border-transparent'}
                  `}
                >
                  <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 text-${col.align || 'left'}`}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {onToggleStatus && (
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Toggle 
                          checked={item.status === 1} 
                          onChange={() => onToggleStatus(item)} 
                          size="sm"
                        />
                      </div>
                    </td>
                  )}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEdit(item)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit2 size={14} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onDelete(item)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                        {actions && actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}