import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Religion, Festival, FestivalDate, Company } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import Select from '../components/ui/Select';
import SearchBar from '../components/ui/SearchBar';

const ReligionAndFestivalPage: React.FC = () => {
    const { addToast } = useToast();
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [religions, setReligions] = useState<Religion[]>([]);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [festivalDates, setFestivalDates] = useState<FestivalDate[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<string>('all');

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'religion' | 'festival' | 'date' | null;
        item: Partial<Religion | Festival | FestivalDate> | null;
    }>({ isOpen: false, type: null, item: null });

    const canCreate = companyData?.STATUS === 1;
    const canModify = companyData?.STATUS === 1;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await api.fetchCurrentUser();
            const companies = await api.fetchCompanies();
            const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
            setCompanyData(currentCompany);

            if (currentCompany) {
                const [rels, fests, dates] = await Promise.all([
                    api.fetchReligions(),
                    api.fetchFestivals(),
                    api.fetchFestivalDates(),
                ]);
                const filterByComp = (item: any) => item.COMP_ID === currentCompany.COMP_ID;
                setReligions(rels.filter(filterByComp));
                setFestivals(fests.filter(filterByComp));
                setFestivalDates(dates.filter(filterByComp));
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to load page data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => { loadData(); }, [loadData]);

    const religionMap = useMemo(() => new Map(religions.map(r => [r.ID, r.RELIGION])), [religions]);
    
    const yearOptions = useMemo(() => {
        const yearsFromDates = festivalDates.map(d => new Date(d.FESTVEL_DATE).getFullYear());
        const currentYear = new Date().getFullYear();
        const surroundingYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); 
        const allYears = new Set([...yearsFromDates, ...surroundingYears]);
        return Array.from(allYears).sort((a, b) => a - b);
    }, [festivalDates]);

    const dateCountMap = useMemo(() => festivalDates.reduce((acc, curr) => {
        acc.set(curr.FEST_ID, (acc.get(curr.FEST_ID) || 0) + 1);
        return acc;
    }, new Map<number, number>()), [festivalDates]);

    const filteredReligions = useMemo(() => searchQuery ? religions.filter(r => r.RELIGION.toLowerCase().includes(searchQuery.toLowerCase())) : religions, [religions, searchQuery]);
    const filteredFestivals = useMemo(() => searchQuery ? festivals.filter(f => f.FEST_DESC.toLowerCase().includes(searchQuery.toLowerCase())) : festivals, [festivals, searchQuery]);

    const festivalDateDisplayItems = useMemo(() => {
        let festivalsToShow = filteredFestivals;

        if (monthFilter !== 'all') {
            const festivalIdsInMonth = new Set<number>();
            festivalDates.forEach(d => {
                const date = new Date(d.FESTVEL_DATE);
                if (date.getFullYear() === yearFilter && date.getMonth() === Number(monthFilter)) {
                    festivalIdsInMonth.add(d.FEST_ID);
                }
            });
            festivalsToShow = festivalsToShow.filter(f => festivalIdsInMonth.has(f.ID));
        }

        return festivalsToShow.map(festival => {
            const dateForYear = festivalDates.find(d => 
                d.FEST_ID === festival.ID && 
                new Date(d.FESTVEL_DATE).getFullYear() === yearFilter
            );
            return {
                ...festival,
                dateObject: dateForYear || null
            };
        });
    }, [filteredFestivals, festivalDates, yearFilter, monthFilter]);

    const openModal = (type: 'religion' | 'festival' | 'date', item: any | null) => {
        setModalState({ isOpen: true, type, item: item ? { ...item } : { STATUS: 1 } });
    };
    const closeModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = async () => {
        if (!modalState.type || !modalState.item || !companyData) return;
        const { type, item } = modalState;
        const now = new Date().toISOString();
        const commonFields = { COMP_ID: companyData.COMP_ID, MODIFIED_ON: now, MODIFIED_BY: 1 };
        
        try {
            if (type === 'religion') {
                const typedItem = item as Partial<Religion>;
                if (!typedItem.RELIGION?.trim()) { addToast("Religion Name is required.", "error"); return; }
                const payload = item.ID ? { ...typedItem, ...commonFields } : { ...typedItem, ...commonFields, ID: Date.now(), SEQ_NO: religions.length, CREATED_ON: now, CREATED_BY: 1 };
                const updated = item.ID ? religions.map(i => i.ID === payload.ID ? payload as Religion : i) : [...religions, payload as Religion];
                await api.onUpdateReligions(updated);
                setReligions(updated);
            } else if (type === 'festival') {
                const typedItem = item as Partial<Festival>;
                if (!typedItem.FEST_DESC?.trim()) { addToast("Festival Name is required.", "error"); return; }
                const payload = item.ID ? { ...typedItem, ...commonFields } : { ...typedItem, ...commonFields, ID: Date.now(), CREATED_ON: now, CREATED_BY: 1 };
                const updated = item.ID ? festivals.map(i => i.ID === payload.ID ? payload as Festival : i) : [...festivals, payload as Festival];
                await api.onUpdateFestivals(updated);
                setFestivals(updated);
            } else if (type === 'date') {
                const typedItem = item as Partial<FestivalDate>;
                if (!typedItem.FEST_ID || !typedItem.FESTVEL_DATE) { addToast("Festival and Date are required.", "error"); return; }
                
                let updated = [...festivalDates];
                let message = '';
                
                if (typedItem.ID) { 
                    const originalDate = festivalDates.find(d => d.ID === typedItem.ID);
                    const originalYear = originalDate ? new Date(originalDate.FESTVEL_DATE).getFullYear() : null;
                    const newYear = new Date(typedItem.FESTVEL_DATE).getFullYear();

                    if (originalYear === newYear) {
                        updated = festivalDates.map(d => d.ID === typedItem.ID ? { ...d, ...typedItem, ...commonFields } as FestivalDate : d);
                        message = 'Festival date updated successfully.';
                    } else {
                        const newDatePayload: FestivalDate = {
                            ...(typedItem as FestivalDate),
                            ...commonFields,
                            ID: Date.now(),
                            CREATED_ON: now,
                            CREATED_BY: 1,
                        };
                        updated.push(newDatePayload);
                        message = `New festival date for ${newYear} created successfully.`;
                    }
                } else { 
                    const newDatePayload: FestivalDate = {
                        ...(typedItem as FestivalDate),
                        ...commonFields,
                        ID: Date.now(),
                        CREATED_ON: now,
                        CREATED_BY: 1,
                    };
                    updated.push(newDatePayload);
                    message = 'Festival date created successfully.';
                }

                await api.onUpdateFestivalDates(updated);
                setFestivalDates(updated);
                addToast(message);
                closeModal();
                return;
            }
            addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully.`);
            closeModal();
        } catch (e) {
            console.error(e);
            addToast("Failed to save.", "error");
        }
    };
    
    const handleToggleFestivalStatus = async (festival: Festival) => {
        const newStatus = festival.STATUS === 1 ? 0 : 1;
        try {
            const updatedFestivals = festivals.map(f => f.ID === festival.ID ? { ...f, STATUS: newStatus } : f);
            await api.onUpdateFestivals(updatedFestivals);
            setFestivals(updatedFestivals);
            addToast(`Festival status updated.`);
        } catch(e) {
            addToast("Failed to update festival status.", "error");
        }
    }
    
    const handleToggle = async (type: 'religion' | 'festival', item: Religion | Festival) => {
        const newStatus = item.STATUS === 1 ? 0 : 1;
        try {
            let updatedReligions = [...religions];
            let updatedFestivals = [...festivals];
            let message = '';

            if (type === 'religion') {
                const religion = item as Religion;
                updatedReligions = religions.map(r => r.ID === religion.ID ? { ...r, STATUS: newStatus } : r);
                
                const affectedFestivalIds = festivals.filter(f => f.RELIGION_ID === religion.ID).map(f => f.ID);
                updatedFestivals = festivals.map(f => affectedFestivalIds.includes(f.ID) ? { ...f, STATUS: newStatus } : f);
                message = `Religion and associated items ${newStatus ? 'activated' : 'deactivated'}.`;

                await Promise.all([
                    api.onUpdateReligions(updatedReligions),
                    api.onUpdateFestivals(updatedFestivals),
                ]);
                setReligions(updatedReligions);
                setFestivals(updatedFestivals);
            } else if (type === 'festival') {
                const festival = item as Festival;
                updatedFestivals = festivals.map(f => f.ID === festival.ID ? { ...f, STATUS: newStatus } : f);
                message = `Festival status ${newStatus ? 'activated' : 'deactivated'}.`;
                
                await api.onUpdateFestivals(updatedFestivals);
                setFestivals(updatedFestivals);
            }
            
            addToast(message);
        } catch (e) {
            console.error(e);
            addToast("Failed to update status.", "error");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

    const renderTable = (
        title: string, type: 'religion' | 'festival', data: any[], columns: { header: string, accessor: (item: any) => React.ReactNode }[]
    ) => (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                <Button onClick={() => openModal(type, null)} disabled={!canCreate}><Plus size={16} /> Add New {type.charAt(0).toUpperCase() + type.slice(1)}</Button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                <table className="min-w-full">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold w-12">ID</th>
                            {columns.map(c => <th key={c.header} className="px-4 py-2 text-left text-xs font-bold">{c.header}</th>)}
                            <th className="px-4 py-2 text-left text-xs font-bold">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data.map((item, index) => (
                            <tr key={item.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 text-sm">{index + 1}</td>
                                {columns.map(c => <td key={c.header} className="px-4 py-2 text-sm font-medium">{c.accessor(item)}</td>)}
                                <td className="px-4 py-2"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggle(type, item)} disabled={!canModify}/></td>
                                <td className="px-4 py-2"><Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(type, item)} disabled={!canModify}><Edit2 size={14}/></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Religion & Festival Management</h2>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search religions and festivals..." className="max-w-md"/>
            {renderTable('Religions', 'religion', filteredReligions, [{ header: 'Name', accessor: item => item.RELIGION }])}
            {renderTable('Festivals', 'festival', filteredFestivals, [
                { header: 'Name', accessor: item => item.FEST_DESC },
                { header: 'Religion', accessor: item => religionMap.get(item.RELIGION_ID) || <span className="italic text-slate-500">General</span> }
            ])}
            
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Festival Date</h3>
                    <div className="flex items-center gap-2">
                         <Select label="" value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}>
                            {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                        </Select>
                        <Select label="" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                            <option value="all">All Months</option>
                            {[...Array(12)].map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                        </Select>
                    </div>
                </div>
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                    <table className="min-w-full">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold w-12">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-bold">Festival</th>
                                <th className="px-4 py-2 text-left text-xs font-bold">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {festivalDateDisplayItems.length > 0 ? festivalDateDisplayItems.map((item, index) => {
                                const religion = item.RELIGION_ID ? religions.find(r => r.ID === item.RELIGION_ID) : null;
                                const isParentActive = (!religion || religion.STATUS === 1) && item.STATUS === 1;

                                return (
                                <tr key={item.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                        {item.FEST_DESC} <span className="text-xs text-slate-400">({dateCountMap.get(item.ID) || 0} Dates)</span>
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                        <div className="flex items-center justify-between">
                                            {item.dateObject ? (
                                                <span>{new Date(item.dateObject.FESTVEL_DATE).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                            ) : (
                                                <span className="italic text-slate-400">No date set for {yearFilter}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <ToggleSwitch 
                                            enabled={isParentActive}
                                            onChange={() => handleToggleFestivalStatus(item)}
                                            disabled={!canModify}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <Button 
                                            size="small" 
                                            variant="light" 
                                            className="!p-1.5" 
                                            onClick={() => openModal('date', item.dateObject || { FEST_ID: item.ID, FESTVEL_DATE: `${yearFilter}-01-01`, STATUS: 1 })}
                                            disabled={!canCreate && !item.dateObject}
                                        >
                                            {item.dateObject ? <Edit2 size={14}/> : <CalendarIcon size={14}/>}
                                        </Button>
                                    </td>
                                </tr>
                            )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        No festivals found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalState.isOpen} onClose={closeModal} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{modalState.item?.ID ? 'Edit' : 'Add'} {modalState.type?.charAt(0).toUpperCase() + modalState.type?.slice(1)}</h2>
                        <div className="space-y-4">
                            {modalState.type === 'religion' && <Input label="Religion Name" value={(modalState.item as Religion)?.RELIGION || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, RELIGION: e.target.value}}))} autoFocus required disabled={!canModify}/>}
                            {modalState.type === 'festival' && <>
                                <Input label="Festival Name" value={(modalState.item as Festival)?.FEST_DESC || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, FEST_DESC: e.target.value}}))} autoFocus required disabled={!canModify} />
                                <Select label="Religion" value={(modalState.item as Festival)?.RELIGION_ID || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, RELIGION_ID: e.target.value ? Number(e.target.value) : null}}))} disabled={!canModify}>
                                    <option value="">-- General --</option>
                                    {religions.filter(r => r.STATUS === 1).map(r => <option key={r.ID} value={r.ID}>{r.RELIGION}</option>)}
                                </Select>
                            </>}
                            {modalState.type === 'date' && <>
                                <Select label="Festival" value={(modalState.item as FestivalDate)?.FEST_ID || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, FEST_ID: Number(e.target.value)}}))} disabled={!!modalState.item?.ID || !canModify} required>
                                    <option value="">-- Select Festival --</option>
                                    {festivals.filter(f => f.STATUS === 1).map(f => <option key={f.ID} value={f.ID}>{f.FEST_DESC}</option>)}
                                </Select>
                                <Input label="Date" type="date" value={(modalState.item as FestivalDate)?.FESTVEL_DATE || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, FESTVEL_DATE: e.target.value}}))} required disabled={!canModify} />
                            </>}
                        </div>
                    </div>
                    <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                    </footer>
                </form>
            </Modal>
        </div>
    );
};

export default ReligionAndFestivalPage;