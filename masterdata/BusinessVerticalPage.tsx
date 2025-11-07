import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { BusinessVertical, InsuranceType, InsuranceSubType, Company } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';

import ToggleSwitch from '../components/ui/ToggleSwitch';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Search, GripVertical, AlertTriangle } from 'lucide-react';

const BusinessVerticalPage: React.FC = () => {
    const { addToast } = useToast();
    const [verticals, setVerticals] = useState<BusinessVertical[]>([]);
    const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
    const [insuranceSubTypes, setInsuranceSubTypes] = useState<InsuranceSubType[]>([]);
    const [companyData, setCompanyData] = useState<Company | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [itemToAction, setItemToAction] = useState<BusinessVertical | null>(null);
    const [dependentItems, setDependentItems] = useState<{ name: string; type: string }[]>([]);

    const canModify = companyData?.STATUS === 1;
    const canDrag = searchQuery === '' && canModify;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
                setCompanyData(currentCompany);

                if (currentCompany) {
                    const [verticalData, typesData, subTypesData] = await Promise.all([
                        api.fetchBusinessVerticals(),
                        api.fetchInsuranceTypes(),
                        api.fetchInsuranceSubTypes(),
                    ]);

                    const companyVerticals = verticalData
                        .filter(v => v.COMP_ID === currentCompany.COMP_ID)
                        .sort((a, b) => a.ID - b.ID); 
                    
                    setVerticals(companyVerticals);
                    setInsuranceTypes(typesData);
                    setInsuranceSubTypes(subTypesData);
                } else {
                    setVerticals([]);
                }
            } catch (error) {
                console.error("Failed to load business verticals data", error);
                addToast("Failed to load business verticals data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);

    const filteredVerticals = useMemo(() => {
        return verticals
            .filter(vertical => vertical.BUSINESS_VERTICAL_NAME.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [verticals, searchQuery]);

    const checkDependencies = useCallback((verticalId: number) => {
        return insuranceTypes
            .filter(it => it.BUSINESS_VERTICAL_ID === verticalId)
            .map(it => ({ name: `Insurance Type: ${it.INSURANCE_TYPE}`, type: 'insurance_type' as const }));
    }, [insuranceTypes]);

    const performToggle = async (vertical: BusinessVertical) => {
        if (!canModify) return;
        const newStatus = vertical.STATUS === 1 ? 0 : 1;
        
        try {
            const updatedVertical = { ...vertical, STATUS: newStatus };

            const childInsuranceTypes = insuranceTypes.filter(it => it.BUSINESS_VERTICAL_ID === vertical.ID);
            const childInsuranceTypeIds = new Set(childInsuranceTypes.map(it => it.ID));
            
            const updatedInsuranceTypes = insuranceTypes.map(it => childInsuranceTypeIds.has(it.ID) ? { ...it, STATUS: newStatus } : it);
            const updatedInsuranceSubTypes = insuranceSubTypes.map(st => childInsuranceTypeIds.has(st.INSURANCE_TYPE_ID) ? { ...st, STATUS: newStatus } : st);
            
            await Promise.all([
                api.saveBusinessVertical(updatedVertical),
                api.onUpdateInsuranceTypes(updatedInsuranceTypes),
                api.onUpdateInsuranceSubTypes(updatedInsuranceSubTypes)
            ]);

            setVerticals(verticals.map(v => v.ID === vertical.ID ? updatedVertical : v));
            setInsuranceTypes(updatedInsuranceTypes);
            setInsuranceSubTypes(updatedInsuranceSubTypes);

            addToast(`"${vertical.BUSINESS_VERTICAL_NAME}" and its associated types have been ${newStatus ? 'activated' : 'deactivated'}.`);
            
        } catch (error) {
            console.error("Failed to update vertical status", error);
            addToast("Failed to update status.", "error");
        } finally {
            setIsWarningModalOpen(false);
            setItemToAction(null);
        }
    };


    const handleToggleStatus = async (vertical: BusinessVertical) => {
        if (!canModify) return;

        if (vertical.STATUS === 1) { 
            const dependents = checkDependencies(vertical.ID);
            if (dependents.length > 0) {
                setItemToAction(vertical);
                setDependentItems(dependents);
                setIsWarningModalOpen(true);
                return;
            }
        }
        performToggle(vertical);
    };
    
    const confirmWarningAction = () => {
        if (itemToAction) {
            performToggle(itemToAction);
        }
    };

    const handleDragStart = (index: number) => {
        if (!canDrag) return;
        setDraggedIndex(index);
    };

    const handleDrop = (dropIndex: number) => {
        if (draggedIndex === null || draggedIndex === dropIndex || !canDrag) return;

        const reorderedVerticals = [...verticals];
        const [draggedItem] = reorderedVerticals.splice(draggedIndex, 1);
        reorderedVerticals.splice(dropIndex, 0, draggedItem);

        setVerticals(reorderedVerticals);
        addToast("Order updated. Note: Order is not saved in this demo.", "info");
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading business verticals...</div>;
    
    const gridCols = "grid-cols-[40px_80px_1fr_100px]";

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Manage Business Vertical</h2>
                <div className="relative flex-grow max-w-xs">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Business Verticals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
                <div className="flex flex-col">
                    <div className={`grid ${gridCols} gap-x-6 px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700`}>
                        <div />
                        <div className="text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</div>
                        <div className="text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</div>
                        <div className="text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</div>
                    </div>
                    <div>
                        {filteredVerticals.length > 0 ? filteredVerticals.map((vertical, index) => {
                            const isDragging = draggedIndex === index;
                            
                            return (
                            <div 
                                key={vertical.ID} 
                                draggable={canDrag}
                                onDragStart={() => handleDragStart(index)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => { if (canDrag) e.preventDefault(); }}
                                className={`grid ${gridCols} gap-x-6 items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-opacity ${isDragging ? 'opacity-30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
                            >
                                <div className={`flex justify-center items-center text-slate-400 ${canDrag ? 'cursor-grab' : 'cursor-not-allowed text-slate-300 dark:text-slate-600'}`}>
                                    <GripVertical size={18} />
                                </div>
                                <div className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{vertical.ID}</div>
                                <div className="whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{vertical.BUSINESS_VERTICAL_NAME}</div>
                                <div className="whitespace-nowrap">
                                    <ToggleSwitch enabled={vertical.STATUS === 1} onChange={() => handleToggleStatus(vertical)} disabled={!canModify}/>
                                </div>
                            </div>
                        )}) : (
                            <div className="p-8 text-center text-slate-500">
                                No business verticals found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Deactivate "{itemToAction?.BUSINESS_VERTICAL_NAME}"?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This Business Vertical has {dependentItems.length} associated Insurance Type(s). Deactivating it will also deactivate all associated types and sub-types.</p>
                        <ul className="text-xs text-slate-400 dark:text-slate-500 mt-2 list-disc list-inside max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                            {dependentItems.slice(0, 5).map((item, index) => <li key={index}>{item.name}</li>)}
                            {dependentItems.length > 5 && <li>...and {dependentItems.length - 5} more.</li>}
                        </ul>
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

export default BusinessVerticalPage;