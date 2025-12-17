
import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Agency, Scheme, InsuranceType, InsuranceSubType } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { agencyApi } from '../../services/masterDataApi/agency.api';
import { Button, Input, Select, Modal, DataTable } from '../../components/ui';
import { Plus, Search } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api.config';

const AgencySchemePage: React.FC = () => {
  const { AGENCY, SCHEME, INSURANCE_TYPE, INSURANCE_SUB_TYPE } = API_ENDPOINTS.MASTER_DATA;

  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  
  const { data: types } = useFetch<InsuranceType[]>(INSURANCE_TYPE);
  const { data: subTypes, refetch: refetchSubTypes } = useFetch<InsuranceSubType[]>(INSURANCE_SUB_TYPE);
  const { data: schemes, refetch: refetchSchemes } = useFetch<Scheme[]>(SCHEME);

  React.useEffect(() => {
    const handleSubTypesUpdate = () => refetchSubTypes();
    window.addEventListener('insuranceSubTypesUpdated', handleSubTypesUpdate);
    return () => window.removeEventListener('insuranceSubTypesUpdated', handleSubTypesUpdate);
  }, [refetchSubTypes]);

  const handleToggleAgency = async (item: Agency) => {
    const newStatus = item.status === 1 ? 0 : 1;
    try {
        await agencyApi.patchAgency(item.id!, { status: newStatus });
        
        if (schemes) {
            const childSchemes = schemes.filter(s => s.agency_id == item.id && s.status !== newStatus);
            await Promise.all(childSchemes.map(s => agencyApi.patchScheme(s.id!, { status: newStatus })));
            if (childSchemes.length > 0) {
                toast.success(`Updated Agency and ${childSchemes.length} schemes`);
                refetchSchemes();
            } else {
                toast.success(newStatus === 1 ? 'Activated' : 'Deactivated');
            }
        }
    } catch (e) {
        toast.error("Failed to update status");
    }
  };

  return (
    <MasterDataLayout title="Agency and Scheme">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
        
        {}
        <div className="md:col-span-1">
          <GenericTableCrud<Agency>
            title="Agencies"
            endpoint={AGENCY}
            columns={[{ header: 'Agency Name', accessor: 'agency_name' }]}
            fields={[{ name: 'agency_name', label: 'Agency Name', type: 'text', required: true }]}
            defaults={{ comp_id: 1001 }}
            searchKeys={['agency_name']}
            onRowClick={(item) => setSelectedAgency(item)}
            selectedId={selectedAgency?.id}
            onStatusChange={handleToggleAgency}
            compact={true} 
          />
        </div>

        {}
        <div className="md:col-span-2">
          {selectedAgency ? (
             <SchemeManager 
               selectedAgency={selectedAgency}
               types={types}
               subTypes={subTypes}
             />
          ) : (
             <div className="h-full bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                Select an Agency to manage schemes
             </div>
          )}
        </div>

      </div>
    </MasterDataLayout>
  );
};

const SchemeManager: React.FC<{
  selectedAgency: Agency;
  types: InsuranceType[] | null;
  subTypes: InsuranceSubType[] | null;
}> = ({ selectedAgency, types, subTypes }) => {
  const { SCHEME } = API_ENDPOINTS.MASTER_DATA;
  const { data: rawSchemes, refetch } = useFetch<Scheme[]>(SCHEME);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
  
  const { control, handleSubmit, reset, watch, setValue } = useForm();
  const watchedTypeId = watch('insurance_type_id');
  
  const schemes = rawSchemes?.filter(s => s.agency_id == selectedAgency.id) || [];
  
  const filteredSubTypes = subTypes?.filter(st => 
    st.status === 1 && st.insurance_type_id == watchedTypeId
  ) || [];
  
  const handleCreate = () => {
    setEditingScheme({ comp_id: 1001, agency_id: selectedAgency.id });
    reset({ comp_id: 1001, agency_id: selectedAgency.id });
    setIsModalOpen(true);
  };
  
  const handleEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    reset(scheme);
    setIsModalOpen(true);
  };
  
  const handleSave = async (data: any) => {
    try {
      if (editingScheme?.id) {
        await agencyApi.updateScheme(editingScheme.id, data);
        toast.success('Updated successfully');
      } else {
        await agencyApi.createScheme(data);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };
  
  React.useEffect(() => {
    if (watchedTypeId) {
      setValue('insurance_sub_type_id', '');
    }
  }, [watchedTypeId, setValue]);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[calc(100vh-14rem)] min-h-[400px]">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white">
          Schemes for {selectedAgency.agency_name}
        </h3>
        <Button size="sm" onClick={handleCreate} icon={<Plus size={16} />}>
          Add
        </Button>
      </div>
      
      <DataTable 
        data={schemes}
        columns={[
          { header: 'Scheme Name', accessor: 'scheme_name', className: 'font-medium' },
          { 
            header: 'Type', 
            accessor: (s) => {
              const t = types?.find(x => x.id == s.insurance_type_id);
              return t ? t.insurance_type : '-';
            } 
          }
        ]}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingScheme?.id ? 'Edit Scheme' : 'Add Scheme'}
      >
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Controller
            name="scheme_name"
            control={control}
            rules={{ required: 'Scheme name is required' }}
            render={({ field }) => (
              <Input label="Scheme Name" {...field} />
            )}
          />
          
          <Controller
            name="insurance_type_id"
            control={control}
            rules={{ required: 'Insurance type is required' }}
            render={({ field }) => (
              <Select
                label="Insurance Type"
                options={types?.filter(t => t.status === 1).map(t => ({ 
                  label: t.insurance_type, 
                  value: t.id! 
                })) || []}
                {...field}
              />
            )}
          />
          
          <Controller
            name="insurance_sub_type_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Sub-Type"
                options={filteredSubTypes.map(st => ({ 
                  label: st.insurance_sub_type, 
                  value: st.id! 
                }))}
                {...field}
                disabled={!watchedTypeId}
              />
            )}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AgencySchemePage;
