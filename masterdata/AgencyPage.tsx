import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { Agency, Scheme, InsuranceType, InsuranceSubType, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, Search, Building, GripVertical, AlertTriangle } from 'lucide-react';

const AgencyPage: React.FC = () => {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
    const [insuranceSubTypes, setInsuranceSubTypes] = useState<InsuranceSubType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
    const [agencySearch, setAgencySearch] = useState('');
    const [schemeSearch, setSchemeSearch] = useState('');
    
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
    const [editingAgency, setEditingAgency] = useState<Partial<Agency> | null>(null);
    const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
    
    const [draggedSchemeId, setDraggedSchemeId] = useState<number | null>(null);
    const [selectedModalInsuranceType, setSelectedModalInsuranceType] = useState<string>('');
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const { addToast } = useToast();

    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [agencyToAction, setAgencyToAction] = useState<Agency | null>(null);
    const [dependentItems, setDependentItems] = useState<{ name: string; type: string }[]>([]);

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
                    const [agenciesData, schemesData, typesData, subTypesData] = await Promise.all([
                        api.fetchAgencies(),
                        api.fetchSchemes(),
                        api.fetchInsuranceTypes(),
                        api.fetchInsuranceSubTypes(),
                    ]);
                    setAgencies(agenciesData.filter(a => a.COMP_ID === currentCompany.COMP_ID));
                    setSchemes(schemesData.filter(s => s.COMP_ID === currentCompany.COMP_ID));
                    setInsuranceTypes(typesData);
                    setInsuranceSubTypes(subTypesData);
                }
            } catch (error) {
                console.error("Failed to load data", error);
                addToast("Failed to load data", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);

    const filteredAgencies = useMemo(() =>
        agencies.filter(agency => agency.AGENCY_NAME.toLowerCase().includes(agencySearch.toLowerCase())),
        [agencies, agencySearch]
    );

    const schemesForSelectedAgency = useMemo(() =>
        schemes.filter(scheme => scheme.AGENCY_ID === selectedAgencyId && scheme.SCHEME_NAME.toLowerCase().includes(schemeSearch.toLowerCase()))
            .sort((a, b) => (a.SEQ_NO ?? 0) - (b.SEQ_NO ?? 0)),
        [schemes, selectedAgencyId, schemeSearch]
    );

    const openAgencyModal = (agency: Agency | null) => {
        setEditingAgency(agency ? { ...agency } : { AGENCY_NAME: '', STATUS: 1 });
        setIsAgencyModalOpen(true);
    };

    const handleSaveAgency = async () => {
        if (!editingAgency?.AGENCY_NAME?.trim() || !companyData) {
             addToast("Agency name is required.", "error");
             return;
        }
        const saved = await api.saveAgency({ ...editingAgency, COMP_ID: companyData.COMP_ID });
        setAgencies(prev => editingAgency.ID ? prev.map(a => a.ID === saved.ID ? saved : a) : [...prev, saved]);
        addToast(`Agency ${editingAgency.ID ? 'updated' : 'created'} successfully.`);
        setIsAgencyModalOpen(false);
    };

    const checkAgencyDependencies = useCallback((agencyId: number) => {
        return schemes
            .filter(scheme => scheme.AGENCY_ID === agencyId)
            .map(scheme => ({ name: `Scheme: ${scheme.SCHEME_NAME}`, type: 'scheme' as const }));
    }, [schemes]);

    const performAgencyToggle = async (agency: Agency) => {
        const newStatus = agency.STATUS === 1 ? 0 : 1;
        const updatedAgency = { ...agency, STATUS: newStatus };

        const schemesToUpdate = schemes
            .filter(s => s.AGENCY_ID === agency.ID)
            .map(s => ({ ...s, STATUS: newStatus }));

        try {
            const savedAgency = await api.saveAgency(updatedAgency);
            if (schemesToUpdate.length > 0) {
                await Promise.all(schemesToUpdate.map(s => api.saveScheme(s)));
            }
            
            setAgencies(agencies.map(a => a.ID === savedAgency.ID ? savedAgency : a));
            setSchemes(prevSchemes => {
                const schemesToUpdateIds = new Set(schemesToUpdate.map(s => s.ID));
                return prevSchemes.map(s => schemesToUpdateIds.has(s.ID) ? { ...s, STATUS: newStatus } : s);
            });
            addToast(`"${agency.AGENCY_NAME}" and its schemes have been ${newStatus ? 'activated' : 'deactivated'}.`);

        } catch (error) {
            console.error("Failed to update agency status", error);
            addToast("Failed to update status.", "error");
        }
    };
    
    const handleToggleAgencyStatus = (agency: Agency) => {
        if (agency.STATUS === 1) {
            const dependents = checkAgencyDependencies(agency.ID);
            if (dependents.length > 0) {
                setAgencyToAction(agency);
                setDependentItems(dependents);
                setIsWarningModalOpen(true);
                return;
            }
        }
        performAgencyToggle(agency);
    };

    const confirmWarningAction = () => {
        if (agencyToAction) {
            performAgencyToggle(agencyToAction);
        }
        setIsWarningModalOpen(false);
    };

    const openSchemeModal = (scheme: Scheme | null) => {
        setEditingScheme(scheme ? { ...scheme } : { SCHEME_NAME: '', STATUS: 1, AGENCY_ID: selectedAgencyId! });
        setSelectedModalInsuranceType(scheme?.INSURANCE_TYPE_ID ? String(scheme.INSURANCE_TYPE_ID) : '');
        setIsSchemeModalOpen(true);
    };

    const handleSaveScheme = async () => {
        if (!editingScheme?.SCHEME_NAME?.trim() || !editingScheme.INSURANCE_TYPE_ID || !companyData) {
            addToast("Scheme Name and Insurance Type are required.", "error");
            return;
        }
        const saved = await api.saveScheme({ ...editingScheme, COMP_ID: companyData.COMP_ID });
        const updatedSchemes = editingScheme.ID ? schemes.map(s => s.ID === saved.ID ? saved : s) : [...schemes, saved];
        const reorderedSchemes = updatedSchemes
            .filter(s => s.AGENCY_ID === saved.AGENCY_ID)
            .sort((a,b) => (a.SEQ_NO ?? 0) - (b.SEQ_NO ?? 0))
            .map((s, idx) => ({ ...s, SEQ_NO: idx }));
        
        await api.updateSchemeOrder(reorderedSchemes);
        setSchemes(updatedSchemes.map(s => reorderedSchemes.find(rs => rs.ID === s.ID) || s));
        addToast(`Scheme ${editingScheme.ID ? 'updated' : 'created'} successfully.`);
        setIsSchemeModalOpen(false);
    };

    const handleToggleSchemeStatus = async (scheme: Scheme) => {
        const updatedScheme = { ...scheme, STATUS: scheme.STATUS === 1 ? 0 : 1 };
        const saved = await api.saveScheme(updatedScheme);
        setSchemes(schemes.map(s => s.ID === saved.ID ? saved : s));
        addToast("Scheme status updated.");
    };

    const handleSchemeDrop = async (e: React.DragEvent, dropTargetId: number) => {
        e.preventDefault();
        if (!draggedSchemeId || draggedSchemeId === dropTargetId) {
            setDraggedSchemeId(null);
            return;
        }

        const currentSchemes = [...schemesForSelectedAgency];
        const draggedIndex = currentSchemes.findIndex(s => s.ID === draggedSchemeId);
        const targetIndex = currentSchemes.findIndex(s => s.ID === dropTargetId);

        const [draggedItem] = currentSchemes.splice(draggedIndex, 1);
        currentSchemes.splice(targetIndex, 0, draggedItem);

        const reordered = currentSchemes.map((scheme, index) => ({ ...scheme, SEQ_NO: index }));
        await api.updateSchemeOrder(reordered);
        
        setSchemes(prev => prev.map(s => {
            const reorderedScheme = reordered.find(rs => rs.ID === s.ID);
            return reorderedScheme || s;
        }));
        setDraggedSchemeId(null);
        addToast("Scheme order saved.");
    };
    
    const getSchemeTypeString = (scheme: Scheme) => {
        const type = insuranceTypes.find(t => t.ID === scheme.INSURANCE_TYPE_ID);
        const subType = scheme.INSURANCE_SUB_TYPE_ID ? insuranceSubTypes.find(st => st.ID === scheme.INSURANCE_SUB_TYPE_ID) : null;
        if (type && subType) return `${type.INSURANCE_TYPE} > ${subType.INSURANCE_SUB_TYPE}`;
        return type?.INSURANCE_TYPE || 'N/A';
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading agencies...</div>;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            <div className="w-full lg:w-2/5 flex flex-col bg-white dark:bg-slate-800 shadow-md rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Agency</h3>
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="text" placeholder="Search Agency..." value={agencySearch} onChange={e => setAgencySearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"/>
                </div>
                {<Button onClick={() => openAgencyModal(null)} className="w-full mb-4" disabled={!canCreate}><Plus size={16}/>Add New Agency</Button>}
                <div className="flex-grow overflow-auto">
                    <table className="min-w-full">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-12">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgencies.map((agency, index) => (
                                <tr key={agency.ID} onClick={() => setSelectedAgencyId(agency.ID)} className={`cursor-pointer ${selectedAgencyId === agency.ID ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${agency.STATUS === 0 ? 'opacity-60' : ''}`}>
                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="px-4 py-2 font-medium">{agency.AGENCY_NAME}</td>
                                    <td className="px-4 py-2"><ToggleSwitch enabled={agency.STATUS === 1} onChange={() => handleToggleAgencyStatus(agency)} disabled={!canModify} /></td>
                                    <td className="px-4 py-2"><Button size="small" variant="light" className="!p-1.5" onClick={(e) => { e.stopPropagation(); openAgencyModal(agency); }} disabled={!canModify}><Edit2 size={14}/></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-full lg:w-3/5 flex flex-col">
                {selectedAgencyId ? (
                    <div className="flex-grow flex flex-col bg-white dark:bg-slate-800 shadow-md rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Schemes for {agencies.find(a => a.ID === selectedAgencyId)?.AGENCY_NAME}</h3>
                        <div className="relative mb-2">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                             <input type="text" placeholder="Search Schemes..." value={schemeSearch} onChange={e => setSchemeSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"/>
                        </div>
                        {<Button onClick={() => openSchemeModal(null)} className="w-full mb-4" disabled={!canCreate}><Plus size={16}/>Add New Scheme</Button>}
                        <div className="flex-grow overflow-auto">
                           <table className="min-w-full">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-2 py-3 w-8"></th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider w-12">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody onDragEnd={() => setDraggedSchemeId(null)}>
                                    {schemesForSelectedAgency.map((scheme, index) => (
                                        <tr key={scheme.ID} draggable={canModify} onDragStart={e => setDraggedSchemeId(scheme.ID)} onDragOver={e => e.preventDefault()} onDrop={e => handleSchemeDrop(e, scheme.ID)}
                                            className={`cursor-grab ${scheme.STATUS === 0 ? 'opacity-60' : ''} ${draggedSchemeId === scheme.ID ? 'opacity-30' : ''}`}>
                                            <td className="px-2 py-3 text-slate-400"><GripVertical size={16}/></td>
                                            <td className="px-4 py-2 text-sm">{index + 1}</td>
                                            <td className="px-4 py-2 font-medium">{scheme.SCHEME_NAME}</td>
                                            <td className="px-4 py-2 text-sm">{getSchemeTypeString(scheme)}</td>
                                            <td className="px-4 py-2"><ToggleSwitch enabled={scheme.STATUS === 1} onChange={() => handleToggleSchemeStatus(scheme)} disabled={!canModify}/></td>
                                            <td className="px-4 py-2"><Button size="small" variant="light" className="!p-1.5" onClick={() => openSchemeModal(scheme)} disabled={!canModify}><Edit2 size={14}/></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-slate-500 border-2 border-dashed dark:border-slate-700 rounded-lg">
                        <div>
                            <Building size={48} className="mx-auto text-slate-300 dark:text-slate-600"/>
                            <p className="mt-4 font-semibold">Select an Agency</p>
                            <p className="text-sm">Select an Agency from the left to view and manage its schemes.</p>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isAgencyModalOpen} onClose={() => setIsAgencyModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveAgency(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{editingAgency?.ID ? 'Edit' : 'Add'} Agency</h2>
                        <Input label="Agency Name" value={editingAgency?.AGENCY_NAME || ''} onChange={e => setEditingAgency(p => p ? {...p, AGENCY_NAME: e.target.value} : null)} required autoFocus />
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={() => setIsAgencyModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                    </footer>
                </form>
            </Modal>
            
             <Modal isOpen={isSchemeModalOpen} onClose={() => setIsSchemeModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveScheme(); }}>
                    <div className="p-6 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editingScheme?.ID ? 'Edit' : 'New'} Scheme</h2>
                        <Input label="Scheme Name" value={editingScheme?.SCHEME_NAME || ''} onChange={e => setEditingScheme(p => p ? { ...p, SCHEME_NAME: e.target.value } : null)} required autoFocus />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Insurance Type</label>
                            <select value={selectedModalInsuranceType} onChange={e => { setSelectedModalInsuranceType(e.target.value); setEditingScheme(p => p ? { ...p, INSURANCE_TYPE_ID: Number(e.target.value), INSURANCE_SUB_TYPE_ID: null } : null) }} className="w-full px-3 py-2 border rounded-md bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600" required>
                                <option value="">Select Type...</option>
                                {insuranceTypes.filter(t => t.STATUS === 1).map(t => <option key={t.ID} value={t.ID}>{t.INSURANCE_TYPE}</option>)}
                            </select>
                        </div>
                         {insuranceSubTypes.filter(st => st.INSURANCE_TYPE_ID === Number(selectedModalInsuranceType) && st.STATUS === 1).length > 0 && (
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Insurance Sub-Type</label>
                                <select value={editingScheme?.INSURANCE_SUB_TYPE_ID || ''} onChange={e => setEditingScheme(p => p ? { ...p, INSURANCE_SUB_TYPE_ID: Number(e.target.value) } : null)} className="w-full px-3 py-2 border rounded-md bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600">
                                    <option value="">Select Sub-Type...</option>
                                    {insuranceSubTypes.filter(st => st.INSURANCE_TYPE_ID === Number(selectedModalInsuranceType) && st.STATUS === 1).map(st => <option key={st.ID} value={st.ID}>{st.INSURANCE_SUB_TYPE}</option>)}
                                </select>
                            </div>
                         )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agency</label>
                            <input value={agencies.find(a => a.ID === selectedAgencyId)?.AGENCY_NAME || ''} disabled className="w-full px-3 py-2 border rounded-md bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600 cursor-not-allowed" />
                        </div>
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={() => setIsSchemeModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save Scheme</Button>
                    </footer>
                </form>
            </Modal>

            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium">Deactivate "{agencyToAction?.AGENCY_NAME}"?</h3>
                        <p className="text-sm text-slate-500 mt-2">This agency has {dependentItems.length} scheme(s). Deactivating it will also deactivate all associated schemes.</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={confirmWarningAction}>Deactivate Anyway</Button>
                    <Button variant="secondary" onClick={() => setIsWarningModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AgencyPage;