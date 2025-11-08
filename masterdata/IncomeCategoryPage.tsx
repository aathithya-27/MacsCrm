
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { IncomeCategory, IncomeHead, Company } from '../types';
import { useToast } from '../context/ToastContext';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchBar from '../components/ui/SearchBar';
import { Plus, Edit2 } from 'lucide-react';

type ModalType = 'category' | 'head';

interface IncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: ModalType, data: any) => void;
    modalConfig: {
        type: ModalType | null;
        item: Partial<IncomeCategory | IncomeHead> | null;
    };
    categories: IncomeCategory[];
}

const IncomeManagementModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onSave, modalConfig, categories }) => {
    const { type, item } = modalConfig;
    const [formData, setFormData] = useState<any>({});
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen && item) {
            setFormData({ ...item });
        } else if (isOpen) {
            setFormData({ status: 1 });
        }
    }, [isOpen, item]);
    
    const categoryOptions = useMemo(() => 
        categories
            .filter(c => c.status === 1)
            .map(c => ({ value: String(c.id), label: c.income_cate })), 
        [categories]
    );

    if (!isOpen || !type) {
        return null;
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        if (!type) return;

        const nameField = { category: 'income_cate', head: 'income_head' }[type];

        if (!formData[nameField]?.trim()) {
            addToast("Name is required.", "error");
            return;
        }
        if (type === 'head' && !formData.income_cate_id) {
            addToast("Income Category is required.", "error");
            return;
        }

        onSave(type, formData);
    };

    const nameField = { category: 'income_cate', head: 'income_head' }[type];
    const isNameDisabled = type === 'head' && !formData.income_cate_id;

    return (
        <Modal isOpen={isOpen} onClose={onClose} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={e => { e.preventDefault(); handleSaveClick(); }}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                        {}
                        {item?.id ? 'Edit' : 'Add'}{' '}
                        {({
                            category: 'Income Category',
                            head: 'Income Head Category',
                        })[type]}
                    </h2>
                    <div className="space-y-4">
                        {type === 'head' && (
                            <Select label="Income Category" value={formData.income_cate_id || ''} onChange={e => handleChange('income_cate_id', e.target.value ? Number(e.target.value) : null)} required>
                                <option value="">Select Category...</option>
                                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        )}
                        <Input
                            label="Name"
                            value={formData[nameField] || ''}
                            onChange={e => handleChange(nameField, e.target.value)}
                            required
                            autoFocus
                            disabled={isNameDisabled}
                        />
                    </div>
                </div>
                <footer className="flex justify-end gap-4 px-6 py-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="success">Save</Button>
                </footer>
            </form>
        </Modal>
    );
};


const IncomeCategoryPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);

    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
    const [incomeHeads, setIncomeHeads] = useState<IncomeHead[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: ModalType | null;
        item: Partial<IncomeCategory | IncomeHead> | null;
    }>({ isOpen: false, type: null, item: null });

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await api.fetchCurrentUser();
            const companies = await api.fetchCompanies();
            const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
            setCompanyData(currentCompany);

            if (currentCompany) {
                const [cats, heads] = await Promise.all([
                    api.fetchIncomeCategories(currentCompany.comp_id),
                    api.fetchIncomeHeads(currentCompany.comp_id),
                ]);
                setIncomeCategories(cats.data);
                setIncomeHeads(heads.data);
            }
        } catch (error) {
            console.error("Failed to load income data:", error);
            addToast("Failed to load income data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredCategories = useMemo(() => incomeCategories.filter(c => c.income_cate.toLowerCase().includes(searchQuery.toLowerCase())), [incomeCategories, searchQuery]);
    const filteredHeads = useMemo(() => incomeHeads.filter(h => h.income_head.toLowerCase().includes(searchQuery.toLowerCase())), [incomeHeads, searchQuery]);
    
    const openModal = (type: ModalType, item: any | null = null) => {
        setModalConfig({ isOpen: true, type, item });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, item: null });
    };

    const handleSave = async (type: ModalType, data: any) => {
        if (!canModify || !companyData) return;
        try {
            const payload = { ...data, comp_id: companyData.comp_id };
            switch (type) {
                case 'category':
                    const savedCat = await api.saveIncomeCategory(payload);
                    setIncomeCategories(prev => data.id ? prev.map(c => c.id === savedCat.id ? savedCat : c) : [...prev, savedCat]);
                    break;
                case 'head':
                    const savedHead = await api.saveIncomeHead(payload);
                    setIncomeHeads(prev => data.id ? prev.map(h => h.id === savedHead.id ? savedHead : h) : [...prev, savedHead]);
                    break;
            }
            addToast("Saved successfully.", "success");
            closeModal();
        } catch (error) {
            console.error("Failed to save:", error);
            addToast("Failed to save.", "error");
        }
    };
    
    const handleToggle = async (type: ModalType, item: any) => {
        if (!canModify) return;
        const newStatus = item.status === 1 ? 0 : 1;
        const updatedItem = { ...item, status: newStatus };
    
        try {
            if (type === 'category') {
                const category = item as IncomeCategory;
                const updatedHeads = incomeHeads
                    .filter(h => h.income_cate_id === category.id)
                    .map(h => ({ ...h, status: newStatus }));
                
                await Promise.all([
                    api.saveIncomeCategory(updatedItem),
                    ...updatedHeads.map(h => api.saveIncomeHead(h))
                ]);
    
                setIncomeCategories(prev => prev.map(c => c.id === category.id ? updatedItem : c));
                setIncomeHeads(prev => {
                    const updatedHeadIds = new Set(updatedHeads.map(uh => uh.id));
                    return prev.map(h => updatedHeadIds.has(h.id) ? { ...h, status: newStatus } : h);
                });
    
            } else if (type === 'head') {
                const savedHead = await api.saveIncomeHead(updatedItem);
                setIncomeHeads(prev => prev.map(h => h.id === savedHead.id ? savedHead : h));
            }
            
            addToast(newStatus === 0 && type === 'category' ? 'Category and associated heads deactivated.' : 'Status updated.');
        } catch (error) {
            console.error("Failed to update status:", error);
            addToast("Failed to update status.", "error");
        }
    };

    const renderTable = (type: ModalType, title: string, data: any[], nameField: string) => (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                {<Button onClick={() => openModal(type)} disabled={!canCreate}><Plus size={16} className="mr-2"/>Add New</Button>}
            </div>
            <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-16">S.No</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500">No data available.</td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{item[nameField]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggle(type, item)} disabled={!canModify}/></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(type, item)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading income data...</div>;
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
             <header>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Income Category Management</h2>
            </header>
            
            <main className="space-y-6">
                <SearchBar 
                    searchQuery={searchQuery} 
                    onSearchChange={setSearchQuery} 
                    placeholder="Search all categories..." 
                    className="max-w-md" 
                />
                
                {renderTable('category', 'Manage Income Category', filteredCategories, 'income_cate')}
                {renderTable('head', 'Manage Income Head Category', filteredHeads, 'income_head')}
            </main>
            
            <IncomeManagementModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onSave={handleSave}
                modalConfig={modalConfig}
                categories={incomeCategories}
            />
        </div>
    );
};

export default IncomeCategoryPage;