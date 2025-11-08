
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

    const sortedItems = useMemo(() => [...items].sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0)), [items]);

    const openModal = (item: ProcessFlow | null, event?: React.MouseEvent<HTMLElement>) => {
        if (event) triggerButtonRef.current = event.currentTarget as HTMLButtonElement;
        setEditingItem(item ? { ...item } : { process_desc: '', status: 1 });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        triggerButtonRef.current?.focus();
    };

    const handleSave = () => {
        const isEditing = !!editingItem?.id;
        if ((isEditing && !canModify) || (!isEditing && !canCreate)) {
            addToast("Permission denied: Company is inactive.", "error");
            return;
        }

        if (!editingItem || !editingItem.process_desc?.trim()) {
            addToast('Stage name is required.', 'error');
            return;
        }

        if (editingItem.id) { 
            onUpdate(items.map(i => i.id === editingItem.id ? (editingItem as ProcessFlow) : i));
            addToast("Stage updated successfully.");
        } else {
            const newItemPayload: Partial<ProcessFlow> = {
                process_desc: editingItem.process_desc.trim(),
                status: 1,
                seq_no: items.length,
                insurance_type_id: insuranceTypeId,
                repeat: false,
            };
            onUpdate([...items, newItemPayload as ProcessFlow]);
            addToast("Stage created successfully.");
        }
        closeModal();
    };

    const handleToggle = (id: number) => {
        if (!canModify) return;
        onUpdate(items.map(i => i.id === id ? { ...i, status: i.status === 1 ? 0 : 1 } : i));
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
        const draggedIndex = currentItems.findIndex(item => item.id === draggedId);
        const targetIndex = currentItems.findIndex(item => item.id === dropTargetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);

        onUpdate(currentItems.map((item, index) => ({ ...item, seq_no: index })));
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
                                key={item.id}
                                draggable={canModify}
                                onDragStart={e => handleDragStart(e, item.id)}
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(e, item.id)}
                                className={`transition-all ${item.status === 0 ? 'opacity-60' : ''} ${draggedItemId === item.id ? 'opacity-30' : ''} ${canModify ? 'hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-grab' : ''}`}
                            >
                                <td className="px-2 py-3"><GripVertical size={16} className="text-gray-400" /></td>
                                <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                                {}
                                <td className="px-6 py-3 font-medium">{item.process_desc}</td>
                                {}
                                <td className="px-6 py-3"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggle(item.id)} disabled={!canModify}/></td>
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
                            {}
                            <h2 className="text-xl font-bold">{editingItem?.id ? 'Edit' : 'Add'} Stage</h2>
                            <Input
                                label="Stage Name"
                                value={editingItem?.process_desc || ''}
                                onChange={e => setEditingItem(p => p ? {...p, process_desc: e.target.value} : null)}
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