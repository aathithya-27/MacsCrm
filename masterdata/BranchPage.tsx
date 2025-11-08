
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Branch, SelectOption, Company, PaginatedResponse } from '../types';
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
    const [branchesResponse, setBranchesResponse] = useState<PaginatedResponse<Branch> | null>(null);
    
    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [states, setStates] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [cities, setCities] = useState<SelectOption[]>([]);
    const [areas, setAreas] = useState<SelectOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
    
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);

    const [isGeoLoading, setIsGeoLoading] = useState(false);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await api.fetchCurrentUser();
            const currentCompany = await api.fetchCompanyById(user.comp_id);
            setCompanyData(currentCompany);
        } catch (error) {
            console.error("Failed to load initial data", error);
            addToast("Failed to load company data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const loadBranches = useCallback(async () => {
        if (!companyData) return;
        setIsLoading(true);
        try {
            const data = await api.fetchBranches(companyData.comp_id, { page, search: searchQuery });
            setBranchesResponse(data);
        } catch (error) {
            console.error("Failed to load branches", error);
            addToast("Failed to load branches.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [companyData, page, searchQuery, addToast]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (companyData) {
                loadBranches();
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [loadBranches, companyData]);

    const openModal = async (branch: Branch | null) => {
        setIsModalOpen(true);
        if (branch) {
            setEditingBranch({ ...branch });
            setIsGeoLoading(true);
            
            const area = branch.area_id ? await api.fetchAreaById(branch.area_id) : null;
            const city = branch.city_id ? await api.fetchCityById(area?.city_id || branch.city_id) : null;
            const district = city ? await api.fetchDistrictById(city.district_id) : null;
            const state = branch.state_id ? await api.fetchStateById(district?.state_id || branch.state_id) : null;
            const country = state ? await api.fetchCountryById(state.country_id) : null;
            
            setSelectedCountry(country ? String(country.id) : null);
            setSelectedState(state ? String(state.id) : null);
            setSelectedDistrict(district ? String(district.id) : null);
            setSelectedCity(city ? String(city.id) : null);
            setSelectedArea(area ? String(area.id) : null);
            setIsGeoLoading(false);

        } else {
            setEditingBranch({ comp_id: companyData!.comp_id, status: 1, date_of_creation: new Date().toISOString().split('T')[0] });
            const allCountries = await api.fetchCountries();
            const india = allCountries.data.find(g => g.country_name === 'India');
            setSelectedCountry(india ? String(india.id) : null);
            setSelectedState(null);
            setSelectedDistrict(null);
            setSelectedCity(null);
            setSelectedArea(null);
        }
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingBranch(null);
    }, []);

    const handleSave = async () => {
        if (!editingBranch || !editingBranch.branch_name?.trim() || !editingBranch.branch_code?.trim()) {
            addToast("Branch name and Branch Code are required.", "error");
            return;
        }

        try {
            await api.saveBranch(editingBranch);
            addToast(`Branch ${editingBranch.id ? 'updated' : 'created'} successfully!`);
            closeModal();
            loadBranches();
        } catch (error: any) {
            if (error.status === 409) {
                 addToast(error.message, "error");
            } else {
                console.error("Failed to save branch", error);
                addToast("An unexpected error occurred while saving.", "error");
            }
        }
    };
    
    const handleToggleStatus = async (branch: Branch) => {
        const updatedBranch = { ...branch, status: branch.status === 1 ? 0 : 1 };
         try {
            await api.saveBranch(updatedBranch);
            addToast("Branch status updated.");
            loadBranches();
        } catch (error) {
            console.error("Failed to update branch status", error);
            addToast("Failed to update status.", "error");
        }
    };

    const handleModalInputChange = (field: keyof Branch, value: any) => {
        setEditingBranch(prev => prev ? { ...prev, [field]: value } : null);
    };

    useEffect(() => {
        if (!isModalOpen) return;
        (async () => {
            const [countriesData, statesData, districtsData, citiesData, areasData] = await Promise.all([
                api.fetchCountries(), api.fetchStates(), api.fetchDistricts(), api.fetchCities(), api.fetchAreas()
            ]);
            setCountries(countriesData.data.map(c => ({ value: String(c.id), label: c.country_name })));
            
            const filteredStates = selectedCountry ? statesData.data.filter(s => s.country_id === Number(selectedCountry)) : [];
            setStates(filteredStates.map(s => ({ value: String(s.id), label: s.state })));
            
            const filteredDistricts = selectedState ? districtsData.data.filter(d => d.state_id === Number(selectedState)) : [];
            setDistricts(filteredDistricts.map(d => ({ value: String(d.id), label: d.district })));
            
            const filteredCities = selectedDistrict ? citiesData.data.filter(c => c.district_id === Number(selectedDistrict)) : [];
            setCities(filteredCities.map(c => ({ value: String(c.id), label: c.city })));
            
            const filteredAreas = selectedCity ? areasData.data.filter(a => a.city_id === Number(selectedCity)) : [];
            setAreas(filteredAreas.map(a => ({ value: String(a.id), label: a.area })));
        })();
    }, [isModalOpen, selectedCountry, selectedState, selectedDistrict, selectedCity]);

    const companyCode = companyData?.comp_code || '';
    const branches = branchesResponse?.data || [];

    if (!companyData) return <div className="p-8 text-center">Loading company context...</div>;

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
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : branches.length > 0 ? branches.map((branch, index) => (
                            <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{((page-1) * 25) + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-slate-300">{`${companyCode}-${branch.branch_code}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{branch.branch_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ToggleSwitch enabled={branch.status === 1} onChange={() => handleToggleStatus(branch)} disabled={!canModify}/>
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{editingBranch?.id ? 'Edit' : 'Add'} Branch</h2>
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
                                                <input value={editingBranch?.branch_code || ''} onChange={e => handleModalInputChange('branch_code', e.target.value.toUpperCase())} placeholder="e.g., ERD" className="block w-28 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <Input label="Branch Name" name="branch_name" value={editingBranch?.branch_name || ''} onChange={e => handleModalInputChange('branch_name', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                <Input label="Date of Creation" name="date_of_creation" type="date" value={editingBranch?.date_of_creation || ''} onChange={e => handleModalInputChange('date_of_creation', e.target.value)} />
                                </div>
                                <div className="flex items-center pt-8 gap-2 md:col-span-2">
                                    <input
                                        type="checkbox"
                                        id="branch-active"
                                        name="status"
                                        className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-700 checked:bg-blue-500"
                                        checked={editingBranch?.status === 1}
                                        onChange={e => handleModalInputChange('status', e.target.checked ? 1 : 0)}
                                    />
                                    <label htmlFor="branch-active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-6 pt-0">
                            <legend className="px-2 text-lg font-semibold text-slate-700 dark:text-slate-300">Address Details</legend>
                            {isGeoLoading ? <div className='text-center p-4'>Loading geography...</div> :
                            <div className="grid grid-cols-1 gap-6 pt-4">
                                <Input label="Line 1" value={editingBranch?.address_1 || ''} onChange={e => handleModalInputChange('address_1', e.target.value)} />
                                <Input label="Line 2" value={editingBranch?.address_2 || ''} onChange={e => handleModalInputChange('address_2', e.target.value)} />
                                <Input label="Line 3" value={editingBranch?.address_3 || ''} onChange={e => handleModalInputChange('address_3', e.target.value)} />
                                
                                <SearchableSelect label="Country" options={countries} value={selectedCountry} onChange={val => { setSelectedCountry(val); setSelectedState(null); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('state_id', null); }} />
                                <SearchableSelect label="State" options={states} value={selectedState} onChange={val => { setSelectedState(val); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('state_id', val ? Number(val) : null); handleModalInputChange('city_id', null); handleModalInputChange('area_id', null); }} disabled={!selectedCountry} />
                                <SearchableSelect label="District" options={districts} value={selectedDistrict} onChange={val => { setSelectedDistrict(val); setSelectedCity(null); setSelectedArea(null); handleModalInputChange('city_id', null); handleModalInputChange('area_id', null); }} disabled={!selectedState} />
                                <SearchableSelect label="City" options={cities} value={selectedCity} onChange={val => { setSelectedCity(val); setSelectedArea(null); handleModalInputChange('city_id', val ? Number(val) : null); handleModalInputChange('area_id', null); }} disabled={!selectedDistrict} />
                                <SearchableSelect label="Area" options={areas} value={selectedArea} onChange={val => { setSelectedArea(val); handleModalInputChange('area_id', val ? Number(val) : null); }} disabled={!selectedCity} />

                                <Input label="Pin Code" value={editingBranch?.pincode || ''} onChange={e => handleModalInputChange('pincode', e.target.value)} />
                                <Input label="Phone No." value={editingBranch?.phone_no || ''} onChange={e => handleModalInputChange('phone_no', e.target.value)} />
                                <Input label="FAX No." value={editingBranch?.fax_no || ''} onChange={e => handleModalInputChange('fax_no', e.target.value)} />
                            </div>}
                        </fieldset>

                        <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-6 pt-0">
                            <legend className="px-2 text-lg font-semibold text-slate-700 dark:text-slate-300">Tax Info</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                <Input label="GSTIN" value={editingBranch?.gst_no || ''} onChange={e => handleModalInputChange('gst_no', e.target.value)} />
                                <Input label="PAN" value={editingBranch?.pan_no || ''} onChange={e => handleModalInputChange('pan_no', e.target.value)} />
                                <Input label="TAN" value={editingBranch?.tan_no || ''} onChange={e => handleModalInputChange('tan_no', e.target.value)} />
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