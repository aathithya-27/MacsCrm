
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Company, SelectOption, Country, State, District, City, Area } from '../types';
import Input from '../components/ui/Input';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchableSelect from '../components/ui/SearchableSelect';
import Button from '../components/ui/Button';
import { SaveIcon } from '../components/icons/Icons';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

const CompanyMasterPage: React.FC = () => {
    const { addToast } = useToast();
    const { company: contextCompany, isLoading: isContextLoading, updateCompany: updateContextCompany } = useOutletContext<{
        company: Company | null;
        isLoading: boolean;
        updateCompany: (company: Company) => void;
    }>();

    const [formData, setFormData] = useState<Company | null>(null);
    const [initialFormData, setInitialFormData] = useState<Company | null>(null);
    
    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [states, setStates] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [cities, setCities] = useState<SelectOption[]>([]);
    const [areas, setAreas] = useState<SelectOption[]>([]);

    const [isGeoLoading, setIsGeoLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    
    const canModify = true; 

    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);

    useEffect(() => {
        const initializeForm = async () => {
            if (contextCompany) {
                setIsGeoLoading(true);
                const companyCopy = JSON.parse(JSON.stringify(contextCompany));
                setFormData(companyCopy);
                setInitialFormData(companyCopy);
    
                const { area_id, city_id, state_id } = companyCopy;
                
                const area = area_id ? await api.fetchAreaById(area_id) : null;
                const city = city_id ? await api.fetchCityById(area?.city_id || city_id) : null;
                const district = city ? await api.fetchDistrictById(city.district_id) : null;
                const state = state_id ? await api.fetchStateById(district?.state_id || state_id) : null;
                const country = state ? await api.fetchCountryById(state.country_id) : null;
    
                setSelectedCountry(country ? String(country.id) : null);
                setSelectedState(state ? String(state.id) : null);
                setSelectedDistrict(district ? String(district.id) : null);
                setSelectedCity(city ? String(city.id) : null);
                setSelectedArea(area ? String(area.id) : null);
                setIsGeoLoading(false);
            }
        };
        initializeForm();
    }, [contextCompany]);

    useEffect(() => {
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
    }, [selectedCountry, selectedState, selectedDistrict, selectedCity]);


    useEffect(() => {
        if (!formData || !initialFormData) {
            setIsDirty(false);
            return;
        }
        const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
        setIsDirty(hasChanged);
    }, [formData, initialFormData]);

    const handleDataChange = (field: keyof Company, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = async () => {
        if (!formData || !isDirty) return;
        setIsSaving(true);
        try {
            const oldStatus = initialFormData?.status;
            const newStatus = formData.status;
    
            const updatedCompanyFromApi = await api.updateCompany(formData);
            updateContextCompany(updatedCompanyFromApi);
            setInitialFormData(JSON.parse(JSON.stringify(updatedCompanyFromApi)));
            
            if (oldStatus !== newStatus) {
                if (newStatus === 1) {
                    addToast("Company and all related data have been activated.", "success");
                } else {
                    addToast("Company and all related data have been deactivated.", "success");
                }
            } else {
                 addToast("Company details saved successfully!", "success");
            }
        } catch (error) {
            console.error("Failed to save company details", error);
            addToast("Failed to save company details.", "error");
            if (initialFormData) {
                setFormData(JSON.parse(JSON.stringify(initialFormData)));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusToggle = (checked: boolean) => {
        const newStatus = checked ? 1 : 0;
        handleDataChange('status', newStatus);
        if (newStatus === 0 && initialFormData?.status === 1) {
            setIsWarningModalOpen(true);
        }
    };
    
    const confirmDeactivation = () => {
        setIsWarningModalOpen(false);
        handleSave();
    };

    const cancelDeactivation = () => {
        handleDataChange('status', 1);
        setIsWarningModalOpen(false);
    };
    
    const isLoading = isContextLoading || isGeoLoading;

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading company data...</div>;
    }

    if (!formData) {
        return (
            <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Company Master</h3>
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg mt-4">
                    <p>No company data found for the current user.</p>
                </div>
            </div>
        );
    }
    const isActive = formData.status === 1;

    return (
        <div className="w-full">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Company Master</h2>
                <Button onClick={handleSave} disabled={!canModify || isSaving || !isDirty}>
                    <SaveIcon className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Company Details'}</span>
                </Button>
            </div>
            <fieldset disabled={!canModify || isSaving}>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Company Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Company Code" name="comp_code" value={formData.comp_code || ''} onChange={e => handleDataChange('comp_code', e.target.value)} disabled/>
                            <Input label="Company Name" name="comp_name" value={formData.comp_name} onChange={e => handleDataChange('comp_name', e.target.value)} />
                            <Input label="Registered Name" name="mailing_name" value={formData.mailing_name || ''} onChange={e => handleDataChange('mailing_name', e.target.value)} />
                            <Input label="Date of Creation" name="date_of_creation" type="date" value={formData.date_of_creation || ''} onChange={e => handleDataChange('date_of_creation', e.target.value)} />
                             <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                <ToggleSwitch enabled={isActive} onChange={handleStatusToggle} />
                                <span className={`text-sm font-medium ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Address & Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Line 1" value={formData.address_1 || ''} onChange={e => handleDataChange('address_1', e.target.value)} />
                            <Input label="Line 2" value={formData.address_2 || ''} onChange={e => handleDataChange('address_2', e.target.value)} />
                            
                            <div className="md:col-span-2">
                                <SearchableSelect label="Country" options={countries} value={selectedCountry} onChange={val => { setSelectedCountry(val); setSelectedState(null); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleDataChange('state_id', null); }} />
                            </div>

                            <SearchableSelect label="State" options={states} value={selectedState} onChange={val => { setSelectedState(val); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleDataChange('state_id', val ? Number(val) : null); handleDataChange('city_id', null); }} disabled={!selectedCountry} />
                            <SearchableSelect label="District" options={districts} value={selectedDistrict} onChange={val => { setSelectedDistrict(val); setSelectedCity(null); setSelectedArea(null); handleDataChange('city_id', null); }} disabled={!selectedState} />
                            
                            <SearchableSelect label="City" options={cities} value={selectedCity} onChange={val => { setSelectedCity(val); setSelectedArea(null); handleDataChange('city_id', val ? Number(val) : null); handleDataChange('area_id', null); }} disabled={!selectedDistrict} />
                            <SearchableSelect label="Area" options={areas} value={selectedArea} onChange={val => { setSelectedArea(val); handleDataChange('area_id', val ? Number(val) : null); }} disabled={!selectedCity} />

                            <Input label="Pin Code" value={formData.pin_code || ''} onChange={e => handleDataChange('pin_code', e.target.value)} />
                            <Input label="Phone No." name="phone_no" value={formData.phone_no || ''} onChange={e => handleDataChange('phone_no', e.target.value)} />
                            <Input label="Email ID" name="email" type="email" value={formData.email || ''} onChange={e => handleDataChange('email', e.target.value)} />
                            <Input label="FAX No." name="fax_no" value={formData.fax_no || ''} onChange={e => handleDataChange('fax_no', e.target.value)} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Tax Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="GSTIN" name="gst_no" value={formData.gst_no || ''} onChange={e => handleDataChange('gst_no', e.target.value)} />
                            <Input label="PAN" name="pan_no" value={formData.pan_no || ''} onChange={e => handleDataChange('pan_no', e.target.value)} />
                            <Input label="TAN" name="tan_no" value={formData.tan_no || ''} onChange={e => handleDataChange('tan_no', e.target.value)} />
                        </div>
                    </div>
                </div>
            </fieldset>

            <Modal isOpen={isWarningModalOpen} onClose={cancelDeactivation} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Deactivate Company?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            This will deactivate the entire company and all associated master data, including branches, business verticals, agencies, schemes, and more. This is a significant action.
                        </p>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-2">
                            Are you sure you want to proceed?
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={confirmDeactivation}>Deactivate</Button>
                    <Button variant="secondary" onClick={cancelDeactivation}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};

export default CompanyMasterPage;