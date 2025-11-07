import React, { useState, useMemo, useRef } from 'react';
import { ProcessFlow, Member } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, GripVertical } from 'lucide-react';

interface ProcessStageManagerProps {
    title: string;
    items: ProcessFlow[];
    onUpdate: (items: ProcessFlow[]) => void;
    allMembers: Member[];
    canCreate: boolean;
    canModify: boolean;
    insuranceTypeId: number;
}

const ProcessStageManager: React.FC<ProcessStageManagerProps> = ({
    title, items, onUpdate, allMembers, canCreate, canModify, insuranceTypeId
}) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ProcessFlow> | null>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

    const sortedItems = useMemo(() => [...items].sort((a, b) => (a.SEQ_NO || 0) - (b.SEQ_NO || 0)), [items]);

    const openModal = (item: ProcessFlow | null, event?: React.MouseEvent<HTMLElement>) => {
        if (event) triggerButtonRef.current = event.currentTarget as HTMLButtonElement;
        setEditingItem(item ? { ...item } : { PROCESS_DESC: '', STATUS: 1 });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        triggerButtonRef.current?.focus();
    };

    const handleSave = () => {
        const isEditing = !!editingItem?.ID;
        if ((isEditing && !canModify) || (!isEditing && !canCreate)) {
            addToast("Permission denied: Company is inactive.", "error");
            return;
        }

        if (!editingItem || !editingItem.PROCESS_DESC?.trim()) {
            addToast('Stage name is required.', 'error');
            return;
        }

        if (editingItem.ID) { 
            onUpdate(items.map(i => i.ID === editingItem.ID ? (editingItem as ProcessFlow) : i));
            addToast("Stage updated successfully.");
        } else {
            const newItem: ProcessFlow = {
                ID: Date.now(),
                PROCESS_DESC: editingItem.PROCESS_DESC.trim(),
                STATUS: 1,
                SEQ_NO: items.length,
                COMP_ID: 1,
                CLIENT_ID: 101,
                INSURANCE_TYPE_ID: insuranceTypeId,
                REPEAT: false,
                CREATED_ON: new Date().toISOString(),
                CREATED_BY: 1,
                MODIFIED_ON: new Date().toISOString(),
                MODIFIED_BY: 1,
            };
            onUpdate([...items, newItem]);
            addToast("Stage created successfully.");
        }
        closeModal();
    };

    const handleToggle = (id: number) => {
        if (!canModify) return;
        onUpdate(items.map(i => i.ID === id ? { ...i, STATUS: i.STATUS === 1 ? 0 : 1 } : i));
        addToast("Status updated.");
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: number) => {
        e.dataTransfer.setData('text/plain', String(id));
        setDraggedItemId(id);
    };
    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => e.preventDefault();
    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropTargetId: number) => {
        e.preventDefault();
        const draggedId = Number(e.dataTransfer.getData('text/plain'));
        setDraggedItemId(null);
        if (draggedId === dropTargetId) return;

        const currentItems = [...sortedItems];
        const draggedIndex = currentItems.findIndex(item => item.ID === draggedId);
        const targetIndex = currentItems.findIndex(item => item.ID === dropTargetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);

        onUpdate(currentItems.map((item, index) => ({ ...item, SEQ_NO: index })));
        addToast("Order saved.");
    };
    const handleDragEnd = () => setDraggedItemId(null);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                {canCreate && <Button ref={triggerButtonRef} onClick={(e) => openModal(null, e)} variant="primary"><Plus size={16}/> Add Stage</Button>}
            </div>
            <div className="overflow-auto border dark:border-slate-700 rounded-lg max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                        <tr>
                            <th className="px-2 py-3"></th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase w-16">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700" onDragEnd={handleDragEnd}>
                        {sortedItems.map((item, index) => (
                            <tr
                                key={item.ID}
                                draggable={canModify}
                                onDragStart={e => handleDragStart(e, item.ID)}
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(e, item.ID)}
                                className={`transition-all ${item.STATUS === 0 ? 'opacity-60' : ''} ${draggedItemId === item.ID ? 'opacity-30' : ''} ${canModify ? 'hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-grab' : ''}`}
                            >
                                <td className="px-2 py-3"><GripVertical size={16} className="text-gray-400" /></td>
                                <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-3 font-medium">{item.PROCESS_DESC}</td>
                                <td className="px-6 py-3"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggle(item.ID)} disabled={!canModify}/></td>
                                <td className="px-6 py-3">
                                    <Button size="small" variant="light" className="!p-1.5" onClick={(e) => openModal(item, e)} disabled={!canModify}><Edit2 size={14}/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md text-gray-900 dark:text-gray-200">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-bold">{editingItem?.ID ? 'Edit' : 'Add'} Stage</h2>
                            <Input
                                label="Stage Name"
                                value={editingItem?.PROCESS_DESC || ''}
                                onChange={e => setEditingItem(p => p ? {...p, PROCESS_DESC: e.target.value} : null)}
                                disabled={!canModify}
                                autoFocus
                            />
                        </div>
                        <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                        </footer>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ProcessStageManager;