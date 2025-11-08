
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import { CustomerTier, Gift, CustomerType, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, GripVertical, Search } from 'lucide-react';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';


const TierRuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (tierData: Partial<CustomerTier>) => void;
    initialData: Partial<CustomerTier> | null;
    tiers: CustomerTier[];
    customerTypes: CustomerType[];
    gifts: Gift[];
    mode: 'sumAssured' | 'premium' | 'edit';
    canModify: boolean;
}> = ({ isOpen, onClose, onSave, initialData, tiers, customerTypes, gifts, mode, canModify }) => {
    const [formData, setFormData] = useState<Partial<CustomerTier>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { cust_type_id: undefined, minimum_sum_assured: 0, minimum_premium: 0, assigned_gift_id: undefined, status: 1 });
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof CustomerTier, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumericChange = (field: 'minimum_sum_assured' | 'minimum_premium', value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        handleChange(field, numericValue === '' ? 0 : Number(numericValue));
    };

    const handleSaveClick = () => {
        if (!formData.cust_type_id) {
            alert('A Customer Type must be selected.');
            return;
        }
        onSave(formData as CustomerTier);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{initialData?.id ? 'Edit' : 'Add'} Tier Rule</h2>
                    <div className="space-y-4">
                        <Select
                            label="Customer Type"
                            value={formData.cust_type_id || ''}
                            onChange={e => handleChange('cust_type_id', Number(e.target.value))}
                            disabled={!canModify || !!initialData?.id}
                            required
                        >
                            <option value="">-- Select a Type --</option>
                            {customerTypes.filter(ct => ct.status === 1).map(type => {
                                const isUsed = tiers.some(t => t.cust_type_id === type.id && t.id !== initialData?.id);
                                return (
                                    <option key={type.id} value={type.id} disabled={isUsed} className={isUsed ? 'text-slate-400 dark:text-slate-500' : ''}>
                                        {type.cust_type} {isUsed ? '(In Use)' : ''}
                                    </option>
                                );
                            })}
                        </Select>

                        {(mode === 'sumAssured' || mode === 'edit') && (
                            <Input label="Minimum Sum Assured (₹)" type="text" inputMode="numeric" value={formData.minimum_sum_assured === 0 ? '' : String(formData.minimum_sum_assured || '')} onChange={e => handleNumericChange('minimum_sum_assured', e.target.value)} placeholder="e.g., 50000" disabled={!canModify} />
                        )}

                        {(mode === 'premium' || mode === 'edit') && (
                            <Input label="Minimum Premium (₹)" type="text" inputMode="numeric" value={formData.minimum_premium === 0 ? '' : String(formData.minimum_premium || '')} onChange={e => handleNumericChange('minimum_premium', e.target.value)} placeholder="e.g., 5000" disabled={!canModify} />
                        )}

                        <Select label="Assign Gift" value={formData.assigned_gift_id || ''} onChange={e => handleChange('assigned_gift_id', e.target.value ? Number(e.target.value) : null)} disabled={!canModify}>
                            <option value="">-- No Gift --</option>
                            {gifts.filter(g => g.status === 1).map(gift => <option key={gift.id} value={gift.id}>{gift.gift_name}</option>)}
                        </Select>
                    </div>
                </div>
                <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={!canModify}>Save Tier</Button>
                </footer>
            </form>
        </Modal>
    );
};

const TierAndGiftPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [tiers, setTiers] = useState<CustomerTier[]>([]);
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isTierModalOpen, setIsTierModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<Partial<CustomerTier> | null>(null);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<Partial<Gift> | null>(null);
    
    const [draggedTierId, setDraggedTierId] = useState<number | null>(null);
    const [tierModalMode, setTierModalMode] = useState<'sumAssured' | 'premium' | 'edit'>('edit');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [giftSearchQuery, setGiftSearchQuery] = useState('');

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
                const [tiersData, giftsData, customerTypesData] = await Promise.all([
                    api.fetchCustomerTiers(currentCompany.comp_id),
                    api.fetchGifts(currentCompany.comp_id),
                    api.fetchCustomerTypes(currentCompany.comp_id)
                ]);
                setTiers(tiersData.data);
                setGifts(giftsData.data);
                setCustomerTypes(customerTypesData.data);
            }
        } catch (error) {
            addToast("Failed to load data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);


    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const customerTypeMap = useMemo(() => new Map(customerTypes.map(ct => [ct.id, ct.cust_type])), [customerTypes]);

    const sortedTiers = useMemo(() => {
        const filtered = tiers.filter(tier => {
            const typeName = customerTypeMap.get(tier.cust_type_id) || '';
            return typeName.toLowerCase().includes(searchQuery.toLowerCase());
        });
        return [...filtered].sort((a, b) => (a.seq_no ?? 0) - (b.seq_no ?? 0))
    }, [tiers, searchQuery, customerTypeMap]);

    const sortedGifts = useMemo(() => {
        const filtered = gifts.filter(gift => gift.gift_name.toLowerCase().includes(giftSearchQuery.toLowerCase()));
        return [...filtered].sort((a, b) => (a.seq_no ?? 0) - (b.seq_no ?? 0));
    }, [gifts, giftSearchQuery]);
    
    const openTierModal = (tier: CustomerTier | null, mode: 'sumAssured' | 'premium' | 'edit') => {
        setEditingTier(tier ? { ...tier } : { minimum_sum_assured: 0, minimum_premium: 0, assigned_gift_id: null, status: 1 });
        setTierModalMode(mode);
        setIsTierModalOpen(true);
    };

    const closeTierModal = () => {
        setIsTierModalOpen(false);
        setEditingTier(null);
    }

    const handleSaveTier = async (tierData: Partial<CustomerTier>) => {
        if (!canModify || !companyData) return;
        
        try {
            const savedTier = await api.saveCustomerTier({ ...tierData, comp_id: companyData.comp_id });
            setTiers(prev => tierData.id ? prev.map(t => t.id === savedTier.id ? savedTier : t) : [...prev, savedTier]);
            addToast("Tier rule saved successfully.", "success");
            closeTierModal();
        } catch(e) {
            addToast("Failed to save tier rule.", "error");
        }
    };

    const handleToggleTier = async (tier: CustomerTier) => {
        if (!canModify) return;
        const updatedTier = {...tier, status: tier.status === 1 ? 0 : 1};
        const savedTier = await api.saveCustomerTier(updatedTier);
        setTiers(tiers.map(t => t.id === savedTier.id ? savedTier : t));
    };

    const openGiftModal = (gift: Gift | null) => {
        setEditingGift(gift ? { ...gift } : { gift_name: '', status: 1 });
        setIsGiftModalOpen(true);
    };

    const closeGiftModal = () => setIsGiftModalOpen(false);

    const handleSaveGift = async () => {
        if (!canModify || !editingGift?.gift_name?.trim() || !companyData) {
            addToast('Gift name is required.', 'error');
            return;
        }

        try {
            const savedGift = await api.saveGift({ ...editingGift, comp_id: companyData.comp_id });
            setGifts(prev => editingGift.id ? prev.map(g => g.id === savedGift.id ? savedGift : g) : [...prev, savedGift]);
            addToast("Gift saved successfully.", "success");
            closeGiftModal();
        } catch(e) {
            addToast("Failed to save gift.", "error");
        }
    };

    const handleToggleGift = async (gift: Gift) => {
        if (!canModify) return;
        const updatedGift = {...gift, status: gift.status === 1 ? 0 : 1};
        const savedGift = await api.saveGift(updatedGift);
        setGifts(gifts.map(g => g.id === savedGift.id ? savedGift : g));
    };

    const handleTierDrop = async (e: React.DragEvent<HTMLTableRowElement>, dropTargetId: number) => {
        e.preventDefault();
        const currentDraggedId = draggedTierId;
        if (!currentDraggedId) return;

        setDraggedTierId(null);
        if (currentDraggedId === dropTargetId) return;

        const currentItems = [...sortedTiers];
        const draggedIndex = currentItems.findIndex(item => item.id === currentDraggedId);
        const targetIndex = currentItems.findIndex(item => item.id === dropTargetId);

        const [draggedItem] = currentItems.splice(draggedIndex, 1);
        currentItems.splice(targetIndex, 0, draggedItem);

        const reordered = currentItems.map((item, index) => ({ ...item, seq_no: index }));
        
        try {
            await Promise.all(reordered.map(tier => api.saveCustomerTier(tier)));
            setTiers(reordered);
            addToast("Tier order saved.");
        } catch (error) {
            addToast("Failed to save tier order.", "error");
            loadData();
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

    const renderTierTable = (mode: 'sumAssured' | 'premium') => {
        const title = mode === 'sumAssured' ? "Customer Type (by Sum Assured)" : "Customer Type (by Premium)";
        const valueField = mode === 'sumAssured' ? 'minimum_sum_assured' : 'minimum_premium';
        const valueHeader = mode === 'sumAssured' ? 'Min. Sum Assured (₹)' : 'Min. Premium (₹)';
        
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    {<Button variant="primary" onClick={() => openTierModal(null, mode)} disabled={!canCreate}><Plus size={16}/> Add Tier</Button>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"><tr>
                            <th className="py-3 px-2 w-8"></th>
                            <th className="py-3 px-2 text-xs font-bold uppercase">Type Name</th>
                            <th className="py-3 px-2 text-xs font-bold uppercase whitespace-nowrap text-right">{valueHeader}</th>
                            <th className="py-3 px-2 text-xs font-bold uppercase">Assigned Gift</th>
                            <th className="py-3 px-2 text-center text-xs font-bold uppercase">Status</th>
                            <th className="py-3 px-2 text-center text-xs font-bold uppercase">Actions</th>
                        </tr></thead>
                        <tbody onDragEnd={() => setDraggedTierId(null)}>
                            {sortedTiers.map(tier => (
                                <tr key={tier.id} draggable={canModify} onDragStart={() => setDraggedTierId(tier.id)} onDragOver={e => e.preventDefault()} onDrop={e => handleTierDrop(e, tier.id)} className={`border-b border-slate-200 dark:border-slate-700 ${canModify ? 'cursor-grab' : ''} ${draggedTierId === tier.id ? 'opacity-50' : ''}`}>
                                    <td className="py-3 px-2"><GripVertical size={16} className="text-slate-400"/></td>
                                    <td className="py-3 px-2 font-medium">{customerTypeMap.get(tier.cust_type_id)}</td>
                                    <td className="py-3 px-2 text-right">{tier[valueField]?.toLocaleString('en-IN') || '-'}</td>
                                    <td className="py-3 px-2">{gifts.find(g => g.id === tier.assigned_gift_id)?.gift_name || <span className="text-slate-500 italic">None</span>}</td>
                                    <td className="py-3 px-2 text-center"><ToggleSwitch enabled={tier.status === 1} onChange={() => handleToggleTier(tier)} disabled={!canModify}/></td>
                                    <td className="py-3 px-2 text-center"><Button size="small" variant="light" className="!p-1.5" onClick={() => openTierModal(tier, 'edit')} disabled={!canModify}><Edit2 size={14}/></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tier & Gift Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define Customer Types based on sum assured or premium, and manage the gifts associated with them.</p>
            </div>

            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search tier types..." className="w-full md:w-1/2" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderTierTable('sumAssured')}
                {renderTierTable('premium')}

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Master Gift List</h3>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <SearchBar searchQuery={giftSearchQuery} onSearchChange={setGiftSearchQuery} placeholder="Search gifts..." className="w-full md:w-64" />
                            {<Button variant="primary" onClick={() => openGiftModal(null)} disabled={!canCreate}><Plus size={16}/> Add Gift</Button>}
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-80 pr-2">
                        <div className="space-y-2">
                            {sortedGifts.map(gift => (
                                <div key={gift.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <span className={`text-sm ${gift.status === 0 ? 'line-through text-slate-500' : ''}`}>{gift.gift_name}</span>
                                    <div className="flex items-center justify-end gap-3">
                                        <ToggleSwitch enabled={gift.status === 1} onChange={() => handleToggleGift(gift)} disabled={!canModify}/>
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openGiftModal(gift)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <TierRuleModal isOpen={isTierModalOpen} onClose={closeTierModal} onSave={handleSaveTier} initialData={editingTier} tiers={tiers} customerTypes={customerTypes} gifts={gifts} mode={tierModalMode} canModify={canModify} />

            {isGiftModalOpen && (
                <Modal isOpen={isGiftModalOpen} onClose={closeGiftModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveGift()}}>
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingGift?.id ? 'Edit' : 'Add'} Gift</h2>
                            <Input label="Gift Name" value={editingGift?.gift_name || ''} onChange={e => setEditingGift(p => p ? {...p, gift_name: e.target.value} : null)} disabled={!canModify} autoFocus/>
                        </div>
                        <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                            <Button type="button" variant="secondary" onClick={closeGiftModal}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={!canModify}>Save Gift</Button>
                        </footer>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default TierAndGiftPage;