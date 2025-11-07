import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { Bank, AccountType, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchBar from '../components/ui/SearchBar';
import { Plus, Edit2 } from 'lucide-react';

// Reusable component for managing a master data section (e.g., Banks or Account Types)
const ManagerSection = ({
    title,
    items,
    onSave,
    onToggleStatus,
    noun,
    nameField,
    canCreate,
    canModify
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const openModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = () => {
        onSave(editingItem);
        closeModal();
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                {
                    <Button onClick={() => openModal({ [nameField]: '', STATUS: 1 })} disabled={!canCreate}>
                        <Plus size={16} /> Add New {noun}
                    </Button>
                }
            </div>
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
                        {items.map((item, index) => (
                            <tr key={item.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 text-sm">{index + 1}</td>
                                <td className="px-4 py-2 font-medium">{item[nameField]}</td>
                                <td className="px-4 py-2">
                                    <ToggleSwitch
                                        enabled={item.STATUS === 1}
                                        onChange={() => onToggleStatus(item)}
                                        disabled={!canModify}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    {
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(item)} disabled={!canModify}>
                                            <Edit2 size={14} />
                                        </Button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">{editingItem?.ID ? 'Edit' : 'Add'} {noun}</h2>
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

    const [banks, setBanks] = useState<Bank[]>([]);
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);

    const [searchQuery, setSearchQuery] = useState('');

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
                    const [banksData, accountTypesData] = await Promise.all([
                        api.fetchBanks(),
                        api.fetchAccountTypes(),
                    ]);
                    const filterByComp = (item: any) => item.COMP_ID === currentCompany.COMP_ID;
                    setBanks(banksData.filter(filterByComp));
                    setAccountTypes(accountTypesData.filter(filterByComp));
                }
            } catch (error) {
                addToast("Failed to load data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);
    
    const filteredBanks = useMemo(() =>
        banks.filter(bank => bank.BANK_NAME.toLowerCase().includes(searchQuery.toLowerCase())),
        [banks, searchQuery]
    );

    const filteredAccountTypes = useMemo(() =>
        accountTypes.filter(type => type.ACCOUNT_TYPE_NAME.toLowerCase().includes(searchQuery.toLowerCase())),
        [accountTypes, searchQuery]
    );

    const handleSaveBank = async (item: Partial<Bank>) => {
        if (!item.BANK_NAME?.trim() || !companyData) {
            addToast("Bank Name is required.", "error");
            return;
        }
        try {
            const saved = await api.saveBank({ ...item, COMP_ID: companyData.COMP_ID });
            setBanks(prev => item.ID ? prev.map(b => b.ID === saved.ID ? saved : b) : [...prev, saved]);
            addToast(`Bank ${item.ID ? 'updated' : 'created'} successfully.`);
        } catch (error) {
            addToast("Failed to save bank.", "error");
        }
    };

    const handleToggleBankStatus = async (item: Bank) => {
        const updated = { ...item, STATUS: item.STATUS === 1 ? 0 : 1 };
        await handleSaveBank(updated);
    };

    const handleSaveAccountType = async (item: Partial<AccountType>) => {
        if (!item.ACCOUNT_TYPE_NAME?.trim() || !companyData) {
            addToast("Account Type Name is required.", "error");
            return;
        }
        try {
            const saved = await api.saveAccountType({ ...item, COMP_ID: companyData.COMP_ID });
            setAccountTypes(prev => item.ID ? prev.map(at => at.ID === saved.ID ? saved : at) : [...prev, saved]);
            addToast(`Account Type ${item.ID ? 'updated' : 'created'} successfully.`);
        } catch (error) {
            addToast("Failed to save account type.", "error");
        }
    };

    const handleToggleAccountTypeStatus = async (item: AccountType) => {
        const updated = { ...item, STATUS: item.STATUS === 1 ? 0 : 1 };
        await handleSaveAccountType(updated);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading Bank Master...</div>;
    }

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Bank Management</h2>
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Search banks or types..."
                    className="w-72"
                />
            </div>
            <ManagerSection
                title="Manage Bank Master"
                items={filteredBanks}
                onSave={handleSaveBank}
                onToggleStatus={handleToggleBankStatus}
                noun="Bank"
                nameField="BANK_NAME"
                canCreate={canCreate}
                canModify={canModify}
            />
            <ManagerSection
                title="Manage Account Types"
                items={filteredAccountTypes}
                onSave={handleSaveAccountType}
                onToggleStatus={handleToggleAccountTypeStatus}
                noun="Account Type"
                nameField="ACCOUNT_TYPE_NAME"
                canCreate={canCreate}
                canModify={canModify}
            />
        </div>
    );
};

export default BankMasterPage;