
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Designation, Company, PaginatedResponse } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, Search } from 'lucide-react';

const DesignationPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [designationsResponse, setDesignationsResponse] = useState<PaginatedResponse<Designation> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Designation> | null>(null);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    const loadData = useCallback(async () => {
        if (!companyData) return;
        setIsLoading(true);
        try {
            const data = await api.fetchDesignations(companyData.comp_id, { page, search: searchQuery });
            setDesignationsResponse(data);
        } catch (error) {
            console.error("Failed to load data", error);
            addToast("Failed to load designations.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [companyData, page, searchQuery, addToast]);

    useEffect(() => {
        const loadInitialCompany = async () => {
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
                setCompanyData(currentCompany);
            } catch (error) {
                console.error("Failed to load company", error);
                addToast("Failed to load company data.", "error");
            }
        };
        loadInitialCompany();
    }, [addToast]);
    
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [loadData]);


    const openModal = (item: Designation | null) => {
        if (!companyData) return;
        setEditingItem(item ? { ...item } : { comp_id: companyData.comp_id, status: 1, designation_name: '', rank: undefined });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = async () => {
        if (!editingItem || !editingItem.designation_name?.trim()) {
            addToast("Designation name is required.", "error");
            return;
        }

        try {
            await api.saveDesignation(editingItem);
            addToast(`Designation ${editingItem.id ? 'updated' : 'created'} successfully.`);
            closeModal();
            loadData();
        } catch (error) {
            console.error("Failed to save designation", error);
            addToast("Failed to save designation.", "error");
        }
    };
    
    const handleToggleStatus = async (item: Designation) => {
        const updatedItem = { ...item, status: item.status === 1 ? 0 : 1 };
         try {
            await api.saveDesignation(updatedItem);
            addToast("Status updated.");
            loadData();
        } catch (error) {
            console.error("Failed to update status", error);
            addToast("Failed to update status.", "error");
        }
    };

    const designations = designationsResponse?.data || [];

    if (!companyData && !isLoading) {
        return <div className="p-8 text-center">Could not load company information.</div>
    }

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Manage Designations</h2>
            
            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Designations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                </div>
                 {
                    <Button onClick={() => openModal(null)} disabled={!canCreate}>
                        <Plus size={16} />
                        Add Designation
                    </Button>
                }
            </div>

            <div className="flex-grow overflow-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                         <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {isLoading ? (
                             <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : designations.length > 0 ? designations.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{((page-1) * 25) + index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{item.designation_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.rank ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleStatus(item)} disabled={!canModify}/>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openModal(item)} disabled={!canModify} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No designations found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {}

            <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem?.id ? 'Edit' : 'Add'} Designation</h2>
                        <div className="space-y-4">
                            <Input label="Designation Name" value={editingItem?.designation_name || ''} onChange={e => setEditingItem(p => p ? {...p, designation_name: e.target.value} : null)} required autoFocus />
                            <Input label="Rank" type="number" placeholder="e.g., 1 (lower is higher rank)" value={editingItem?.rank?.toString() || ''} onChange={e => setEditingItem(p => p ? {...p, rank: e.target.value ? Number(e.target.value) : undefined} : null)} />
                        </div>
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save Designation</Button>
                    </footer>
                </form>
            </Modal>
        </div>
    );
};
export default DesignationPage;
