
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Gender, Member } from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2, GripVertical, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SearchBar from '../components/ui/SearchBar';

const GenderPage: React.FC = () => {
    const [genders, setGenders] = useState<Gender[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Gender> | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [itemToAction, setItemToAction] = useState<Gender | null>(null);
    const [dependentItems, setDependentItems] = useState<{ name: string; type: string }[]>([]);

    const canCreate = true;
    const canModify = true;
    const noun = "Gender";

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [data, membersData] = await Promise.all([
                api.fetchGenders(),
                api.fetchAllMembers()
            ]);
            setGenders(data.data);
            setMembers(membersData);
        } catch (error) {
            console.error("Failed to load data", error);
            addToast("Failed to load genders.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const sortedItems = useMemo(() => [...genders].sort((a, b) => a.seq_no - b.seq_no), [genders]);

    const filteredItems = useMemo(() =>
        searchQuery ? sortedItems.filter(item => item.gender_name.toLowerCase().includes(searchQuery.toLowerCase())) : sortedItems,
        [sortedItems, searchQuery]
    );

    const openModal = (item: Gender | null) => {
        setEditingItem(item ? { ...item } : { gender_name: '', status: 1 });
        setIsModalOpen(true);
    };
    
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const handleSave = async () => {
        if (!editingItem || !editingItem.gender_name?.trim()) {
            addToast(`${noun} name is required.`, "error");
            return;
        }
        try {
            await api.saveGender(editingItem);
            addToast(`${noun} ${editingItem.id ? 'updated' : 'created'} successfully.`);
            loadData();
            closeModal();
        } catch (error) {
            addToast(`Failed to save ${noun}.`, "error");
        }
    };
    
    const dependencyCheck = useCallback((id: number) => {
        return members
            .filter(member => member.gender_id === id)
            .map(member => ({ name: `Customer: ${member.name}`, type: 'member' as const }));
    }, [members]);

    const performToggle = async (id: number) => {
        const itemToToggle = genders.find(i => i.id === id);
        if (!itemToToggle) return;
        const updatedItem = { ...itemToToggle, status: itemToToggle.status === 1 ? 0 : 1 };
        try {
            await api.saveGender(updatedItem);
            addToast("Status updated.");
            loadData();
        } catch (error) {
            addToast("Failed to update status.", "error");
        }
    };

    const handleToggle = (item: Gender) => {
        if (item.status === 1) {
            const dependents = dependencyCheck(item.id);
            if (dependents.length > 0) {
                setItemToAction(item);
                setDependentItems(dependents);
                setIsWarningModalOpen(true);
                return;
            }
        }
        performToggle(item.id);
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        if (searchQuery) return;
        e.dataTransfer.setData('text/plain', id.toString());
        setDraggedItemId(id);
    };

    const handleDrop = async (e: React.DragEvent, dropTargetId: number) => {
        e.preventDefault();
        const currentDraggedItemId = draggedItemId;
        if (searchQuery || !currentDraggedItemId) return;
        setDraggedItemId(null);
        if (currentDraggedItemId === dropTargetId) return;

        const currentItems = [...sortedItems];
        const draggedIndex = currentItems.findIndex(item => item.id === currentDraggedItemId);
        const targetIndex = currentItems.findIndex(item => item.id === dropTargetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);
        const finalItems = currentItems.map((item, index) => ({ ...item, seq_no: index }));
        
        try {
            await Promise.all(finalItems.map(item => api.saveGender(item)));
            addToast("Order saved.");
            loadData();
        } catch (error) {
            addToast("Failed to save order.", "error");
            loadData();
        }
    };
    
    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading genders...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Manage Genders</h2>
            <div className="flex items-center justify-between mb-4">
                <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder={`Search ${noun}s...`} className="max-w-md" />
                <div className="flex-grow" />
                {canCreate && <Button onClick={() => openModal(null)}><Plus size={16}/> Add New {noun}</Button>}
            </div>
            <div className="flex-grow overflow-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-3 py-3 w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700" onDragEnd={() => setDraggedItemId(null)}>
                        {filteredItems.map((item, index) => (
                            <tr key={item.id} draggable={!searchQuery} onDragStart={e => handleDragStart(e, item.id)} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, item.id)}
                                className={`${!searchQuery ? 'cursor-grab' : ''} ${draggedItemId === item.id ? 'opacity-30' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/40`}>
                                <td className="px-3 py-4 text-center text-slate-400"><GripVertical size={16}/></td>
                                <td className="px-6 py-4 text-sm">{index + 1}</td>
                                <td className="px-6 py-4 font-medium">{item.gender_name}</td>
                                <td className="px-6 py-4"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggle(item)} disabled={!canModify} /></td>
                                <td className="px-6 py-4">
                                    <Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(item)} disabled={!canModify}><Edit2 size={14}/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{editingItem?.id ? 'Edit' : 'Add'} {noun}</h2>
                        <Input label={`${noun} Name`} value={editingItem?.gender_name || ''} onChange={e => setEditingItem(p => p ? {...p, gender_name: e.target.value} : null)} required autoFocus />
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                    </footer>
                </form>
            </Modal>
            
            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium">Deactivate "{itemToAction?.gender_name}"?</h3>
                        <p className="text-sm text-slate-500 mt-2">This item is used by {dependentItems.length} record(s) and deactivating it may cause issues.</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={() => { if(itemToAction) performToggle(itemToAction.id); setIsWarningModalOpen(false); }}>Deactivate Anyway</Button>
                    <Button variant="secondary" onClick={() => setIsWarningModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};

export default GenderPage;