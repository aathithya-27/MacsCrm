import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as api from '../services/api';
import { CustomerCategory, CustomerSubCategory, CustomerGroup, CustomerType, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';
import { Plus, Edit2 } from 'lucide-react';

const CustomerSegmentPage: React.FC = () => {
    const { addToast } = useToast();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [categories, setCategories] = useState<CustomerCategory[]>([]);
    const [subCategories, setSubCategories] = useState<CustomerSubCategory[]>([]);
    const [groups, setGroups] = useState<CustomerGroup[]>([]);
    const [types, setTypes] = useState<CustomerType[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'cat' | 'subcat' | 'group' | 'type' | null;
        item: any | null;
    }>({ isOpen: false, type: null, item: null });
    const nameInputRef = useRef<HTMLInputElement>(null);

    const canCreate = company?.STATUS === 1;
    const canModify = company?.STATUS === 1;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await api.fetchCurrentUser();
            const companies = await api.fetchCompanies();
            const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
            setCompany(currentCompany);

            if(currentCompany) {
                const [cats, subcats, grps, typs] = await Promise.all([
                    api.fetchCustomerCategories(),
                    api.fetchCustomerSubCategories(),
                    api.fetchCustomerGroups(),
                    api.fetchCustomerTypes()
                ]);

                const filterByComp = (item: any) => item.COMP_ID === currentCompany.COMP_ID;
                setCategories(cats.filter(filterByComp));
                setSubCategories(subcats.filter(filterByComp));
                setGroups(grps.filter(filterByComp));
                setTypes(typs.filter(filterByComp));
            }
        } catch (error) {
            addToast("Failed to load customer segment data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => { loadData() }, [loadData]);
    
    const filteredCategories = useMemo(() => categories.filter(item => item.CUSTOMER_CATEGORY.toLowerCase().includes(searchQuery.toLowerCase())), [categories, searchQuery]);
    const filteredSubCategories = useMemo(() => subCategories.filter(item => item.CUST_SUB_CATE.toLowerCase().includes(searchQuery.toLowerCase())), [subCategories, searchQuery]);
    const filteredGroups = useMemo(() => groups.filter(item => item.CUSTOMER_GROUP.toLowerCase().includes(searchQuery.toLowerCase())), [groups, searchQuery]);
    const filteredTypes = useMemo(() => types.filter(item => item.CUST_TYPE.toLowerCase().includes(searchQuery.toLowerCase())), [types, searchQuery]);

    const openModal = (type: 'cat' | 'subcat' | 'group' | 'type', item: any | null) => {
        setModalState({ isOpen: true, type, item });
    };

    const closeModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = async () => {
        if (!modalState.type || !modalState.item || !company) return;

        const { type, item } = modalState;
        let nameField: string, saveFn: (data: any) => Promise<any>, stateSetter: Function;
        
        switch (type) {
            case 'cat': 
                nameField = 'CUSTOMER_CATEGORY'; saveFn = api.saveCustomerCategory; stateSetter = setCategories;
                break;
            case 'subcat':
                nameField = 'CUST_SUB_CATE'; saveFn = api.saveCustomerSubCategory; stateSetter = setSubCategories;
                if (!item.CUST_CATE_ID) { addToast("Parent Category is required.", "error"); return; }
                break;
            case 'group':
                nameField = 'CUSTOMER_GROUP'; saveFn = api.saveCustomerGroup; stateSetter = setGroups;
                break;
            case 'type':
                nameField = 'CUST_TYPE'; saveFn = api.saveCustomerType; stateSetter = setTypes;
                break;
        }

        if (!item[nameField]?.trim()) { addToast("Name is required.", "error"); return; }

        try {
            const payload = { ...item, COMP_ID: company.COMP_ID };
            const savedItem = await saveFn(payload);
            stateSetter((prev: any[]) => item.ID ? prev.map(i => i.ID === savedItem.ID ? savedItem : i) : [...prev, savedItem]);
            addToast("Item saved successfully.", "success");
            closeModal();
        } catch (error) {
            addToast("Failed to save item.", "error");
        }
    };
    
    const handleToggleStatus = async (type: 'cat' | 'subcat' | 'group' | 'type', item: any) => {
        const newStatus = item.STATUS === 1 ? 0 : 1;
        const updatedItem = { ...item, STATUS: newStatus };
    
        try {
            if (type === 'cat') {
                const category = item as CustomerCategory;
                const updatedSubCategories = subCategories
                    .filter(sc => sc.CUST_CATE_ID === category.ID)
                    .map(sc => ({ ...sc, STATUS: newStatus }));
    
                await Promise.all([
                    api.saveCustomerCategory(updatedItem),
                    ...updatedSubCategories.map(sc => api.saveCustomerSubCategory(sc))
                ]);
    
                setCategories(prev => prev.map(c => c.ID === category.ID ? updatedItem : c));
                setSubCategories(prev => {
                    const updatedSubCatIds = new Set(updatedSubCategories.map(usc => usc.ID));
                    return prev.map(sc => updatedSubCatIds.has(sc.ID) ? { ...sc, STATUS: newStatus } : sc);
                });
                
                addToast(newStatus === 0 ? 'Category and associated sub-categories deactivated.' : 'Status updated.');
            } else {
                let saveFn: (data: any) => Promise<any>, stateSetter: Function;
                switch (type) {
                    case 'subcat': saveFn = api.saveCustomerSubCategory; stateSetter = setSubCategories; break;
                    case 'group': saveFn = api.saveCustomerGroup; stateSetter = setGroups; break;
                    case 'type': saveFn = api.saveCustomerType; stateSetter = setTypes; break;
                    default: return;
                }
                const savedItem = await saveFn(updatedItem);
                stateSetter((prev: any[]) => prev.map(i => i.ID === savedItem.ID ? savedItem : i));
                addToast("Status updated.", "success");
            }
        } catch (error) {
            addToast("Failed to update status.", "error");
        }
    };

    const renderSegmentManager = (
        title: string,
        typeKey: 'cat' | 'subcat' | 'group' | 'type',
        items: any[],
        nameField: string,
    ) => {
        return (
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                     <Button onClick={() => openModal(typeKey, { STATUS: 1 })} className="flex-shrink-0" disabled={!canCreate}>
                        <Plus size={16} /> Add New
                    </Button>
                </div>
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                    <table className="min-w-full">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold w-16">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-bold">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-bold w-24">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {items.map((item, index) => (
                                <tr key={item.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{item[nameField]}</td>
                                    <td className="px-4 py-2">
                                        <ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggleStatus(typeKey, item)} disabled={!canModify} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(typeKey, item)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    const { type, item } = modalState;
    let modalTitle = '';
    let nameLabel = '';
    let nameField = '';
    if (type) {
        switch(type) {
            case 'cat': modalTitle = 'Customer Category'; nameLabel="Category Name"; nameField="CUSTOMER_CATEGORY"; break;
            case 'subcat': modalTitle = 'Customer Sub-Category'; nameLabel="Sub-Category Name"; nameField="CUST_SUB_CATE"; break;
            case 'group': modalTitle = 'Customer Group'; nameLabel="Group Name"; nameField="CUSTOMER_GROUP"; break;
            case 'type': modalTitle = 'Customer Type'; nameLabel="Type Name"; nameField="CUST_TYPE"; break;
        }
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Customer Segment Management</h2>
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder="Search across all segments..."
                className="max-w-md"
            />
            {renderSegmentManager('Manage Customer Category', 'cat', filteredCategories, 'CUSTOMER_CATEGORY')}
            {renderSegmentManager('Manage Customer Sub-Category', 'subcat', filteredSubCategories, 'CUST_SUB_CATE')}
            {renderSegmentManager('Manage Customer Group', 'group', filteredGroups, 'CUSTOMER_GROUP')}
            {renderSegmentManager('Manage Customer Type', 'type', filteredTypes, 'CUST_TYPE')}
            
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
                initialFocusRef={nameInputRef}
            >
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6">{modalState.item?.ID ? 'Edit' : 'Add'} {modalTitle}</h2>
                        <div className="space-y-4">
                            <Input
                                ref={nameInputRef}
                                label={nameLabel}
                                value={item?.[nameField] || ''}
                                onChange={e => setModalState(s => ({...s, item: {...s.item, [nameField]: e.target.value}}))}
                                required
                                disabled={!canModify}
                            />
                            {type === 'subcat' && (
                                <Select
                                    label="Parent Category"
                                    value={item?.CUST_CATE_ID || ''}
                                    onChange={e => setModalState(s => ({...s, item: {...s.item, CUST_CATE_ID: Number(e.target.value)}}))}
                                    required
                                    disabled={!canModify}
                                >
                                    <option value="">Select...</option>
                                    {categories.filter(c => c.STATUS === 1).map(c => (
                                        <option key={c.ID} value={c.ID}>{c.CUSTOMER_CATEGORY}</option>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                    </footer>
                </form>
            </Modal>
        </div>
    );
};

export default CustomerSegmentPage;