import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input, Modal, DataTable } from '../ui';
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
  emptyMessage
}: GenericTableCrudProps<T>) {
  const { data: rawData, loading, refetch, setData } = useFetch<T[]>(endpoint);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<T> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [saving, setSaving] = useState(false);

  const api = useMemo(() => createGenericApi<T>(endpoint), [endpoint]);

  const data = useMemo(() => {
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
        await api.update(editingItem.id, { ...editingItem, ...payload });
        toast.success('Updated successfully');
      } else {
        await api.create({ ...defaults, ...payload });
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      refetch();
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
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center gap-4">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">{title}</h3>
        <div className="flex gap-3">
          {searchKeys.length > 0 && (
            <div className="relative w-64">
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
        data={data}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onRowClick={onRowClick}
        selectedId={selectedId}
        emptyMessage={emptyMessage}
      />

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