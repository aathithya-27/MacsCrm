import React, { useState, useMemo, useEffect } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { branchApi } from '../../services/masterDataApi/branch.api';
import { Branch, Country, State, District, City, Area } from '../../types';
import { Plus } from 'lucide-react';
import { Button, Input, Select, Modal, DataTable, Toggle } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { useMasterCrud } from '../../hooks/useMasterCrud';

const BranchPage: React.FC = () => {
  const { data: branches, loading: loadingBranches, refetch: refetchBranches, setData: setBranches } = useFetch<Branch[]>('/branches');
  const { data: countries } = useFetch<Country[]>('/countries');
  const { data: states } = useFetch<State[]>('/states');
  const { data: districts } = useFetch<District[]>('/districts');
  const { data: cities } = useFetch<City[]>('/cities');
  const { data: areas } = useFetch<Area[]>('/areas');

  const [searchQuery, setSearchQuery] = useState('');
  const [idSuffix, setIdSuffix] = useState('');

  // Engine Hook
  const crud = useMasterCrud<Branch>({
    api: branchApi,
    refetch: refetchBranches,
    updateLocalData: setBranches,
    validate: (item) => !item.branch_name ? "Branch Name required" : null,
    defaults: { status: 1, comp_id: 1001 }
  });

  // Effect: Sync ID generation when editing/creating
  useEffect(() => {
    if (crud.isModalOpen && !crud.currentItem.id && idSuffix) {
       crud.setCurrentItem(prev => ({ ...prev, branch_id: `FIN01-${idSuffix.toUpperCase()}` }));
    } else if (crud.isModalOpen && crud.currentItem.id) {
       // Extract suffix when opening edit
       const parts = String(crud.currentItem.branch_id || '').split('-');
       if (parts.length > 1 && parts[1] !== idSuffix) setIdSuffix(parts[1]);
    } else if (!crud.isModalOpen) {
       setIdSuffix('');
    }
  }, [idSuffix, crud.isModalOpen, crud.currentItem.id]);

  // Derived State for Cascading Dropdowns - Only show Active Status
  const current = crud.currentItem;
  const filteredStates = useMemo(() => states?.filter(s => s.country_id == current.country_id && s.status === 1) || [], [states, current.country_id]);
  const filteredDistricts = useMemo(() => districts?.filter(d => d.state_id == current.state_id && d.status === 1) || [], [districts, current.state_id]);
  const filteredCities = useMemo(() => cities?.filter(c => c.district_id == (current as any).district_id && c.status === 1) || [], [cities, (current as any).district_id]);
  const filteredAreas = useMemo(() => areas?.filter(a => a.city_id == current.city_id && a.status === 1) || [], [areas, current.city_id]);
  
  const filteredData = useMemo(() => {
    if (!branches) return [];
    return branches.filter(b => 
      b.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(b.branch_id).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, searchQuery]);

  // Inject Location Names before saving
  const handleSaveWithLocationNames = async () => {
      const countryObj = countries?.find(c => c.id == current.country_id);
      const cityObj = cities?.find(c => c.id == current.city_id);
      const stateObj = states?.find(s => s.id == current.state_id);
      
      crud.setCurrentItem(prev => ({ 
          ...prev, 
          country: countryObj?.country_name,
          city: cityObj?.city, 
          state: stateObj?.state 
      }));
      
      // Small delay to allow state update before save
      setTimeout(crud.handleSave, 0); 
  };

  return (
    <MasterDataLayout title="Manage Branch">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-12rem)]">
        {/* Search Bar matching design */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
          <Input 
            className="flex-1 w-full"
            placeholder="Search Branches by Name or ID..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          <Button onClick={() => crud.handleOpenModal()} icon={<Plus size={16}/>}>Add New Branch</Button>
        </div>

        <DataTable 
          data={filteredData}
          columns={[
            { header: 'Branch ID', accessor: 'branch_id', width: 'w-40', className: 'font-mono text-sm' },
            { header: 'Branch Name', accessor: 'branch_name', className: 'font-medium' },
          ]}
          loading={loadingBranches}
          onEdit={crud.handleOpenModal}
          onToggleStatus={crud.handleToggleStatus}
        />
      </div>

      <Modal 
        isOpen={crud.isModalOpen} onClose={crud.handleCloseModal} 
        title={crud.currentItem.id ? 'Edit Branch' : 'Add Branch'}
        size="lg"
        footer={<><Button variant="secondary" onClick={crud.handleCloseModal}>Cancel</Button><Button variant="success" onClick={handleSaveWithLocationNames} isLoading={crud.saving}>Save</Button></>}
      >
        <div className="space-y-6">
          
          {/* Section 1: Branch Details */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
             <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Branch Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch ID *</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center">FIN01</span>
                    <Input value={idSuffix} onChange={e => setIdSuffix(e.target.value)} placeholder="e.g. CBE" disabled={!!crud.currentItem.id} className="uppercase" />
                  </div>
                </div>
                <Input label="Branch Name" value={crud.currentItem.branch_name || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, branch_name: e.target.value})} />
                
                <Input label="Date of Creation" type="date" value={crud.currentItem.date_of_creation || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, date_of_creation: e.target.value})} />
                <div className="flex items-end pb-2">
                   <Toggle checked={crud.currentItem.status === 1} onChange={(v) => crud.setCurrentItem({...crud.currentItem, status: v ? 1 : 0})} label="Active" />
                </div>
             </div>
          </div>

          {/* Section 2: Address Details */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
             <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Address Details</h4>
             <div className="space-y-4">
                <Input label="Line 1" value={crud.currentItem.address_1 || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, address_1: e.target.value})} />
                <Input label="Line 2" value={crud.currentItem.address_2 || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, address_2: e.target.value})} />
                <Input label="Line 3" value={crud.currentItem.address_3 || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, address_3: e.target.value})} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Select 
                        label="Country" 
                        options={countries?.filter(c => c.status === 1).map(c => ({label: c.country_name, value: c.id!})) || []} 
                        value={crud.currentItem.country_id || ''} 
                        onChange={e => crud.setCurrentItem({
                            ...crud.currentItem, 
                            country_id: e.target.value, 
                            state_id: undefined, 
                            district_id: undefined, 
                            city_id: undefined, 
                            area_id: undefined
                        })} 
                   />
                   <Select label="State" options={filteredStates.map(s => ({label: s.state, value: s.id!}))} value={crud.currentItem.state_id || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, state_id: e.target.value, district_id: undefined, city_id: undefined, area_id: undefined})} disabled={!crud.currentItem.country_id} />
                   <Select label="District" options={filteredDistricts.map(d => ({label: d.district_name, value: d.id!}))} value={(crud.currentItem as any).district_id || ''} onChange={(e) => { const d = districts?.find(x => x.id == e.target.value); crud.setCurrentItem({...crud.currentItem, district: d?.district_name, city_id: undefined, area_id: undefined, ...{ district_id: e.target.value } }); }} disabled={!crud.currentItem.state_id} />
                   <Select label="City" options={filteredCities.map(c => ({label: c.city, value: c.id!}))} value={crud.currentItem.city_id || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, city_id: e.target.value, area_id: undefined})} disabled={!(crud.currentItem as any).district_id} />
                </div>
                
                <Input label="Area" value={crud.currentItem.area || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, area: e.target.value})} />
                <Input label="Pin Code" value={crud.currentItem.pincode || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, pincode: e.target.value})} maxLength={6} />
                <Input label="Phone No." value={crud.currentItem.phone_no || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, phone_no: e.target.value})} />
                <Input label="FAX No." value={crud.currentItem.fax_no || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, fax_no: e.target.value})} />
             </div>
          </div>

          {/* Section 3: Tax Info */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
             <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tax Info</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="GSTIN" value={crud.currentItem.gst_no || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, gst_no: e.target.value})} />
                <Input label="PAN" value={crud.currentItem.pan_no || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, pan_no: e.target.value})} />
                <Input label="TAN" value={crud.currentItem.tan_no || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, tan_no: e.target.value})} />
             </div>
          </div>
        </div>
      </Modal>
    </MasterDataLayout>
  );
};

export default BranchPage;