import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RelationshipType, Company } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2, GripVertical, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';

const RelationshipMasterPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<RelationshipType> | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

    const canCreate = companyData?.STATUS === 1;
    const canModify = companyData?.STATUS === 1;
    const noun = "Relationship Type";

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await api.fetchCurrentUser();
            const companies = await api.fetchCompanies();
            const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
            setCompanyData(currentCompany);

            if (currentCompany) {
                const data = await api.fetchRelationshipTypes();
                setRelationshipTypes(data.filter(rt => rt.COMP_ID === currentCompany.COMP_ID));
            } else {
                setRelationshipTypes([]);
            }
        } catch (error) {
            console.error("Failed to load data", error);
            addToast("Failed to load relationship types.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdate = async (updatedData: RelationshipType[], message?: string) => {
        try {
            const saved = await api.onUpdateRelationshipTypes(updatedData);
            setRelationshipTypes(saved);
            if(message) addToast(message);
        } catch(error) {
            console.error("Failed to update data", error);
            addToast("Failed to update data.", "error");
        }
    };

    const sortedItems = useMemo(() => [...relationshipTypes].sort((a, b) => a.SEQ_NO - b.SEQ_NO), [relationshipTypes]);

    const filteredItems = useMemo(() =>
        searchQuery ? sortedItems.filter(item => item.RELATIONSHIP_NAME.toLowerCase().includes(searchQuery.toLowerCase())) : sortedItems,
        [sortedItems, searchQuery]
    );

    const openModal = (item: RelationshipType | null) => {
        setEditingItem(item ? { ...item } : { RELATIONSHIP_NAME: '', STATUS: 1 });
        setIsModalOpen(true);
    };
    
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = () => {
        if (!editingItem || !editingItem.RELATIONSHIP_NAME?.trim() || !companyData) {
            addToast("Relationship name is required.", "error");
            return;
        }

        let updatedItems;
        let message;
        if (editingItem.ID) {
            updatedItems = relationshipTypes.map(i => i.ID === editingItem.ID ? { ...i, ...editingItem } as RelationshipType : i);
            message = `${noun} updated successfully.`;
        } else {
            const newItem: RelationshipType = {
                ID: Date.now(),
                SEQ_NO: relationshipTypes.length,
                RELATIONSHIP_NAME: editingItem.RELATIONSHIP_NAME,
                STATUS: editingItem.STATUS ?? 1,
                COMP_ID: companyData.COMP_ID,
                CREATED_ON: new Date().toISOString(),
                MODIFIED_ON: new Date().toISOString(),
                CREATED_BY: 1,
                MODIFIED_BY: 1,
            };
            updatedItems = [...relationshipTypes, newItem];
            message = `${noun} created successfully.`;
        }
        handleUpdate(updatedItems, message);
        closeModal();
    };
    
    const handleToggle = (id: number) => {
        const updatedItems = relationshipTypes.map(i => i.ID === id ? { ...i, STATUS: i.STATUS === 1 ? 0 : 1 } : i);
        handleUpdate(updatedItems, "Status updated.");
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        if (searchQuery || !canModify) return;
        e.dataTransfer.setData('text/plain', id.toString());
        setDraggedItemId(id);
    };

    const handleDrop = (e: React.DragEvent, dropTargetId: number) => {
        e.preventDefault();
        if (searchQuery || !draggedItemId || !canModify) return;
        setDraggedItemId(null);
        if (draggedItemId === dropTargetId) return;

        const currentItems = [...sortedItems];
        const draggedIndex = currentItems.findIndex(item => item.ID === draggedItemId);
        const targetIndex = currentItems.findIndex(item => item.ID === dropTargetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);
        const finalItems = currentItems.map((item, index) => ({ ...item, SEQ_NO: index }));
        handleUpdate(finalItems, "Order saved.");
    };
    
    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading relationship types...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Manage Relationship Types</h2>
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
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            {filteredItems.map((item, index) => (
                                <tr key={item.ID} draggable={!searchQuery && canModify} onDragStart={e => handleDragStart(e, item.ID)} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, item.ID)}
                                    className={`${!searchQuery && canModify ? 'cursor-grab' : ''} ${draggedItemId === item.ID ? 'opacity-30' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/40`}>
                                    <td className="px-3 py-4 text-center text-slate-400"><GripVertical size={16}/></td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.RELATIONSHIP_NAME}</td>
                                    <td className="px-6 py-4"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggle(item.ID)} disabled={!canModify} /></td>
                                    <td className="px-6 py-4">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(item)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem?.ID ? 'Edit' : 'Add'} {noun}</h2>
                        <Input label={`${noun} Name`} value={editingItem?.RELATIONSHIP_NAME || ''} onChange={e => setEditingItem(p => p ? {...p, RELATIONSHIP_NAME: e.target.value} : null)} required autoFocus disabled={!canModify} />
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

export default RelationshipMasterPage;