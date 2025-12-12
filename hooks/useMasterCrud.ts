
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { DEFAULTS } from '../constants';

interface UseMasterCrudConfig<T> {
  api: {
    create: (data: T) => Promise<any>;
    update: (id: number | string, data: T) => Promise<any>;
    patch?: (id: number | string, data: Partial<T>) => Promise<any>;
  };
  refetch: () => void;
  validate?: (item: Partial<T>) => string | null;
  initialState?: Partial<T>;
  successMessage?: string;
  updateLocalData?: React.Dispatch<React.SetStateAction<T[] | null>>;
  defaults?: Partial<T>;
}

export function useMasterCrud<T extends { id?: number | string; status?: number }>({
  api,
  refetch,
  validate,
  initialState = {},
  successMessage = 'Saved successfully',
  updateLocalData,
  defaults = {}
}: UseMasterCrudConfig<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<T>>({});
  const [saving, setSaving] = useState(false);

  const handleOpenModal = (item?: T) => {
    if (item) {
      setCurrentItem({ ...item });
    } else {
      setCurrentItem({ 
        status: DEFAULTS.STATUS_ACTIVE, 
        comp_id: DEFAULTS.COMP_ID, 
        client_id: DEFAULTS.CLIENT_ID,
        ...defaults,
        ...initialState 
      } as unknown as Partial<T>);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem({});
  };

  const handleSave = async () => {
    if (validate) {
      const error = validate(currentItem);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setSaving(true);
    try {
      if (currentItem.id) {
        await api.update(currentItem.id, currentItem as T);
      } else {
        await api.create(currentItem as T);
      }
      toast.success(successMessage);
      handleCloseModal();
      refetch();
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: T) => {
    if (!api.patch) return;
    const newStatus = item.status === 1 ? 0 : 1;
    
    // Optimistic UI update to make the app feel snappier
    if (updateLocalData) {
        updateLocalData((prev) => prev?.map((i) => i.id === item.id ? { ...i, status: newStatus } : i) || []);
    }

    try {
      await api.patch(item.id!, { status: newStatus } as unknown as Partial<T>);
      toast.success(newStatus === 1 ? 'Activated' : 'Deactivated');
    } catch (error) {
      toast.error('Failed to update status');
      refetch(); // Revert on failure
    }
  };

  return {
    isModalOpen,
    currentItem,
    setCurrentItem,
    saving,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleToggleStatus,
    defaults
  };
}
