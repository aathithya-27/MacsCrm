
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LeadStage, Company, PaginatedResponse } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2, GripVertical, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';

const LeadStageMasterPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [response, setResponse] = useState<PaginatedResponse<LeadStage> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<LeadStage> | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;
    const noun = "Lead Stage";

    const loadCompany = useCallback(async () => {
        try {
            const user = await api.fetchCurrentUser();
            const companies = await api.fetchCompanies();
            const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
            setCompanyData(currentCompany);
        } catch (error) {
            addToast("Failed to load company data.", "error");
        }
    }, [addToast]);
    
    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    const loadData = useCallback(async () => {
        if (!companyData) return;
        setIsLoading(true);
        try {
            const data = await api.fetchLeadStages(companyData.comp_id, { page, search: searchQuery });
            setResponse(data);
        } catch (error) {
            addToast("Failed to load lead stages.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast, companyData, page, searchQuery]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (companyData) {
                loadData();
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [loadData, companyData]);

    const items = useMemo(() => response?.data || [], [response]);
    const canDrag = canModify && !searchQuery && (!response || response.meta.pages <= 1);

    const openModal = (item: LeadStage | null) => {
        setEditingItem(item ? { ...item } : { lead_name: '', status: 1 });
        setIsModalOpen(true);
    };
    
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = async () => {
        if (!editingItem || !editingItem.lead_name?.trim() || !companyData) {
            addToast("Lead stage name is required.", "error");
            return;
        }

        try {
            await api.saveLeadStage({ ...editingItem, comp_id: companyData.comp_id });
            addToast(`${noun} ${editingItem.id ? 'updated' : 'created'} successfully.`);
            loadData();
            closeModal();
        } catch(e) {
            addToast(`Failed to save ${noun}.`, 'error');
        }
    };
    
    const handleToggle = async (item: LeadStage) => {
        const updated = { ...item, status: item.status === 1 ? 0 : 1 };
        try {
            await api.saveLeadStage(updated);
            addToast("Status updated.");
            loadData();
        } catch (e) {
            addToast("Failed to update status.", "error");
        }
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        if (!canDrag) return;
        e.dataTransfer.setData('text/plain', id.toString());
        setDraggedItemId(id);
    };

    const handleDrop = async (e: React.DragEvent, dropTargetId: number) => {
        e.preventDefault();
        if (!canDrag || !draggedItemId) return;
        setDraggedItemId(null);
        if (draggedItemId === dropTargetId) return;

        const currentItems = [...items];
        const draggedIndex = currentItems.findIndex(item => item.id === draggedItemId);
        const targetIndex = currentItems.findIndex(item => item.id === dropTargetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);
        
        const finalItems = currentItems.map((item, index) => ({ ...item, seq_no: index }));
        
        if (response) {
            setResponse({ ...response, data: finalItems });
        }
        addToast("Order changed (note: not persisted in this demo).");
    };
    
    if (!companyData && !isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading company context...</div>
    }

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Manage Lead Pipeline Stages</h2>
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${noun}s...`}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        />
                    </div>
                    {<Button onClick={() => openModal(null)} disabled={!canCreate}><Plus size={16}/> Add New {noun}</Button>}
                </div>
                <div className="flex-grow overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="px-3 py-3 w-10"></th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700" onDragEnd={() => setDraggedItemId(null)}>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-8">Loading...</td></tr>
                            ) : items.map((item, index) => (
                                <tr key={item.id} draggable={canDrag} onDragStart={e => handleDragStart(e, item.id)} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, item.id)}
                                    className={`${canDrag ? 'cursor-grab' : ''} ${draggedItemId === item.id ? 'opacity-30' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/40`}>
                                    <td className={`px-3 py-4 text-center ${canDrag ? 'text-slate-400' : 'text-slate-200 dark:text-slate-600'}`}><GripVertical size={16}/></td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{((page - 1) * 25) + index + 1}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.lead_name}</td>
                                    <td className="px-6 py-4"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggle(item)} disabled={!canModify} /></td>
                                    <td className="px-6 py-4">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(item)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {response && response.meta.pages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Page {response.meta.page} of {response.meta.pages}
                        </span>
                        <div className="flex gap-2">
                            <Button onClick={() => setPage(p => p - 1)} disabled={!response.meta.has_prev_page} size="small">Previous</Button>
                            <Button onClick={() => setPage(p => p + 1)} disabled={!response.meta.has_next_page} size="small">Next</Button>
                        </div>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem?.id ? 'Edit' : 'Add'} {noun}</h2>
                        <Input label={`${noun} Name`} value={editingItem?.lead_name || ''} onChange={e => setEditingItem(p => p ? {...p, lead_name: e.target.value} : null)} required autoFocus />
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                    </footer>
                </form>
            </Modal>
        </div>
    );
};

export default LeadStageMasterPage;
