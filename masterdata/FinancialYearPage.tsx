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
            setFormData(initialData || { STARTING_NO: 1 });
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof DocumentNumberingRule, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        if (!formData.PREFIX?.trim() || !formData.FIN_YEAR_ID) {
            alert('Prefix and Financial Year are required.');
            return;
        }
        if (isNaN(formData.STARTING_NO as number) || (formData.STARTING_NO as number) < 1) {
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
                    <h2 className="text-xl font-bold">{initialData?.ID ? 'Edit' : 'Add'} {initialData?.TYPE} Rule</h2>
                </header>
                <div className="p-6 space-y-4">
                    <Input label="Prefix (Kword)" value={formData.PREFIX || ''} onChange={e => handleChange('PREFIX', e.target.value)} placeholder="e.g., VCH/25-26/" required disabled={!canModify}/>
                    <Input label="Suffix (Optional)" value={formData.SUFFIX || ''} onChange={e => handleChange('SUFFIX', e.target.value)} placeholder="e.g., /FIN" disabled={!canModify}/>
                    <Input label="Starting Number" type="number" value={String(formData.STARTING_NO || '1')} onChange={e => handleChange('STARTING_NO', Number(e.target.value))} required disabled={!canModify} />
                    <Select label="Financial Year" value={formData.FIN_YEAR_ID || ''} onChange={e => handleChange('FIN_YEAR_ID', Number(e.target.value))} required disabled={!canModify || !!initialData?.ID}>
                        <option value="" disabled>Select FY</option>
                        {financialYears.filter(fy => fy.STATUS === 1).map(fy => <option key={fy.ID} value={fy.ID}>{fy.FIN_YEAR}</option>)}
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
                    const [fyData, ruleData] = await Promise.all([
                        api.fetchFinancialYears(),
                        api.fetchDocumentNumberingRules()
                    ]);
                    const companyFYs = fyData.filter(fy => fy.COMP_ID === currentCompany.COMP_ID);
                    setFinancialYears(companyFYs);
                    setDocNumRules(ruleData.filter(r => r.COMP_ID === currentCompany.COMP_ID));

                    if (companyFYs.length > 0) {
                        const firstActive = companyFYs.find(fy => fy.STATUS === 1) || companyFYs[0];
                        setSelectedFinYearId(firstActive.ID);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
                addToast("Failed to load financial year data", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addToast]);
    
    const filteredFinancialYears = useMemo(() => {
        return financialYears.filter(fy => fy.FIN_YEAR.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [financialYears, searchQuery]);

    const voucherNumberingRule = useMemo(() => docNumRules.find(dn => dn.FIN_YEAR_ID === selectedFinYearId && dn.TYPE === 'Voucher'), [docNumRules, selectedFinYearId]);
    const receiptNumberingRule = useMemo(() => docNumRules.find(dn => dn.FIN_YEAR_ID === selectedFinYearId && dn.TYPE === 'Receipt'), [docNumRules, selectedFinYearId]);

    const openFYModal = (item: FinancialYear | null) => {
        setEditingFY(item ? { ...item } : { FIN_YEAR: '', FROM_DATE: '', TO_DATE: '', STATUS: 1 });
        setIsFYModalOpen(true);
    };
    const closeFYModal = () => setIsFYModalOpen(false);

    const handleSaveFY = async () => {
        if (!editingFY || !editingFY.FIN_YEAR?.trim() || !editingFY.FROM_DATE || !editingFY.TO_DATE || !companyData) {
            addToast('All fields are required.', 'error');
            return;
        }
        if (new Date(editingFY.FROM_DATE) >= new Date(editingFY.TO_DATE)) {
            addToast('"From Date" must be earlier than "To Date".', 'error');
            return;
        }

        let updatedFYs;
        const now = new Date().toISOString();
        if (editingFY.ID) {
            updatedFYs = financialYears.map(fy => fy.ID === editingFY.ID ? { ...fy, ...editingFY, MODIFIED_ON: now } as FinancialYear : fy);
        } else {
            const newFY: FinancialYear = {
                ID: Date.now(),
                COMP_ID: companyData.COMP_ID,
                STATUS: 1,
                ...editingFY,
                CREATED_ON: now,
                MODIFIED_ON: now,
                CREATED_BY: 1,
                MODIFIED_BY: 1,
            } as FinancialYear;
            updatedFYs = [...financialYears, newFY];
        }
        await api.onUpdateFinancialYears(updatedFYs);
        setFinancialYears(updatedFYs);
        addToast("Financial Year saved.", "success");
        closeFYModal();
    };

    const handleToggleFYStatus = async (fy: FinancialYear) => {
        const newStatus = fy.STATUS === 1 ? 0 : 1;
        const updatedFYs = financialYears.map(f => f.ID === fy.ID ? { ...f, STATUS: newStatus } : f);
        const updatedRules = docNumRules.map(rule => rule.FIN_YEAR_ID === fy.ID ? { ...rule, STATUS: newStatus } : rule);
        
        try {
            await Promise.all([
                api.onUpdateFinancialYears(updatedFYs),
                api.onUpdateDocumentNumberingRules(updatedRules)
            ]);
            setFinancialYears(updatedFYs);
            setDocNumRules(updatedRules);
            addToast('Financial Year and its rules have been updated.');
        } catch(e) {
            addToast("Failed to update status.", "error");
        }
    };
    
    const openDocNumModal = (type: 'Voucher' | 'Receipt', item: DocumentNumberingRule | null) => {
        setEditingDocNum(item ? { ...item } : { TYPE: type, PREFIX: '', STARTING_NO: 1, FIN_YEAR_ID: selectedFinYearId!, STATUS: 1, SUFFIX: null });
        setIsDocNumModalOpen(true);
    };

    const handleSaveDocNum = async (dataToSave: Partial<DocumentNumberingRule>) => {
        if (!canModify || !companyData) return;

        let updatedRules;
        if (dataToSave.ID) {
            updatedRules = docNumRules.map(dn => dn.ID === dataToSave.ID ? { ...dn, ...dataToSave } as DocumentNumberingRule : dn);
        } else {
            const newDocNum: DocumentNumberingRule = {
                ID: Date.now(),
                COMP_ID: companyData.COMP_ID,
                ...dataToSave,
            } as DocumentNumberingRule;
            updatedRules = [...docNumRules, newDocNum];
        }
        await api.onUpdateDocumentNumberingRules(updatedRules);
        setDocNumRules(updatedRules);
        addToast("Numbering rule saved.", "success");
        setIsDocNumModalOpen(false);
    };
    
    const handleToggleRuleStatus = async (rule: DocumentNumberingRule) => {
        const updatedRule = { ...rule, STATUS: rule.STATUS === 1 ? 0 : 1 };
        const updatedRules = docNumRules.map(r => r.ID === rule.ID ? updatedRule : r);
        await api.onUpdateDocumentNumberingRules(updatedRules);
        setDocNumRules(updatedRules);
        addToast("Rule status updated.", "success");
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
                                <td className="px-4 py-3 font-mono">{item.PREFIX}</td>
                                <td className="px-4 py-3 font-mono">{item.SUFFIX || 'N/A'}</td>
                                <td className="px-4 py-3">{item.STARTING_NO}</td>
                                <td className="px-4 py-3"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggleRuleStatus(item)} disabled={!canModify}/></td>
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

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

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
                                <tr key={fy.ID} onClick={() => setSelectedFinYearId(fy.ID)} className={`cursor-pointer ${selectedFinYearId === fy.ID ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                    <td className="px-4 py-3 font-medium">{fy.FIN_YEAR}</td>
                                    <td className="px-4 py-3">{fy.FROM_DATE}</td>
                                    <td className="px-4 py-3">{fy.TO_DATE}</td>
                                    <td className="px-4 py-3"><ToggleSwitch enabled={fy.STATUS === 1} onChange={() => handleToggleFYStatus(fy)} disabled={!canModify}/></td>
                                    <td className="px-4 py-3"><Button size="small" variant="light" className="!p-1.5" onClick={(e) => { e.stopPropagation(); openFYModal(fy);}} disabled={!canModify}><Edit2 size={14}/></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DocNumTable title="Voucher Numbering" type="Voucher" item={voucherNumberingRule} />
                <DocNumTable title="Receipt Numbering" type="Receipt" item={receiptNumberingRule} />
            </div>

            <Modal isOpen={isFYModalOpen} onClose={closeFYModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={e => {e.preventDefault(); handleSaveFY();}}>
                    <header className="p-6 border-b border-slate-200 dark:border-slate-700"><h2 className="text-xl font-bold">{editingFY?.ID ? 'Edit' : 'Add'} Financial Year</h2></header>
                    <div className="p-6 space-y-4">
                        <Input label="Financial Year Label" value={editingFY?.FIN_YEAR || ''} onChange={e => setEditingFY(p => p ? {...p, FIN_YEAR: e.target.value} : null)} placeholder="e.g., 2025-2026" required disabled={!canModify} autoFocus/>
                        <Input label="From Date" type="date" value={editingFY?.FROM_DATE || ''} onChange={e => setEditingFY(p => p ? {...p, FROM_DATE: e.target.value} : null)} required disabled={!canModify}/>
                        <Input label="To Date" type="date" value={editingFY?.TO_DATE || ''} onChange={e => setEditingFY(p => p ? {...p, TO_DATE: e.target.value} : null)} required disabled={!canModify}/>
                    </div>
                    <footer className="flex justify-end p-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg"><Button type="button" variant="secondary" onClick={closeFYModal}>Cancel</Button><Button type="submit" variant="success" disabled={!canModify}>Save</Button></footer>
                </form>
            </Modal>

            {editingDocNum && <DocNumRuleModal isOpen={isDocNumModalOpen} onClose={() => setIsDocNumModalOpen(false)} onSave={handleSaveDocNum} initialData={editingDocNum} financialYears={financialYears} canModify={canModify}/>}
        </div>
    );
};

export default FinancialYearPage;