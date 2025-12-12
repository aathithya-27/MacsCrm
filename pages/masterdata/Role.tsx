import React, { useState, useMemo } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { roleApi } from '../../services/masterDataApi/role.api';
import { Role } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { useMasterCrud } from '../../hooks/useMasterCrud';
import { DataTable, Button, Input, Modal, Toggle } from '../../components/ui';
import { SmartForm } from '../../components/generic/SmartForm';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const RolePage: React.FC = () => {
  const { data: roles, loading, refetch, setData } = useFetch<Role[]>('/roles');
  const [searchQuery, setSearchQuery] = useState('');

  const crud = useMasterCrud<Role>({
    api: roleApi,
    refetch,
    updateLocalData: setData,
    defaults: { comp_id: 1001, is_advisor_role: 0 },
    validate: (item) => !item.role_desc ? "Role Name required" : null
  });

  const filteredData = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery) return roles;
    return roles.filter(r => r.role_desc.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [roles, searchQuery]);

  const handleToggleAdvisor = async (item: Role) => {
    const newVal = item.is_advisor_role === 1 ? 0 : 1;
    // Optimistic Update
    setData(prev => prev?.map(r => r.id === item.id ? { ...r, is_advisor_role: newVal } : r) || []);
    
    try {
      await roleApi.patch(item.id!, { is_advisor_role: newVal });
      toast.success(`Advisor role ${newVal ? 'enabled' : 'disabled'}`);
    } catch (e) {
      toast.error("Failed to update advisor status");
      refetch();
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Transform boolean back to number
    const payload = {
        ...data,
        is_advisor_role: data.is_advisor_role ? 1 : 0
    };
    
    try {
        if (crud.currentItem.id) {
            await roleApi.update(crud.currentItem.id, { ...crud.currentItem, ...payload });
            toast.success("Updated successfully");
        } else {
            await roleApi.create({ ...crud.defaults, ...payload });
            toast.success("Created successfully");
        }
        crud.handleCloseModal();
        refetch();
    } catch (e: any) {
        toast.error(e.message || "Operation failed");
    }
  };

  return (
    <MasterDataLayout title="Manage Roles">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[calc(100vh-12rem)]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">Role List</h3>
          <div className="flex gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  className="pl-9 h-9" 
                  placeholder="Search roles..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
             </div>
             <Button size="sm" onClick={() => crud.handleOpenModal()} icon={<Plus size={16} />}>Add</Button>
          </div>
        </div>

        {/* Table */}
        <DataTable 
          data={filteredData}
          columns={[
            { header: 'Name', accessor: 'role_desc', className: 'font-medium' },
            { 
               header: 'Is Advisor?', 
               accessor: (item) => (
                  <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                      <Toggle 
                          checked={item.is_advisor_role === 1} 
                          onChange={() => handleToggleAdvisor(item)}
                      />
                  </div>
               ),
               align: 'center',
               width: 'w-32'
            }
          ]}
          loading={loading}
          onEdit={crud.handleOpenModal}
          onToggleStatus={crud.handleToggleStatus}
        />
      </div>

      <Modal 
        isOpen={crud.isModalOpen} 
        onClose={crud.handleCloseModal} 
        title={crud.currentItem.id ? 'Edit Role' : 'Add Role'}
      >
        <SmartForm
          fields={[
             { name: 'role_desc', label: 'Role Name', type: 'text', required: true },
             { name: 'is_advisor_role', label: 'Is Advisor Role?', type: 'toggle' }
          ]}
          defaultValues={{
              ...crud.currentItem,
              // Convert number to boolean for the form
              is_advisor_role: crud.currentItem.is_advisor_role === 1
          }}
          onSubmit={handleFormSubmit}
          onCancel={crud.handleCloseModal}
        />
      </Modal>
    </MasterDataLayout>
  );
};

export default RolePage;