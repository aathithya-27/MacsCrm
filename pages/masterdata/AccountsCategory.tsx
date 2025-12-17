
import React, { useMemo } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { AccountCategory, AccountSubCategory, AccountHead } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { accountsCategoryApi } from '../../services/masterDataApi/accountsCategory.api';
import { DataTable, Button, Modal, Input, Select, Toggle } from '../../components/ui';
import { useMasterCrud } from '../../hooks/useMasterCrud';
import { Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api.config';

const AccountsCategoryPage: React.FC = () => {
  const { ACCOUNT_CATEGORY, ACCOUNT_SUB_CATEGORY, ACCOUNT_HEAD } = API_ENDPOINTS.MASTER_DATA;

  const { data: categories } = useFetch<AccountCategory[]>(ACCOUNT_CATEGORY);
  const { data: subCategories } = useFetch<AccountSubCategory[]>(ACCOUNT_SUB_CATEGORY);
  
  const { data: heads, loading: loadingHeads, refetch: refetchHeads, setData: setHeads } = useFetch<AccountHead[]>(ACCOUNT_HEAD);
  
  const headCrud = useMasterCrud<AccountHead>({
    api: { 
        create: accountsCategoryApi.createHead, 
        update: accountsCategoryApi.updateHead, 
        patch: accountsCategoryApi.patchHead 
    },
    refetch: refetchHeads,
    updateLocalData: setHeads,
    validate: (item) => !item.head_name ? "Head Name is required" : (!item.sub_category_id ? "Sub-Category is required" : null),
    defaults: { comp_id: 1001, posting_bank: false, is_cash: false, status: 1 }
  });

  const handleHeadToggleChange = (field: 'posting_bank' | 'is_cash', value: boolean) => {
      headCrud.setCurrentItem(prev => ({
          ...prev,
          [field]: value,
          ...(value ? { [field === 'posting_bank' ? 'is_cash' : 'posting_bank']: false } : {})
      }));
  };

  const activeCategories = categories?.filter(c => c.status === 1) || [];
  const activeSubCategories = subCategories?.filter(s => s.status === 1) || [];

  return (
    <MasterDataLayout title="Account's Category Management">
      <div className="flex flex-col gap-8 pb-10">
        
        {}
        <GenericTableCrud<AccountCategory>
          title="Manage Account Categories"
          endpoint={ACCOUNT_CATEGORY}
          columns={[{ header: 'Name', accessor: 'category_name' }]}
          fields={[{ name: 'category_name', label: 'Category Name', type: 'text', required: true }]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['category_name']}
          compact={true}
        />

        {}
        <GenericTableCrud<AccountSubCategory>
          title="Manage Account Sub-Categories"
          endpoint={ACCOUNT_SUB_CATEGORY}
          columns={[
              { header: 'Name', accessor: 'sub_category_name' },
              { header: 'Category', accessor: (row) => categories?.find(c => c.id == row.category_id)?.category_name || '-' }
          ]}
          fields={[
              { 
                  name: 'category_id', 
                  label: 'Parent Category', 
                  type: 'select', 
                  required: true, 
                  options: activeCategories.map(c => ({ label: c.category_name, value: c.id! }))
              },
              { name: 'sub_category_name', label: 'SubCategory Name', type: 'text', required: true }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['sub_category_name']}
          compact={true}
        />

        {}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800 rounded-t-lg">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">Manage Account Heads</h3>
                <Button size="sm" onClick={() => headCrud.handleOpenModal()} icon={<Plus size={16} />}>Add Head</Button>
            </div>
            
            <DataTable 
                data={heads || []}
                loading={loadingHeads}
                columns={[
                    { header: 'Name', accessor: 'head_name', className: 'font-medium' },
                    { header: 'Sub-Category', accessor: (h) => subCategories?.find(s => s.id == h.sub_category_id)?.sub_category_name || '-' },
                    { header: 'Posting Bank', accessor: (h) => <Toggle checked={!!h.posting_bank} disabled size="sm" onChange={()=>{}} />, align: 'center' },
                    { header: 'Is Cash', accessor: (h) => <Toggle checked={!!h.is_cash} disabled size="sm" onChange={()=>{}} />, align: 'center' },
                ]}
                onEdit={headCrud.handleOpenModal}
                onToggleStatus={headCrud.handleToggleStatus}
                emptyMessage="No account heads found"
            />
        </div>

      </div>

      {}
      <Modal 
         isOpen={headCrud.isModalOpen} 
         onClose={headCrud.handleCloseModal} 
         title={headCrud.currentItem.id ? 'Edit Account Head' : 'Add Account Head'}
         footer={
             <>
                 <Button variant="secondary" onClick={headCrud.handleCloseModal}>Cancel</Button>
                 <Button variant="success" onClick={headCrud.handleSave} isLoading={headCrud.saving}>Save</Button>
             </>
         }
      >
          <div className="space-y-4">
              <Select 
                  label="Parent Sub-Category"
                  options={activeSubCategories.map(s => ({ label: s.sub_category_name, value: s.id! }))}
                  value={headCrud.currentItem.sub_category_id || ''}
                  onChange={e => headCrud.setCurrentItem(prev => ({ ...prev, sub_category_id: e.target.value }))}
              />
              <Input 
                  label="Head Name"
                  value={headCrud.currentItem.head_name || ''}
                  onChange={e => headCrud.setCurrentItem(prev => ({ ...prev, head_name: e.target.value }))}
              />
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Posting Bank</span>
                      <Toggle checked={!!headCrud.currentItem.posting_bank} onChange={(v) => handleHeadToggleChange('posting_bank', v)} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Is Cash</span>
                      <Toggle checked={!!headCrud.currentItem.is_cash} onChange={(v) => handleHeadToggleChange('is_cash', v)} />
                  </div>
              </div>
          </div>
      </Modal>

    </MasterDataLayout>
  );
};

export default AccountsCategoryPage;
