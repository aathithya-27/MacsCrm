
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../ui';
import { Pagination } from '../ui/Pagination';
import { SmartForm, FormField } from './SmartForm';
import { useFetch } from '../../hooks/useFetch';
import { createGenericApi } from '../../services/genericApi';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface GenericTableCrudProps<T> {
  title: string;
  endpoint: string;
  columns: ColumnDef<T>[];
  fields: FormField[];
  defaults?: Partial<T>;
  searchKeys?: (keyof T)[];
  transformRawData?: (data: T[]) => T[];
  onStatusChange?: (item: T) => void;
  disableAdd?: boolean;
  onSaveTransform?: (data: any) => any;
  onRowClick?: (item: T) => void;
  selectedId?: number | string;
  emptyMessage?: string;
  enablePagination?: boolean;
  compact?: boolean; // New prop for narrow layouts
}

export function GenericTableCrud<T extends { id?: number | string; status?: number }>({
  title,
  endpoint,
  columns,
  fields,
  defaults = {},
  searchKeys = [],
  transformRawData,
  onStatusChange,
  disableAdd = false,
  onSaveTransform,
  onRowClick,
  selectedId,
  emptyMessage,
  enablePagination = true,
  compact = false
}: GenericTableCrudProps<T>) {
  // Use SWR by providing a cacheKey
  const { data: rawData, loading, isRefetching, refetch, setData } = useFetch<T[]>(endpoint, { 
    cacheKey: endpoint 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<T> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [saving, setSaving] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const api = useMemo(() => createGenericApi<T>(endpoint), [endpoint]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let d = rawData || [];
    if (transformRawData) d = transformRawData(d);
    
    if (!debouncedSearch || searchKeys.length === 0) return d;
    
    const lowerQuery = debouncedSearch.toLowerCase();
    return d.filter(item => 
      searchKeys.some(key => {
        const val = item[key];
        return String(val).toLowerCase().includes(lowerQuery);
      })
    );
  }, [rawData, transformRawData, debouncedSearch, searchKeys]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage, enablePagination]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleCreate = () => {
    setEditingItem({ status: 1, ...defaults } as Partial<T>);
    setIsModalOpen(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    try {
      let payload = { ...formData };
      if (onSaveTransform) {
        payload = onSaveTransform(payload);
      }

      if (editingItem?.id) {
        // Optimistic update handled via re-fetch logic usually, but here we wait for server
        await api.update(editingItem.id, { ...editingItem, ...payload });
        toast.success('Updated successfully');
      } else {
        await api.create({ ...defaults, ...payload });
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      refetch(); // This will update the SWR cache
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: T) => {
    if (onStatusChange) {
      onStatusChange(item);
      return;
    }
    
    // Optimistic Update
    const oldStatus = item.status;
    const newStatus = oldStatus === 1 ? 0 : 1;
    setData(prev => prev?.map(i => i.id === item.id ? { ...i, status: newStatus } : i) || []);
    
    try {
      await api.patch(item.id!, { status: newStatus } as any);
      toast.success(newStatus === 1 ? 'Activated' : 'Deactivated');
    } catch (error) {
      toast.error('Failed to update status');
      // Rollback
      setData(prev => prev?.map(i => i.id === item.id ? { ...i, status: oldStatus } : i) || []);
      refetch();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[calc(100vh-14rem)] min-h-[400px]">
      <div className={`p-4 border-b border-gray-200 dark:border-slate-700 flex ${compact ? 'flex-col items-start gap-3' : 'flex-col sm:flex-row justify-between items-center gap-4'}`}>
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {title}
          {isRefetching && <RefreshCw size={14} className="animate-spin text-slate-400" />}
        </h3>
        <div className={`flex gap-3 w-full ${compact ? '' : 'sm:w-auto'}`}>
          {searchKeys.length > 0 && (
            <div className={`relative flex-1 ${compact ? 'w-full' : 'sm:w-64'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                className="pl-9 h-9" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
          )}
          {!disableAdd && (
            <Button size="sm" onClick={handleCreate} icon={<Plus size={16} />}>Add</Button>
          )}
        </div>
      </div>
      
      <DataTable 
        data={paginatedData}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onRowClick={onRowClick}
        selectedId={selectedId}
        emptyMessage={emptyMessage}
      />

      {enablePagination && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem?.id ? `Edit ${title}` : `Add ${title}`}
      >
        <SmartForm 
          fields={fields}
          defaultValues={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={saving}
        />
      </Modal>
    </div>
  );
}
