import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Branch, SelectOption, Country, State, District, City, Area, Company } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import SearchableSelect from '../components/ui/SearchableSelect';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, Search } from 'lucide-react';

const BranchPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
    
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);

    const canCreate = companyData?.STATUS === 1;
    const canModify = companyData?.STATUS === 1;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
                setCompanyData(currentCompany);

                if (currentCompany) {
                    const [branchData, countriesData, statesData, districtsData, citiesData, areasData] = await Promise.all([
                        api.fetchBranches(),
                        api.fetchCountries(),
                        api.fetchStates(),
                        api.fetchDistricts(),
                        api.fetchCities(),
                        api.fetchAreas(),
                    ]);
                    const companyBranches = branchData.filter(b => b.COMP_ID === currentCompany.COMP_ID);
                    setBranches(companyBranches);
                    setCountries(countriesData);
                    setStates(statesData);
                    setDistricts(districtsData);
                    setCities(citiesData);
                    setAreas(areasData);
                } else {
                    setBranches([]);
                }
            } catch (error) {
                console.error("Failed to load data", error);
                addToast("Failed to load page data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);

    const filteredBranches = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return branches.filter(branch =>
            branch.BRANCH_NAME.toLowerCase().includes(query) ||
            branch.BRANCH_CODE.toLowerCase().includes(query)
        );
    }, [branches, searchQuery]);

    const getGeographyPath = useCallback((areaId?: number | null, cityId?: number | null, stateId?: number | null) => {
        const path = { countryId: null, stateId: null, districtId: null, cityId: null, areaId: null };
        if (!areaId && !cityId && !stateId) return path;

        const area = areaId ? areas.find(a => a.ID === areaId) : null;
        const city = cityId ? cities.find(c => c.ID === (area?.CITY_ID || cityId)) : null;
        const district = city ? districts.find(d => d.ID === city.DISTRICT_ID) : null;
        const state = stateId ? states.find(s => s.ID === (district?.STATE_ID || stateId)) : null;
        const country = state ? countries.find(c => c.ID === state.COUNTRY_ID) : null;

        if (country) path.countryId = String(country.ID);
        if (state) path.stateId = String(state.ID);
        if (district) path.districtId = String(district.ID);
        if (city) path.cityId = String(city.ID);
        if (area) path.areaId = String(area.ID);

        return path;
    }, [countries, states, districts, cities, areas]);

    const openModal = (branch: Branch | null) => {
        if (branch) {
            const { AREA_ID, CITY_ID, STATE_ID } = branch;
            const geoPath = getGeographyPath(AREA_ID, CITY_ID, STATE_ID);

            setSelectedCountry(geoPath.countryId);
            setSelectedState(geoPath.stateId);
            setSelectedDistrict(geoPath.districtId);
            setSelectedCity(geoPath.cityId);
            setSelectedArea(geoPath.areaId);
            setEditingBranch({ ...branch });
        } else {
            const indiaId = countries.find(g => g.COUNTRY_NAME === 'India')?.ID || null;
            setSelectedCountry(indiaId ? String(indiaId) : null);
            setSelectedState(null);
            setSelectedDistrict(null);
            setSelectedCity(null);
            setSelectedArea(null);
            setEditingBranch({ COMP_ID: companyData!.COMP_ID, STATUS: 1 });
        }
        setIsModalOpen(true);
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingBranch(null);
    }, []);

    const handleSave = async () => {
        if (!editingBranch || !editingBranch.BRANCH_NAME?.trim() || !editingBranch.BRANCH_CODE?.trim()) {
            addToast("Branch name and Branch Code are required.", "error");
            return;
        }

        const fullBranchId = `${companyData?.COMP_CODE}-${editingBranch.BRANCH_CODE}`;
        const isDuplicate = branches.some(b => 
            b.BRANCH_ID !== editingBranch.BRANCH_ID && 
            `${companyData?.COMP_CODE}-${b.BRANCH_CODE}` === fullBranchId
        );
        if (isDuplicate) {
            addToast("Branch ID already exists.", "error");
            return;
        }

        try {
            const saved = await api.saveBranch(editingBranch);
            if (editingBranch.BRANCH_ID) {
                setBranches(branches.map(b => b.BRANCH_ID === saved.BRANCH_ID ? saved : b));
                addToast("Branch updated successfully!");
            } else {
                setBranches([...branches, saved]);
                addToast("Branch created successfully!");
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save branch", error);
            addToast("Failed to save branch.", "error");
        }
    };
    
    const handleToggleStatus = async (branch: Branch) => {
        const updatedBranch = { ...branch, STATUS: branch.STATUS === 1 ? 0 : 1 };
         try {
            const saved = await api.saveBranch(updatedBranch);
            setBranches(branches.map(b => b.BRANCH_ID === saved.BRANCH_ID ? saved : b));
            addToast("Branch status updated.");
        } catch (error) {
            console.error("Failed to update branch status", error);
            addToast("Failed to update status.", "error");
        }
    };

    const handleModalInputChange = (field: keyof Branch, value: any) => {
        setEditingBranch(prev => prev ? { ...prev, [field]: value } : null);
    };

    const companyCode = companyData?.COMP_CODE || '';

    const countryOptions = useMemo<SelectOption[]>(() => countries.filter(c => c.STATUS === 1).map(c => ({ value: String(c.ID), label: c.COUNTRY_NAME })), [countries]);
    const stateOptions = useMemo<SelectOption[]>(() => !selectedCountry ? [] : states.filter(s => s.COUNTRY_ID === Number(selectedCountry) && s.STATUS === 1).map(s => ({ value: String(s.ID), label: s.STATE })), [states, selectedCountry]);
    const districtOptions = useMemo<SelectOption[]>(() => !selectedState ? [] : districts.filter(d => d.STATE_ID === Number(selectedState) && d.STATUS === 1).map(d => ({ value: String(d.ID), label: d.DISTRICT })), [districts, selectedState]);
    const cityOptions = useMemo<SelectOption[]>(() => !selectedDistrict ? [] : cities.filter(c => c.DISTRICT_ID === Number(selectedDistrict) && c.STATUS === 1).map(c => ({ value: String(c.ID), label: c.CITY })), [cities, selectedDistrict]);
    const areaOptions = useMemo<SelectOption[]>(() => !selectedCity ? [] : areas.filter(a => a.CITY_ID === Number(selectedCity) && a.STATUS === 1).map(a => ({ value: String(a.ID), label: a.AREA })), [areas, selectedCity]);
    
    if (isLoading) return <div className="p-8 text-center">Loading branches...</div>;

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Manage Branch</h2>
            
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Branch Name or Code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                </div>
                 {
                    <Button onClick={() => openModal(null)} disabled={!canCreate}>
                        <Plus size={16} />
                        Add New Branch
                    </Button>
                }
            </div>

            <div className="flex-grow overflow-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                         <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Branch ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Branch Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredBranches.length > 0 ? filteredBranches.map((branch, index) => (
                            <tr key={branch.BRANCH_ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-slate-300">{`${companyCode}-${branch.BRANCH_CODE}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{branch.BRANCH_NAME}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ToggleSwitch enabled={branch.STATUS === 1} onChange={() => handleToggleStatus(branch)} disabled={!canModify}/>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => openModal(branch)} disabled={!canModify} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No branches found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-[#2f3b50] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex-shrink-0 px-8 py-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{editingBranch?.BRANCH_ID ? 'Edit' : 'Add'} Branch</h2>
                </header>
                
                <div className="flex-grow overflow-y-auto px-8 py-6">
                    <form id="branch-form" className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-6 pt-0">
                            <legend className="px-2 text-lg font-semibold text-slate-700 dark:text-slate-300">Branch Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
                               <div className="md:col-span-5">
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-4 md:items-end">
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">Branch ID *</label>
                                            <div className="flex items-center gap-2">
                                                <input value={companyCode} disabled className="block w-20 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm text-slate-500 dark:text-slate-300 cursor-not-allowed" />
                                                <span className="font-semibold text-slate-500">-</span>
                                                <input value={editingBranch?.BRANCH_CODE || ''} onChange={e => handleModalInputChange('BRANCH_CODE', e.target.value.toUpperCase())} placeholder="e.g., ERD" className="block w-28 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <Input label="Branch Name" name="BRANCH_NAME" value={editingBranch?.BRANCH_NAME || ''} onChange={e => handleModalInputChange('BRANCH_NAME', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                <Input label="Date of Creation" name="DATE_OF_CREATION" type="date" value={editingBranch?.DATE_OF_CREATION || ''} onChange={e => handleModalInputChange('DATE_OF_CREATION', e.target.value)} />
                                </div>
                                <div className="flex items-center pt-8 gap-2 md:col-span-2">
                                    <input
                                        type="checkbox"
                                        id="branch-active"
                                        name="status"
                                        className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-700 checked:bg-blue-500"
                                        checked={editingBranch?.STATUS === 1}
                                        onChange={e => handleModalInputChange('STATUS', e.target.checked ? 1 : 0)}
                                    />
                                    <label htmlFor="branch-active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-6 pt-0">
                            <legend className="px-2 text-lg font-semibold text-slate-700 dark:text-slate-300">Address Details</legend>
                            <div className="grid grid-cols-1 gap-6 pt-4">
                                <Input label="Line 1" value={editingBranch?.ADDRESS_1 || ''} onChange={e => handleModalInputChange('ADDRESS_1', e.target.value)} />
                                <Input label="Line 2" value={editingBranch?.ADDRESS_2 || ''} onChange={e => handleModalInputChange('ADDRESS_2', e.target.value)} />
                                <Input label="Line 3" value={editingBranch?.ADDRESS_3 || ''} onChange={e => handleModalInputChange('ADDRESS_3', e.target.value)} />
                                
                                <SearchableSelect label="Country" options={countryOptions} value={selectedCountry} onChange={val => { setSelectedCountry(val); setSelectedState(null); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('STATE_ID', null); }} />
                                <SearchableSelect label="State" options={stateOptions} value={selectedState} onChange={val => { setSelectedState(val); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('STATE_ID', val ? Number(val) : null); handleModalInputChange('CITY_ID', null); handleModalInputChange('AREA_ID', null); }} disabled={!selectedCountry} />
                                <SearchableSelect label="District" options={districtOptions} value={selectedDistrict} onChange={val => { setSelectedDistrict(val); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('CITY_ID', null); handleModalInputChange('AREA_ID', null); }} disabled={!selectedState} />
                                <SearchableSelect label="City" options={cityOptions} value={selectedCity} onChange={val => { setSelectedCity(val); setSelectedArea(null); handleModalInputChange('CITY_ID', val ? Number(val) : null); handleModalInputChange('AREA_ID', null); }} disabled={!selectedDistrict} />
                                <SearchableSelect label="Area" options={areaOptions} value={selectedArea} onChange={val => { setSelectedArea(val); handleModalInputChange('AREA_ID', val ? Number(val) : null); }} disabled={!selectedCity} />

                                <Input label="Pin Code" value={editingBranch?.PINCODE || ''} onChange={e => handleModalInputChange('PINCODE', e.target.value)} />
                                <Input label="Phone No." value={editingBranch?.PHONE_NO || ''} onChange={e => handleModalInputChange('PHONE_NO', e.target.value)} />
                                <Input label="FAX No." value={editingBranch?.FAX_NO || ''} onChange={e => handleModalInputChange('FAX_NO', e.target.value)} />
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-6 pt-0">
                            <legend className="px-2 text-lg font-semibold text-slate-700 dark:text-slate-300">Tax Info</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                <Input label="GSTIN" value={editingBranch?.GST_NO || ''} onChange={e => handleModalInputChange('GST_NO', e.target.value)} />
                                <Input label="PAN" value={editingBranch?.PAN_NO || ''} onChange={e => handleModalInputChange('PAN_NO', e.target.value)} />
                                <Input label="TAN" value={editingBranch?.TAN_NO || ''} onChange={e => handleModalInputChange('TAN_NO', e.target.value)} />
                            </div>
                        </fieldset>
                    </form>
                </div>

                <footer className="flex-shrink-0 flex justify-end gap-4 px-8 py-4">
                    <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button type="submit" form="branch-form" variant="success" disabled={!canModify}>Save</Button>
                </footer>
            </Modal>
        </div>
    );
};

export default BranchPage;