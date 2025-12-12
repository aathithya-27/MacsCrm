
import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Agency, Scheme, InsuranceType, InsuranceSubType } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { agencyApi } from '../../services/masterDataApi/agency.api';
import toast from 'react-hot-toast';

const AgencySchemePage: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  
  // Fetch dependencies for Scheme dropdowns
  const { data: types } = useFetch<InsuranceType[]>('/insuranceTypes');
  const { data: subTypes } = useFetch<InsuranceSubType[]>('/insuranceSubTypes');
  const { data: schemes, refetch: refetchSchemes } = useFetch<Scheme[]>('/schemes');

  // Custom Cascade Status Logic
  const handleToggleAgency = async (item: Agency) => {
    const newStatus = item.status === 1 ? 0 : 1;
    try {
        await agencyApi.patchAgency(item.id!, { status: newStatus });
        
        // Cascade to Schemes
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
        
        {/* Left: Agencies List */}
        <div className="md:col-span-1">
          <GenericTableCrud<Agency>
            title="Agencies"
            endpoint="/agencies"
            columns={[{ header: 'Agency Name', accessor: 'agency_name' }]}
            fields={[{ name: 'agency_name', label: 'Agency Name', type: 'text', required: true }]}
            defaults={{ comp_id: 1001 }}
            searchKeys={['agency_name']}
            onRowClick={(item) => setSelectedAgency(item)}
            selectedId={selectedAgency?.id}
            onStatusChange={handleToggleAgency}
          />
        </div>

        {/* Right: Schemes List (Filtered) */}
        <div className="md:col-span-2">
          {selectedAgency ? (
             <div className="contents" key={selectedAgency.id}>
                <GenericTableCrud<Scheme>
                    title={`Schemes for ${selectedAgency.agency_name}`}
                    endpoint="/schemes"
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
                    fields={[
                        { name: 'scheme_name', label: 'Scheme Name', type: 'text', required: true },
                        { 
                            name: 'insurance_type_id', 
                            label: 'Insurance Type', 
                            type: 'select', 
                            required: true,
                            options: types?.filter(t => t.status === 1).map(t => ({ label: t.insurance_type, value: t.id! })) || []
                        },
                        { 
                            name: 'insurance_sub_type_id', 
                            label: 'Sub-Type', 
                            type: 'select', 
                            options: subTypes?.filter(st => st.status === 1).map(st => ({ label: st.insurance_sub_type, value: st.id! })) || []
                        }
                    ]}
                    defaults={{ comp_id: 1001, agency_id: selectedAgency.id }}
                    transformRawData={(data) => data.filter(s => s.agency_id == selectedAgency.id)}
                    searchKeys={['scheme_name']}
                 />
             </div>
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

export default AgencySchemePage;
