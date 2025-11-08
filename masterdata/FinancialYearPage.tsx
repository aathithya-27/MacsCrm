
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { FinancialYear, DocumentNumberingRule, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2 } from 'lucide-react';
import SearchBar from '../components/ui/SearchBar';
import Select from '../components/ui/Select';


const DocNumRuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<DocumentNumberingRule>) => void;
    initialData: Partial<DocumentNumberingRule> | null;
    financialYears: FinancialYear[];
    canModify: boolean;
}> = ({ isOpen, onClose, onSave, initialData, financialYears, canModify }) => {
    const [formData, setFormData] = useState<Partial<DocumentNumberingRule>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { starting_no: 1 });
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof DocumentNumberingRule, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        if (!formData.prefix?.trim() || !formData.fin_year_id) {
            alert('Prefix and Financial Year are required.');
            return;
        }
        if (isNaN(formData.starting_no as number) || (formData.starting_no as number) < 1) {
            alert('Starting Number must be a valid number of 1 or greater.');
            return;
        }

        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
            <form onSubmit={e => { e.preventDefault(); handleSaveClick(); }}>
                <header className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{initialData?.id ? 'Edit' : 'Add'} {initialData?.type} Rule</h2>
                </header>
                <div className="p-6 space-y-4">
                    <Input label="Prefix (Kword)" value={formData.prefix || ''} onChange={e => handleChange('prefix', e.target.value)} placeholder="e.g., VCH/25-26/" required disabled={!canModify}/>
                    <Input label="Suffix (Optional)" value={formData.suffix || ''} onChange={e => handleChange('suffix', e.target.value)} placeholder="e.g., /FIN" disabled={!canModify}/>
                    <Input label="Starting Number" type="number" value={String(formData.starting_no || '1')} onChange={e => handleChange('starting_no', Number(e.target.value))} required disabled={!canModify} />
                    <Select label="Financial Year" value={formData.fin_year_id || ''} onChange={e => handleChange('fin_year_id', Number(e.target.value))} required disabled={!canModify || !!initialData?.id}>
                        <option value="" disabled>Select FY</option>
                        {financialYears.filter(fy => fy.status === 1).map(fy => <option key={fy.id} value={fy.id}>{fy.fin_year}</option>)}
                    </Select>
                </div>
                <footer className="flex justify-end p-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="success" disabled={!canModify}>Save Rule</Button>
                </footer>
            </form>
        </Modal>
    );
};


const FinancialYearPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
    const [docNumRules, setDocNumRules] = useState<DocumentNumberingRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedFinYearId, setSelectedFinYearId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isFYModalOpen, setIsFYModalOpen] = useState(false);
    const [editingFY, setEditingFY] = useState<Partial<FinancialYear> | null>(null);
    const [isDocNumModalOpen, setIsDocNumModalOpen] = useState(false);
    const [editingDocNum, setEditingDocNum] = useState<Partial<DocumentNumberingRule> | null>(null);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    const loadData = useCallback(async () => {
        if (!companyData) return;
        setIsLoading(true);
        try {
            const [fyData, ruleData] = await Promise.all([
                api.fetchFinancialYears(companyData.comp_id),
                api.fetchDocumentNumberingRules(companyData.comp_id),
            ]);
            
            const companyFYs = fyData.data;
            setFinancialYears(companyFYs);
            setDocNumRules(ruleData.data);

            if (!selectedFinYearId && companyFYs.length > 0) {
                const firstActive = companyFYs.find(fy => fy.status === 1) || companyFYs[0];
                setSelectedFinYearId(firstActive.id);
            }
        } catch (error) {
            console.error("Failed to load data", error);
            addToast("Failed to load financial year data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast, companyData, selectedFinYearId]);
    
    useEffect(() => {
        const loadCompany = async () => {
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
                setCompanyData(currentCompany);
            } catch (e) {
                 addToast("Failed to load company data.", "error");
            }
        }
        loadCompany();
    }, [addToast]);
    
    useEffect(() => {
        if (companyData) {
            const debounceTimer = setTimeout(() => loadData(), 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [searchQuery, companyData, loadData]);


    const filteredFinancialYears = useMemo(() => {
        return financialYears.filter(fy => fy.fin_year.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [financialYears, searchQuery]);

    const voucherNumberingRule = useMemo(() => docNumRules.find(dn => dn.fin_year_id === selectedFinYearId && dn.type === 'Voucher'), [docNumRules, selectedFinYearId]);
    const receiptNumberingRule = useMemo(() => docNumRules.find(dn => dn.fin_year_id === selectedFinYearId && dn.type === 'Receipt'), [docNumRules, selectedFinYearId]);

    const openFYModal = (item: FinancialYear | null) => {
        setEditingFY(item ? { ...item } : { fin_year: '', from_date: '', to_date: '', status: 1 });
        setIsFYModalOpen(true);
    };
    const closeFYModal = () => setIsFYModalOpen(false);

    const handleSaveFY = async () => {
        if (!editingFY || !editingFY.fin_year?.trim() || !editingFY.from_date || !editingFY.to_date || !companyData) {
            addToast('All fields are required.', 'error');
            return;
        }
        if (new Date(editingFY.from_date) >= new Date(editingFY.to_date)) {
            addToast('"From Date" must be earlier than "To Date".', 'error');
            return;
        }

        try {
            await api.saveFinancialYear({ ...editingFY, comp_id: companyData.comp_id });
            addToast("Financial Year saved.", "success");
            loadData();
            closeFYModal();
        } catch (error) {
            addToast("Failed to save Financial Year.", "error");
        }
    };

    const handleToggleFYStatus = async (fy: FinancialYear) => {
        const newStatus = fy.status === 1 ? 0 : 1;
        
        try {
            await api.saveFinancialYear({ ...fy, status: newStatus });
            
            const rulesToUpdate = docNumRules
                .filter(rule => rule.fin_year_id === fy.id)
                .map(rule => ({ ...rule, status: newStatus }));

            if(rulesToUpdate.length > 0) {
                 await Promise.all(rulesToUpdate.map(rule => api.saveDocumentNumberingRule(rule)));
            }
            
            addToast('Financial Year and its rules have been updated.');
            loadData();
        } catch(e) {
            addToast("Failed to update status.", "error");
        }
    };
    
    const openDocNumModal = (type: 'Voucher' | 'Receipt', item: DocumentNumberingRule | null) => {
        setEditingDocNum(item ? { ...item } : { type: type, prefix: '', starting_no: 1, fin_year_id: selectedFinYearId!, status: 1, suffix: null });
        setIsDocNumModalOpen(true);
    };

    const handleSaveDocNum = async (dataToSave: Partial<DocumentNumberingRule>) => {
        if (!canModify || !companyData) return;

        try {
            await api.saveDocumentNumberingRule({ ...dataToSave, comp_id: companyData.comp_id });
            addToast("Numbering rule saved.", "success");
            loadData();
            setIsDocNumModalOpen(false);
        } catch (error) {
            addToast("Failed to save numbering rule.", "error");
        }
    };
    
    const handleToggleRuleStatus = async (rule: DocumentNumberingRule) => {
        const updatedRule = { ...rule, status: rule.status === 1 ? 0 : 1 };
        try {
            await api.saveDocumentNumberingRule(updatedRule);
            addToast("Rule status updated.", "success");
            loadData();
        } catch (error) {
            addToast("Failed to update rule status.", "error");
        }
    };

    const DocNumTable: React.FC<{title: string, type: 'Voucher' | 'Receipt', item: DocumentNumberingRule | undefined}> = ({title, type, item}) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                {!item && <Button variant="primary" onClick={() => openDocNumModal(type, null)} disabled={!selectedFinYearId || !canCreate}><Plus size={16}/> Add Rule</Button>}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b-2 border-slate-200 dark:border-slate-700"><tr>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Prefix (Kword)</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Suffix</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Start No.</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                    </tr></thead>
                    <tbody>
                        {item ? (
                            <tr>
                                <td className="px-4 py-3 font-mono">{item.prefix}</td>
                                <td className="px-4 py-3 font-mono">{item.suffix || 'N/A'}</td>
                                <td className="px-4 py-3">{item.starting_no}</td>
                                <td className="px-4 py-3"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleRuleStatus(item)} disabled={!canModify}/></td>
                                <td className="px-4 py-3"><Button size="small" variant="light" className="!p-1.5" onClick={() => openDocNumModal(type, item)} disabled={!canModify}><Edit2 size={14}/></Button></td>
                            </tr>
                        ) : (
                            <tr><td colSpan={5} className="text-center py-6 text-slate-500 dark:text-slate-400">No rule configured for this Financial Year.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (isLoading && !companyData) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Financial Year Management</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Manage Financial Year</h3>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search by year label..." className="w-full md:w-64"/>
                        {<Button onClick={() => openFYModal(null)} variant="primary" className="w-full md:w-auto flex-shrink-0" disabled={!canCreate}><Plus size={16}/> Add Financial Year</Button>}
                    </div>
                </div>
                <div className="overflow-auto max-h-60">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0"><tr>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">Financial Year</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">From Date</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">To Date</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-bold uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                           {filteredFinancialYears.map(fy => (
                               <tr key={fy.id} onClick={() => setSelectedFinYearId(fy.id)} className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 ${selectedFinYearId === fy.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}>
                                   <td className="px-4 py-3 font-medium">{fy.fin_year}</td>
                                   <td className="px-4 py-3">{fy.from_date}</td>
                                   <td className="px-4 py-3">{fy.to_date}</td>
                                   <td className="px-4 py-3"><ToggleSwitch enabled={fy.status === 1} onChange={() => handleToggleFYStatus(fy)} disabled={!canModify} /></td>
                                   <td className="px-4 py-3"><Button size="small" variant="light" className="!p-1.5" onClick={() => openFYModal(fy)} disabled={!canModify}><Edit2 size={14}/></Button></td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="space-y-6">
                <DocNumTable title="Voucher Numbering Rule" type="Voucher" item={voucherNumberingRule} />
                <DocNumTable title="Receipt Numbering Rule" type="Receipt" item={receiptNumberingRule} />
            </div>

            {isFYModalOpen && (
                <Modal isOpen={isFYModalOpen} onClose={closeFYModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                    <form onSubmit={e => {e.preventDefault(); handleSaveFY()}}>
                        <header className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold">{editingFY?.id ? 'Edit' : 'Add'} Financial Year</h2>
                        </header>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Financial Year Label" value={editingFY?.fin_year || ''} onChange={e => setEditingFY(p => p ? {...p, fin_year: e.target.value} : null)} placeholder="e.g., 2024-2025" required/>
                            <div/>
                            <Input label="From Date" type="date" value={editingFY?.from_date || ''} onChange={e => setEditingFY(p => p ? {...p, from_date: e.target.value} : null)} required/>
                            <Input label="To Date" type="date" value={editingFY?.to_date || ''} onChange={e => setEditingFY(p => p ? {...p, to_date: e.target.value} : null)} required/>
                        </div>
                         <footer className="flex justify-end p-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                            <Button type="button" variant="secondary" onClick={closeFYModal}>Cancel</Button>
                            <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                        </footer>
                    </form>
                </Modal>
            )}

            {isDocNumModalOpen && (
                <DocNumRuleModal
                    isOpen={isDocNumModalOpen}
                    onClose={() => setIsDocNumModalOpen(false)}
                    onSave={handleSaveDocNum}
                    initialData={editingDocNum}
                    financialYears={financialYears}
                    canModify={canModify}
                />
            )}
        </div>
    );
};

export default FinancialYearPage;