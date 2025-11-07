
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
    
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);

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

    const getGeographyPath = useCallback((areaId: number | null, cityId: number | null, stateId: number | null) => {
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


    useEffect(() => {
        const loadGeos = async () => {
            setIsGeoLoading(true);
            try {
                const [countriesData, statesData, districtsData, citiesData, areasData] = await Promise.all([
                    api.fetchCountries(), api.fetchStates(), api.fetchDistricts(), api.fetchCities(), api.fetchAreas()
                ]);
                setCountries(countriesData);
                setStates(statesData);
                setDistricts(districtsData);
                setCities(citiesData);
                setAreas(areasData);
            } catch (error) {
                console.error("Failed to load geographies", error);
            } finally {
                setIsGeoLoading(false);
            }
        };
        loadGeos();
    }, []);

    useEffect(() => {
        if (contextCompany && !isGeoLoading) {
            const companyCopy = JSON.parse(JSON.stringify(contextCompany));
            setFormData(companyCopy);
            setInitialFormData(companyCopy);

            const { AREA_ID, CITY_ID, STATE_ID } = companyCopy;
            const geoPath = getGeographyPath(AREA_ID, CITY_ID, STATE_ID);

            setSelectedCountry(geoPath.countryId);
            setSelectedState(geoPath.stateId);
            setSelectedDistrict(geoPath.districtId);
            setSelectedCity(geoPath.cityId);
            setSelectedArea(geoPath.areaId);
        }
    }, [contextCompany, isGeoLoading, getGeographyPath]);

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
            const oldStatus = initialFormData?.STATUS;
            const newStatus = formData.STATUS;
    
            const updatedCompanyFromApi = await api.updateCompany(formData);
            updateContextCompany(updatedCompanyFromApi);
            
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
        handleDataChange('STATUS', newStatus);
        if (newStatus === 0 && initialFormData?.STATUS === 1) {
            setIsWarningModalOpen(true);
        }
    };
    
    const confirmDeactivation = () => {
        setIsWarningModalOpen(false);
        handleSave();
    };

    const cancelDeactivation = () => {
        handleDataChange('STATUS', 1);
        setIsWarningModalOpen(false);
    };

    const countryOptions = useMemo<SelectOption[]>(() => countries.filter(c => c.STATUS === 1).map(c => ({ value: String(c.ID), label: c.COUNTRY_NAME })), [countries]);
    const stateOptions = useMemo<SelectOption[]>(() => !selectedCountry ? [] : states.filter(s => s.COUNTRY_ID === Number(selectedCountry) && s.STATUS === 1).map(s => ({ value: String(s.ID), label: s.STATE })), [states, selectedCountry]);
    const districtOptions = useMemo<SelectOption[]>(() => !selectedState ? [] : districts.filter(d => d.STATE_ID === Number(selectedState) && d.STATUS === 1).map(d => ({ value: String(d.ID), label: d.DISTRICT })), [districts, selectedState]);
    const cityOptions = useMemo<SelectOption[]>(() => !selectedDistrict ? [] : cities.filter(c => c.DISTRICT_ID === Number(selectedDistrict) && c.STATUS === 1).map(c => ({ value: String(c.ID), label: c.CITY })), [cities, selectedDistrict]);
    const areaOptions = useMemo<SelectOption[]>(() => !selectedCity ? [] : areas.filter(a => a.CITY_ID === Number(selectedCity) && a.STATUS === 1).map(a => ({ value: String(a.ID), label: a.AREA })), [areas, selectedCity]);
    
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
    const isActive = formData.STATUS === 1;

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
                            <Input label="Company Code" name="COMP_CODE" value={formData.COMP_CODE || ''} onChange={e => handleDataChange('COMP_CODE', e.target.value)} disabled/>
                            <Input label="Company Name" name="COMP_NAME" value={formData.COMP_NAME} onChange={e => handleDataChange('COMP_NAME', e.target.value)} />
                            <Input label="Registered Name" name="MAILING_NAME" value={formData.MAILING_NAME || ''} onChange={e => handleDataChange('MAILING_NAME', e.target.value)} />
                            <Input label="Date of Creation" name="DATE_OF_CREATION" type="date" value={formData.DATE_OF_CREATION || ''} onChange={e => handleDataChange('DATE_OF_CREATION', e.target.value)} />
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
                            <Input label="Line 1" value={formData.ADDRESS_1 || ''} onChange={e => handleDataChange('ADDRESS_1', e.target.value)} />
                            <Input label="Line 2" value={formData.ADDRESS_2 || ''} onChange={e => handleDataChange('ADDRESS_2', e.target.value)} />
                            
                            <div className="md:col-span-2">
                                <SearchableSelect label="Country" options={countryOptions} value={selectedCountry} onChange={val => { setSelectedCountry(val); setSelectedState(null); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleDataChange('STATE_ID', null); }} />
                            </div>

                            <SearchableSelect label="State" options={stateOptions} value={selectedState} onChange={val => { setSelectedState(val); setSelectedDistrict(null); setSelectedCity(null); setSelectedArea(null); handleDataChange('STATE_ID', val ? Number(val) : null); handleDataChange('CITY_ID', null); }} disabled={!selectedCountry} />
                            <SearchableSelect label="District" options={districtOptions} value={selectedDistrict} onChange={val => { setSelectedDistrict(val); setSelectedCity(null); setSelectedArea(null); handleDataChange('CITY_ID', null); }} disabled={!selectedState} />
                            
                            <SearchableSelect label="City" options={cityOptions} value={selectedCity} onChange={val => { setSelectedCity(val); setSelectedArea(null); handleDataChange('CITY_ID', val ? Number(val) : null); handleDataChange('AREA_ID', null); }} disabled={!selectedDistrict} />
                            <SearchableSelect label="Area" options={areaOptions} value={selectedArea} onChange={val => { setSelectedArea(val); handleDataChange('AREA_ID', val ? Number(val) : null); }} disabled={!selectedCity} />

                            <Input label="Pin Code" value={formData.PIN_CODE || ''} onChange={e => handleDataChange('PIN_CODE', e.target.value)} />
                            <Input label="Phone No." name="PHONE_NO" value={formData.PHONE_NO || ''} onChange={e => handleDataChange('PHONE_NO', e.target.value)} />
                            <Input label="Email ID" name="EMAIL" type="email" value={formData.EMAIL || ''} onChange={e => handleDataChange('EMAIL', e.target.value)} />
                            <Input label="FAX No." name="FAX_NO" value={formData.FAX_NO || ''} onChange={e => handleDataChange('FAX_NO', e.target.value)} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Tax Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input label="GSTIN" name="GST_NO" value={formData.GST_NO || ''} onChange={e => handleDataChange('GST_NO', e.target.value)} />
                            <Input label="PAN" name="PAN_NO" value={formData.PAN_NO || ''} onChange={e => handleDataChange('PAN_NO', e.target.value)} />
                            <Input label="TAN" name="TAN_NO" value={formData.TAN_NO || ''} onChange={e => handleDataChange('TAN_NO', e.target.value)} />
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
