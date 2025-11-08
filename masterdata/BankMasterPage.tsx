
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { Bank, AccountType, Company, PaginatedResponse } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchBar from '../components/ui/SearchBar';
import { Plus, Edit2 } from 'lucide-react';

const ManagerSection = ({
    title,
    noun,
    nameField,
    canCreate,
    canModify,
    companyId,
    fetchFn,
    saveFn
}) => {
    const { addToast } = useToast();
    const [response, setResponse] = useState<PaginatedResponse<any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!companyId) return;
            setIsLoading(true);
            try {
                const data = await fetchFn(companyId, { page, search: searchQuery });
                setResponse(data);
            } catch (error) {
                addToast(`Failed to load ${noun}s.`, "error");
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(loadData, 300);
        return () => clearTimeout(debounceTimer);
    }, [companyId, fetchFn, page, searchQuery, refreshKey, addToast, noun]);

    const openModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = async () => {
        if (!editingItem?.[nameField]?.trim()) {
            addToast(`${noun} Name is required.`, "error");
            return;
        }
        try {
            await saveFn({ ...editingItem, comp_id: companyId });
            addToast(`${noun} ${editingItem.id ? 'updated' : 'created'} successfully.`);
            setRefreshKey(k => k + 1);
            closeModal();
        } catch (error) {
            addToast(`Failed to save ${noun}.`, "error");
        }
    };
    
    const onToggleStatus = async (item) => {
        const updated = { ...item, status: item.status === 1 ? 0 : 1 };
        try {
            await saveFn(updated);
            addToast("Status updated successfully.");
            setRefreshKey(k => k + 1);
        } catch(e) {
            addToast("Failed to update status.", "error");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                <Button onClick={() => openModal({ [nameField]: '', status: 1 })} disabled={!canCreate}>
                    <Plus size={16} /> Add New {noun}
                </Button>
            </div>
            <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder={`Search ${noun}s...`}
                className="mb-4"
            />
            <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                <table className="min-w-full">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase w-16">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase w-24">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center p-8 text-slate-500">Loading...</td></tr>
                        ) : response?.data.length > 0 ? (
                            response.data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 text-sm">{((response.meta.page - 1) * response.meta.limit) + index + 1}</td>
                                    <td className="px-4 py-2 font-medium">{item[nameField]}</td>
                                    <td className="px-4 py-2">
                                        <ToggleSwitch
                                            enabled={item.status === 1}
                                            onChange={() => onToggleStatus(item)}
                                            disabled={!canModify}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(item)} disabled={!canModify}>
                                            <Edit2 size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="text-center p-8 text-slate-500">No items found.</td></tr>
                        )}
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
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{editingItem?.id ? 'Edit' : 'Add'} {noun}</h2>
                            <Input
                                label={`${noun} Name`}
                                value={editingItem?.[nameField] || ''}
                                onChange={(e) => setEditingItem(p => ({ ...p, [nameField]: e.target.value }))}
                                required
                                autoFocus
                            />
                        </div>
                        <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                        </footer>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const BankMasterPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
                setCompanyData(currentCompany);
            } catch (error) {
                addToast("Failed to load data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading Bank Master...</div>;
    }
    
    if (!companyData) {
        return <div className="p-8 text-center text-red-500">Could not determine company. Please try again.</div>
    }

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Bank Management</h2>
            </div>
            <ManagerSection
                title="Manage Bank Master"
                noun="Bank"
                nameField="bank_name"
                canCreate={canCreate}
                canModify={canModify}
                companyId={companyData.comp_id}
                fetchFn={api.fetchBanks}
                saveFn={api.saveBank}
            />
            <ManagerSection
                title="Manage Account Types"
                noun="Account Type"
                nameField="account_type_name"
                canCreate={canCreate}
                canModify={canModify}
                companyId={companyData.comp_id}
                fetchFn={api.fetchAccountTypes}
                saveFn={api.saveAccountType}
            />
        </div>
    );
};

export default BankMasterPage;