
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Country, State, District, City, Area, Member } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchableSelect from '../components/ui/SearchableSelect';
import SearchBar from '../components/ui/SearchBar';
import { Plus, Edit2, AlertTriangle } from 'lucide-react';

type GeoItem = Country | State | District | City | Area;
type GeoTypeString = 'Country' | 'State' | 'District' | 'City' | 'Area';

const GeographyManagementPage: React.FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: GeoTypeString | null; item: Partial<GeoItem> | null }>({ isOpen: false, type: null, item: null });
    const { addToast } = useToast();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [itemToToggle, setItemToToggle] = useState<GeoItem | null>(null);

    const [modalCountry, setModalCountry] = useState<string | null>(null);
    const [modalStateVal, setModalStateVal] = useState<string | null>(null);
    const [modalDistrict, setModalDistrict] = useState<string | null>(null);
    const [modalCity, setModalCity] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [countriesData, statesData, districtsData, citiesData, areasData] = await Promise.all([
                api.fetchCountries(), api.fetchStates(), api.fetchDistricts(), api.fetchCities(), api.fetchAreas()
            ]);
            setCountries(countriesData.data);
            setStates(statesData.data);
            setDistricts(districtsData.data);
            setCities(citiesData.data);
            setAreas(areasData.data);
        } catch (error) {
            addToast("Failed to load geographies.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleOpenModal = (type: GeoTypeString, item: GeoItem | null) => {
        setModalState({ isOpen: true, type, item: item ? { ...item } : { status: 1 } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = async () => {
        const { type, item } = modalState;
        if (!type || !item) return;

        const nameFields: Record<GeoTypeString, string> = {
            Country: 'country_name', State: 'state', District: 'district', City: 'city', Area: 'area',
        };
        const nameField = nameFields[type];
        const name = (item as any)[nameField];

        if (!name || !name.trim()) {
            addToast("Name is required.", "error");
            return;
        }

        try {
            if (item.id) {
                const message = `${type} updated successfully.`;
                if (type === 'Country') setCountries(await api.onUpdateCountries(countries.map(c => c.id === item.id ? item as Country : c)));
                else if (type === 'State') setStates(await api.onUpdateStates(states.map(s => s.id === item.id ? item as State : s)));
                else if (type === 'District') setDistricts(await api.onUpdateDistricts(districts.map(d => d.id === item.id ? item as District : d)));
                else if (type === 'City') setCities(await api.onUpdateCities(cities.map(c => c.id === item.id ? item as City : c)));
                else if (type === 'Area') setAreas(await api.onUpdateAreas(areas.map(a => a.id === item.id ? item as Area : a)));
                addToast(message, 'success');
            } else { 
                const newItem = {
                    ...item,
                    [nameField]: name.trim(),
                };

                const message = `${type} added successfully.`;
                if (type === 'Country') setCountries(await api.onUpdateCountries([...countries, newItem as Country]));
                else if (type === 'State') setStates(await api.onUpdateStates([...states, { ...newItem, country_id: Number(modalCountry) } as State]));
                else if (type === 'District') setDistricts(await api.onUpdateDistricts([...districts, { ...newItem, state_id: Number(modalStateVal), country_id: Number(modalCountry) } as District]));
                else if (type === 'City') setCities(await api.onUpdateCities([...cities, { ...newItem, district_id: Number(modalDistrict), state_id: Number(modalStateVal), country_id: Number(modalCountry) } as City]));
                else if (type === 'Area') setAreas(await api.onUpdateAreas([...areas, { ...newItem, city_id: Number(modalCity), district_id: Number(modalDistrict), state_id: Number(modalStateVal), country_id: Number(modalCountry) } as Area]));
                addToast(message, 'success');
            }
            handleCloseModal();
        } catch (error) {
            addToast("Failed to save.", "error");
        }
    };
    
    const performToggle = async (itemToToggle: GeoItem) => {
        const newStatus = itemToToggle.status === 1 ? 0 : 1;

        let updatedCountries = [...countries];
        let updatedStates = [...states];
        let updatedDistricts = [...districts];
        let updatedCities = [...cities];
        let updatedAreas = [...areas];

        let itemType: GeoTypeString | null = null;
        let itemName = '';

        if ('country_name' in itemToToggle) {
            itemType = 'Country';
            itemName = itemToToggle.country_name as string;
            const countryId = itemToToggle.id;
            updatedCountries = updatedCountries.map(c => c.id === countryId ? { ...c, status: newStatus } : c);
            
            const stateIdsToUpdate = states.filter(s => s.country_id === countryId).map(s => s.id);
            updatedStates = updatedStates.map(s => s.country_id === countryId ? { ...s, status: newStatus } : s);

            const districtIdsToUpdate = districts.filter(d => stateIdsToUpdate.includes(d.state_id)).map(d => d.id);
            updatedDistricts = updatedDistricts.map(d => stateIdsToUpdate.includes(d.state_id) ? { ...d, status: newStatus } : d);

            const cityIdsToUpdate = cities.filter(c => districtIdsToUpdate.includes(c.district_id)).map(c => c.id);
            updatedCities = updatedCities.map(c => districtIdsToUpdate.includes(c.district_id) ? { ...c, status: newStatus } : c);
            
            updatedAreas = updatedAreas.map(a => cityIdsToUpdate.includes(a.city_id) ? { ...a, status: newStatus } : a);
        } else if ('state' in itemToToggle) {
            itemType = 'State';
            itemName = itemToToggle.state as string;
            const stateId = itemToToggle.id;
            updatedStates = updatedStates.map(s => s.id === stateId ? { ...s, status: newStatus } : s);

            const districtIdsToUpdate = districts.filter(d => d.state_id === stateId).map(d => d.id);
            updatedDistricts = updatedDistricts.map(d => d.state_id === stateId ? { ...d, status: newStatus } : d);
            
            const cityIdsToUpdate = cities.filter(c => districtIdsToUpdate.includes(c.district_id)).map(c => c.id);
            updatedCities = updatedCities.map(c => districtIdsToUpdate.includes(c.district_id) ? { ...c, status: newStatus } : c);
            
            updatedAreas = updatedAreas.map(a => cityIdsToUpdate.includes(a.city_id) ? { ...a, status: newStatus } : a);
        } else if ('district' in itemToToggle) {
            itemType = 'District';
            itemName = itemToToggle.district as string;
            const districtId = itemToToggle.id;
            updatedDistricts = updatedDistricts.map(d => d.id === districtId ? { ...d, status: newStatus } : d);
            
            const cityIdsToUpdate = cities.filter(c => c.district_id === districtId).map(c => c.id);
            updatedCities = updatedCities.map(c => c.district_id === districtId ? { ...c, status: newStatus } : c);
            
            updatedAreas = updatedAreas.map(a => cityIdsToUpdate.includes(a.city_id) ? { ...a, status: newStatus } : a);
        } else if ('city' in itemToToggle) {
            itemType = 'City';
            itemName = itemToToggle.city as string;
            const cityId = itemToToggle.id;
            updatedCities = updatedCities.map(c => c.id === cityId ? { ...c, status: newStatus } : c);
            updatedAreas = updatedAreas.map(a => a.city_id === cityId ? { ...a, status: newStatus } : a);
        } else if ('area' in itemToToggle) {
            itemType = 'Area';
            itemName = itemToToggle.area as string;
            const areaId = itemToToggle.id;
            updatedAreas = updatedAreas.map(a => a.id === areaId ? { ...a, status: newStatus } : a);
        }
        
        try {
            await Promise.all([
                api.onUpdateCountries(updatedCountries),
                api.onUpdateStates(updatedStates),
                api.onUpdateDistricts(updatedDistricts),
                api.onUpdateCities(updatedCities),
                api.onUpdateAreas(updatedAreas),
            ]);
            
            setCountries(updatedCountries);
            setStates(updatedStates);
            setDistricts(updatedDistricts);
            setCities(updatedCities);
            setAreas(updatedAreas);
            
            addToast(`${itemType} "${itemName}" and all its children have been ${newStatus ? 'activated' : 'deactivated'}.`, 'success');
        } catch(e) {
            addToast("Failed to update status.", "error");
        } finally {
            setIsWarningModalOpen(false);
            setItemToToggle(null);
        }
    };
    
    const getDependentChildrenCount = (item: GeoItem): number => {
        if ('country_name' in item) { 
            const countryStates = states.filter(s => s.country_id === item.id);
            if (countryStates.length === 0) return 0;
            const stateIds = countryStates.map(s => s.id);
            const countryDistricts = districts.filter(d => stateIds.includes(d.state_id));
            if (countryDistricts.length === 0) return countryStates.length;
            const districtIds = countryDistricts.map(d => d.id);
            const countryCities = cities.filter(c => districtIds.includes(c.district_id));
            if (countryCities.length === 0) return countryStates.length + countryDistricts.length;
            const cityIds = countryCities.map(c => c.id);
            const countryAreas = areas.filter(a => cityIds.includes(a.city_id));
            return countryStates.length + countryDistricts.length + countryCities.length + countryAreas.length;
        }
        if ('state' in item) { 
            const stateDistricts = districts.filter(d => d.state_id === item.id);
            if (stateDistricts.length === 0) return 0;
            const districtIds = stateDistricts.map(d => d.id);
            const stateCities = cities.filter(c => districtIds.includes(c.district_id));
            if (stateCities.length === 0) return stateDistricts.length;
            const cityIds = stateCities.map(c => c.id);
            const stateAreas = areas.filter(a => cityIds.includes(a.city_id));
            return stateDistricts.length + stateCities.length + stateAreas.length;
        }
        if ('district' in item) {
            const districtCities = cities.filter(c => c.district_id === item.id);
            if (districtCities.length === 0) return 0;
            const cityIds = districtCities.map(c => c.id);
            const districtAreas = areas.filter(a => cityIds.includes(a.city_id));
            return districtCities.length + districtAreas.length;
        }
        if ('city' in item) {
            return areas.filter(a => a.city_id === item.id).length;
        }
        return 0;
    };

    const handleToggleStatus = (item: GeoItem) => {
        if (item.status === 1) { 
            const childCount = getDependentChildrenCount(item);
            if (childCount > 0) {
                setItemToToggle(item);
                setIsWarningModalOpen(true);
                return;
            }
        }
        performToggle(item);
    };

    const countryOptions = useMemo(() => countries.filter(c => c.status === 1).map(c => ({ value: String(c.id), label: c.country_name })), [countries]);
    const stateOptions = useMemo(() => modalCountry ? states.filter(s => s.country_id === Number(modalCountry) && s.status === 1).map(s => ({ value: String(s.id), label: s.state })) : [], [states, modalCountry]);
    const districtOptions = useMemo(() => modalStateVal ? districts.filter(d => d.state_id === Number(modalStateVal) && d.status === 1).map(d => ({ value: String(d.id), label: d.district })) : [], [districts, modalStateVal]);
    const cityOptions = useMemo(() => modalDistrict ? cities.filter(c => c.district_id === Number(modalDistrict) && c.status === 1).map(c => ({ value: String(c.id), label: c.city })) : [], [cities, modalDistrict]);

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase();
        if (!q) return { Country: countries, State: states, District: districts, City: cities, Area: areas };
        return {
            Country: countries.filter(i => i.country_name.toLowerCase().includes(q)),
            State: states.filter(i => i.state.toLowerCase().includes(q)),
            District: districts.filter(i => i.district.toLowerCase().includes(q)),
            City: cities.filter(i => i.city.toLowerCase().includes(q)),
            Area: areas.filter(i => i.area.toLowerCase().includes(q)),
        };
    }, [searchQuery, countries, states, districts, cities, areas]);


    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading geographies...</div>;
    
    const nameFieldForModal = modalState.type ? {
        Country: 'country_name', State: 'state', District: 'district', City: 'city', Area: 'area'
    }[modalState.type] : null;
    
    let warningModalItemName = '';
    if(itemToToggle) {
        if ('country_name' in itemToToggle) warningModalItemName = itemToToggle.country_name;
        else if ('state' in itemToToggle) warningModalItemName = itemToToggle.state;
        else if ('district' in itemToToggle) warningModalItemName = itemToToggle.district;
        else if ('city' in itemToToggle) warningModalItemName = itemToToggle.city;
        else if ('area' in itemToToggle) warningModalItemName = itemToToggle.area;
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Geography Management</h2>
                <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search across all geographies..." className="max-w-md"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {}
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage Country</h3>
                        <Button onClick={() => handleOpenModal('Country', null)} variant="primary"><Plus size={16} /> Add Country</Button>
                    </div>
                    <div className="overflow-auto h-60">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase w-12">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {}
                                {filteredData.Country.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.country_name}</td>
                                        <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} /></td>
                                        <td className="px-4 py-2"><Button size="small" variant="light" onClick={() => handleOpenModal('Country', item)}><Edit2 size={14} /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage State</h3>
                        <Button onClick={() => handleOpenModal('State', null)} variant="primary"><Plus size={16} /> Add State</Button>
                    </div>
                    <div className="overflow-auto h-60">
                         <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase w-12">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {}
                                {filteredData.State.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.state}</td>
                                        <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} /></td>
                                        <td className="px-4 py-2"><Button size="small" variant="light" onClick={() => handleOpenModal('State', item)}><Edit2 size={14} /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage District</h3>
                        <Button onClick={() => handleOpenModal('District', null)} variant="primary"><Plus size={16} /> Add District</Button>
                    </div>
                    <div className="overflow-auto h-60">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase w-12">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {}
                                {filteredData.District.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.district}</td>
                                        <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} /></td>
                                        <td className="px-4 py-2"><Button size="small" variant="light" onClick={() => handleOpenModal('District', item)}><Edit2 size={14} /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage City</h3>
                        <Button onClick={() => handleOpenModal('City', null)} variant="primary"><Plus size={16} /> Add City</Button>
                    </div>
                    <div className="overflow-auto h-60">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase w-12">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {}
                                {filteredData.City.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.city}</td>
                                        <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} /></td>
                                        <td className="px-4 py-2"><Button size="small" variant="light" onClick={() => handleOpenModal('City', item)}><Edit2 size={14} /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {}
                <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Manage Area</h3>
                        <Button onClick={() => handleOpenModal('Area', null)} variant="primary"><Plus size={16} /> Add Area</Button>
                    </div>
                    <div className="overflow-auto h-60">
                         <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase w-12">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {}
                                {filteredData.Area.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.area}</td>
                                        <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} /></td>
                                        <td className="px-4 py-2"><Button size="small" variant="light" onClick={() => handleOpenModal('Area', item)}><Edit2 size={14} /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                key={modalState.type}
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
                initialFocusRef={nameInputRef}
            >
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        {}
                        <h2 className="text-xl font-bold mb-4">{modalState.item?.id ? 'Edit' : 'Add'} {modalState.type}</h2>
                        <div className="space-y-4">
                           {modalState.type === 'State' && <SearchableSelect label="Country" options={countryOptions} value={modalCountry} onChange={setModalCountry} />}
                           {modalState.type === 'District' && <>
                                <SearchableSelect label="Country" options={countryOptions} value={modalCountry} onChange={val => {setModalCountry(val); setModalStateVal(null);}} />
                                <SearchableSelect label="State" options={stateOptions} value={modalStateVal} onChange={setModalStateVal} disabled={!modalCountry} />
                           </>}
                           {modalState.type === 'City' && <>
                                <SearchableSelect label="Country" options={countryOptions} value={modalCountry} onChange={val => {setModalCountry(val); setModalStateVal(null); setModalDistrict(null);}} />
                                <SearchableSelect label="State" options={stateOptions} value={modalStateVal} onChange={val => {setModalStateVal(val); setModalDistrict(null);}} disabled={!modalCountry} />
                                <SearchableSelect label="District" options={districtOptions} value={modalDistrict} onChange={setModalDistrict} disabled={!modalStateVal} />
                           </>}
                           {modalState.type === 'Area' && <>
                                <SearchableSelect label="Country" options={countryOptions} value={modalCountry} onChange={val => {setModalCountry(val); setModalStateVal(null); setModalDistrict(null); setModalCity(null);}} />
                                <SearchableSelect label="State" options={stateOptions} value={modalStateVal} onChange={val => {setModalStateVal(val); setModalDistrict(null); setModalCity(null);}} disabled={!modalCountry} />
                                <SearchableSelect label="District" options={districtOptions} value={modalDistrict} onChange={val => {setModalDistrict(val); setModalCity(null);}} disabled={!modalStateVal} />
                                <SearchableSelect label="City" options={cityOptions} value={modalCity} onChange={setModalCity} disabled={!modalDistrict} />
                           </>}
                            <Input
                                ref={nameInputRef}
                                label="Name"
                                value={nameFieldForModal && modalState.item ? (modalState.item as any)[nameFieldForModal] || '' : ''}
                                onChange={e => {
                                    if (nameFieldForModal) {
                                        setModalState(s => ({...s, item: {...s.item, [nameFieldForModal]: e.target.value}}))
                                    }
                                }}
                                required
                            />
                        </div>
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </footer>
                </form>
            </Modal>
            
            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium">Deactivate "{warningModalItemName}"?</h3>
                        <p className="text-sm text-slate-500 mt-2">This will also deactivate all child items (e.g., states, districts, etc.). Are you sure you want to continue?</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={() => { if(itemToToggle) performToggle(itemToToggle); }}>Deactivate Anyway</Button>
                    <Button variant="secondary" onClick={() => setIsWarningModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};

export default GeographyManagementPage;