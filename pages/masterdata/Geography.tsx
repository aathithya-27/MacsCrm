import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { geographyApi } from '../../services/masterDataApi/geography.api';
import { Country, State, District, City, Area } from '../../types';
import { Plus } from 'lucide-react';
import { Button, Input, Select, Modal, DataTable } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { useMasterCrud } from '../../hooks/useMasterCrud';
import toast from 'react-hot-toast';

const GeographyPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: countries, refetch: refetchC, setData: setC } = useFetch<Country[]>('/countries');
  const { data: states, refetch: refetchS, setData: setS } = useFetch<State[]>('/states');
  const { data: districts, refetch: refetchD, setData: setD } = useFetch<District[]>('/districts');
  const { data: cities, refetch: refetchCt, setData: setCt } = useFetch<City[]>('/cities');
  const { data: areas, refetch: refetchA, setData: setA } = useFetch<Area[]>('/areas');

  const cCrud = useMasterCrud({ api: { create: geographyApi.createCountry, update: geographyApi.updateCountry, patch: geographyApi.patchCountry }, refetch: refetchC, updateLocalData: setC, validate: i => !i.country_name ? "Name required" : null });
  const sCrud = useMasterCrud({ api: { create: geographyApi.createState, update: geographyApi.updateState, patch: geographyApi.patchState }, refetch: refetchS, updateLocalData: setS, validate: i => !i.state ? "Name required" : null });
  const dCrud = useMasterCrud({ api: { create: geographyApi.createDistrict, update: geographyApi.updateDistrict, patch: geographyApi.patchDistrict }, refetch: refetchD, updateLocalData: setD, validate: i => !i.district_name ? "Name required" : null });
  const ctCrud = useMasterCrud({ api: { create: geographyApi.createCity, update: geographyApi.updateCity, patch: geographyApi.patchCity }, refetch: refetchCt, updateLocalData: setCt, validate: i => !i.city ? "Name required" : null });
  const aCrud = useMasterCrud({ api: { create: geographyApi.createArea, update: geographyApi.updateArea, patch: geographyApi.patchArea }, refetch: refetchA, updateLocalData: setA, validate: i => !i.area ? "Name required" : null });

  const filter = (name?: string) => !searchQuery || (name || '').toLowerCase().includes(searchQuery.toLowerCase());

  // Cascading Logic - Handles both Deactivation and Activation
  const handleToggleCountry = async (item: Country) => {
    const newStatus = item.status === 1 ? 0 : 1;
    setC(prev => prev?.map(x => x.id === item.id ? {...x, status: newStatus} : x) || []);
    
    const promises: Promise<any>[] = [geographyApi.patchCountry(item.id!, { status: newStatus })];

    // Find States
    const childStates = states?.filter(s => s.country_id == item.id) || [];
    const statesToUpdate = childStates.filter(s => s.status !== newStatus);
    
    if (statesToUpdate.length > 0) {
        setS(prev => prev?.map(x => x.country_id == item.id ? {...x, status: newStatus} : x) || []);
        statesToUpdate.forEach(s => {
            promises.push(geographyApi.patchState(s.id!, { status: newStatus }));
            
            // Find Districts
            const childDistricts = districts?.filter(d => d.state_id == s.id) || [];
            const districtsToUpdate = childDistricts.filter(d => d.status !== newStatus);
            
            if (districtsToUpdate.length > 0) {
                setD(prev => prev?.map(x => x.state_id == s.id ? {...x, status: newStatus} : x) || []);
                districtsToUpdate.forEach(d => {
                    promises.push(geographyApi.patchDistrict(d.id!, { status: newStatus }));

                    // Find Cities
                    const childCities = cities?.filter(c => c.district_id == d.id) || [];
                    const citiesToUpdate = childCities.filter(c => c.status !== newStatus);

                    if (citiesToUpdate.length > 0) {
                        setCt(prev => prev?.map(x => x.district_id == d.id ? {...x, status: newStatus} : x) || []);
                        citiesToUpdate.forEach(c => {
                            promises.push(geographyApi.patchCity(c.id!, { status: newStatus }));

                            // Find Areas
                            const childAreas = areas?.filter(a => a.city_id == c.id) || [];
                            const areasToUpdate = childAreas.filter(a => a.status !== newStatus);
                            
                            if (areasToUpdate.length > 0) {
                                setA(prev => prev?.map(x => x.city_id == c.id ? {...x, status: newStatus} : x) || []);
                                areasToUpdate.forEach(a => {
                                    promises.push(geographyApi.patchArea(a.id!, { status: newStatus }));
                                });
                            }
                        });
                    }
                });
            }
        });
        toast.success(newStatus === 1 ? "Activated Country and descendants" : "Deactivated Country and descendants");
    } else {
        toast.success(newStatus === 1 ? "Activated Country" : "Deactivated Country");
    }

    try { await Promise.all(promises); } catch { refetchC(); toast.error("Error updating"); }
  };

  const handleToggleState = async (item: State) => {
      const newStatus = item.status === 1 ? 0 : 1;
      setS(prev => prev?.map(x => x.id === item.id ? {...x, status: newStatus} : x) || []);
      const promises: Promise<any>[] = [geographyApi.patchState(item.id!, { status: newStatus })];

      const childDistricts = districts?.filter(d => d.state_id == item.id) || [];
      const districtsToUpdate = childDistricts.filter(d => d.status !== newStatus);

      if (districtsToUpdate.length > 0) {
          setD(prev => prev?.map(x => x.state_id == item.id ? {...x, status: newStatus} : x) || []);
          districtsToUpdate.forEach(d => {
              promises.push(geographyApi.patchDistrict(d.id!, { status: newStatus }));
              
              const childCities = cities?.filter(c => c.district_id == d.id) || [];
              const citiesToUpdate = childCities.filter(c => c.status !== newStatus);
              
              if (citiesToUpdate.length > 0) {
                  setCt(prev => prev?.map(x => x.district_id == d.id ? {...x, status: newStatus} : x) || []);
                  citiesToUpdate.forEach(c => {
                      promises.push(geographyApi.patchCity(c.id!, { status: newStatus }));
                      
                      const childAreas = areas?.filter(a => a.city_id == c.id) || [];
                      const areasToUpdate = childAreas.filter(a => a.status !== newStatus);

                      if (areasToUpdate.length > 0) {
                          setA(prev => prev?.map(x => x.city_id == c.id ? {...x, status: newStatus} : x) || []);
                          areasToUpdate.forEach(a => promises.push(geographyApi.patchArea(a.id!, { status: newStatus })));
                      }
                  });
              }
          });
          toast.success(newStatus === 1 ? "Activated State and descendants" : "Deactivated State and descendants");
      } else {
          toast.success(newStatus === 1 ? "Activated State" : "Deactivated State");
      }

      try { await Promise.all(promises); } catch { refetchS(); toast.error("Error updating"); }
  };

  const handleToggleDistrict = async (item: District) => {
      const newStatus = item.status === 1 ? 0 : 1;
      setD(prev => prev?.map(x => x.id === item.id ? {...x, status: newStatus} : x) || []);
      const promises: Promise<any>[] = [geographyApi.patchDistrict(item.id!, { status: newStatus })];

      const childCities = cities?.filter(c => c.district_id == item.id) || [];
      const citiesToUpdate = childCities.filter(c => c.status !== newStatus);

      if (citiesToUpdate.length > 0) {
          setCt(prev => prev?.map(x => x.district_id == item.id ? {...x, status: newStatus} : x) || []);
          citiesToUpdate.forEach(c => {
              promises.push(geographyApi.patchCity(c.id!, { status: newStatus }));
              
              const childAreas = areas?.filter(a => a.city_id == c.id) || [];
              const areasToUpdate = childAreas.filter(a => a.status !== newStatus);
              
              if (areasToUpdate.length > 0) {
                  setA(prev => prev?.map(x => x.city_id == c.id ? {...x, status: newStatus} : x) || []);
                  areasToUpdate.forEach(a => promises.push(geographyApi.patchArea(a.id!, { status: newStatus })));
              }
          });
          toast.success(newStatus === 1 ? "Activated District and descendants" : "Deactivated District and descendants");
      } else {
          toast.success(newStatus === 1 ? "Activated District" : "Deactivated District");
      }

      try { await Promise.all(promises); } catch { refetchD(); toast.error("Error updating"); }
  };

  const handleToggleCity = async (item: City) => {
      const newStatus = item.status === 1 ? 0 : 1;
      setCt(prev => prev?.map(x => x.id === item.id ? {...x, status: newStatus} : x) || []);
      const promises: Promise<any>[] = [geographyApi.patchCity(item.id!, { status: newStatus })];

      const childAreas = areas?.filter(a => a.city_id == item.id) || [];
      const areasToUpdate = childAreas.filter(a => a.status !== newStatus);

      if (areasToUpdate.length > 0) {
          setA(prev => prev?.map(x => x.city_id == item.id ? {...x, status: newStatus} : x) || []);
          areasToUpdate.forEach(a => {
              promises.push(geographyApi.patchArea(a.id!, { status: newStatus }));
          });
          toast.success(newStatus === 1 ? "Activated City and descendants" : "Deactivated City and descendants");
      } else {
          toast.success(newStatus === 1 ? "Activated City" : "Deactivated City");
      }

      try { await Promise.all(promises); } catch { refetchCt(); toast.error("Error updating"); }
  };

  return (
    <MasterDataLayout title="Geography Management">
      <div className="space-y-6 pb-6">
        <Input placeholder="Search all tables..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GeoSection title="Country" data={countries?.filter(x => filter(x.country_name))} nameKey="country_name" crud={cCrud} onToggle={handleToggleCountry} />
            <GeoSection title="State" data={states?.filter(x => filter(x.state))} nameKey="state" crud={sCrud} onToggle={handleToggleState} />
            <GeoSection title="District" data={districts?.filter(x => filter(x.district_name))} nameKey="district_name" crud={dCrud} onToggle={handleToggleDistrict} />
            <GeoSection title="City" data={cities?.filter(x => filter(x.city))} nameKey="city" crud={ctCrud} onToggle={handleToggleCity} />
            <GeoSection title="Area" data={areas?.filter(x => filter(x.area))} nameKey="area" crud={aCrud} />
        </div>
      </div>

      <Modal isOpen={cCrud.isModalOpen} onClose={cCrud.handleCloseModal} title="Edit Country" footer={<Footer crud={cCrud} />}>
         <Input label="Name" value={cCrud.currentItem.country_name || ''} onChange={e => cCrud.setCurrentItem({...cCrud.currentItem, country_name: e.target.value})} />
      </Modal>

      <Modal isOpen={sCrud.isModalOpen} onClose={sCrud.handleCloseModal} title="Edit State" footer={<Footer crud={sCrud} />}>
         <div className="space-y-4">
             <Select label="Country" options={countries?.filter(c => c.status === 1).map(c => ({label: c.country_name, value: c.id!})) || []} value={sCrud.currentItem.country_id || ''} onChange={e => sCrud.setCurrentItem({...sCrud.currentItem, country_id: e.target.value})} />
             <Input label="Name" value={sCrud.currentItem.state || ''} onChange={e => sCrud.setCurrentItem({...sCrud.currentItem, state: e.target.value})} />
         </div>
      </Modal>

      <Modal isOpen={dCrud.isModalOpen} onClose={dCrud.handleCloseModal} title="Edit District" footer={<Footer crud={dCrud} />}>
         <div className="space-y-4">
             <Select label="State" options={states?.filter(s => s.status === 1).map(s => ({label: s.state, value: s.id!})) || []} value={dCrud.currentItem.state_id || ''} onChange={e => { const s=states?.find(x=>x.id==e.target.value); dCrud.setCurrentItem({...dCrud.currentItem, state_id: e.target.value, country_id: s?.country_id}); }} />
             <Input label="Name" value={dCrud.currentItem.district_name || ''} onChange={e => dCrud.setCurrentItem({...dCrud.currentItem, district_name: e.target.value})} />
         </div>
      </Modal>

      <Modal isOpen={ctCrud.isModalOpen} onClose={ctCrud.handleCloseModal} title="Edit City" footer={<Footer crud={ctCrud} />}>
         <div className="space-y-4">
             <Select label="District" options={districts?.filter(d => d.status === 1).map(d => ({label: d.district_name, value: d.id!})) || []} value={ctCrud.currentItem.district_id || ''} onChange={e => { const d=districts?.find(x=>x.id==e.target.value); ctCrud.setCurrentItem({...ctCrud.currentItem, district_id: e.target.value, state_id: d?.state_id, country_id: d?.country_id}); }} />
             <Input label="Name" value={ctCrud.currentItem.city || ''} onChange={e => ctCrud.setCurrentItem({...ctCrud.currentItem, city: e.target.value})} />
         </div>
      </Modal>

      <Modal isOpen={aCrud.isModalOpen} onClose={aCrud.handleCloseModal} title="Edit Area" footer={<Footer crud={aCrud} />}>
         <div className="space-y-4">
             <Select label="City" options={cities?.filter(c => c.status === 1).map(c => ({label: c.city, value: c.id!})) || []} value={aCrud.currentItem.city_id || ''} onChange={e => { const c=cities?.find(x=>x.id==e.target.value); aCrud.setCurrentItem({...aCrud.currentItem, city_id: e.target.value, district_id: c?.district_id, state_id: c?.state_id, country_id: c?.country_id}); }} />
             <Input label="Name" value={aCrud.currentItem.area || ''} onChange={e => aCrud.setCurrentItem({...aCrud.currentItem, area: e.target.value})} />
         </div>
      </Modal>
    </MasterDataLayout>
  );
};

const GeoSection = ({ title, data, nameKey, crud, onToggle }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[300px]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 dark:bg-slate-800 rounded-t-lg">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
            <Button size="sm" onClick={() => crud.handleOpenModal()} icon={<Plus size={12}/>}>Add</Button>
        </div>
        <DataTable data={data || []} columns={[{ header: 'Name', accessor: nameKey }]} onEdit={crud.handleOpenModal} onToggleStatus={onToggle || crud.handleToggleStatus} />
    </div>
);

const Footer = ({ crud }: any) => (
  <><Button variant="secondary" onClick={crud.handleCloseModal}>Cancel</Button><Button variant="success" onClick={crud.handleSave} isLoading={crud.saving}>Save</Button></>
);

export default GeographyPage;