
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Religion, Festival, FestivalDate, Company, PaginatedResponse } from '../types';
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

    const [religionsResponse, setReligionsResponse] = useState<PaginatedResponse<Religion> | null>(null);
    const [festivalsResponse, setFestivalsResponse] = useState<PaginatedResponse<Festival> | null>(null);
    const [allFestivals, setAllFestivals] = useState<Festival[]>([]);
    const [festivalDates, setFestivalDates] = useState<FestivalDate[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [religionPage, setReligionPage] = useState(1);
    const [festivalPage, setFestivalPage] = useState(1);
    
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<string>('all');

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'religion' | 'festival' | 'date' | null;
        item: Partial<Religion | Festival | FestivalDate> | null;
    }>({ isOpen: false, type: null, item: null });

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;
    
    const loadData = useCallback(async (isInitial = false) => {
        if (!companyData) return;
        setIsLoading(true);
        try {
            const [rels, fests, dates, allFestsData] = await Promise.all([
                api.fetchReligions(companyData.comp_id, { page: religionPage, search: searchQuery }),
                api.fetchFestivals(companyData.comp_id, { page: festivalPage, search: searchQuery }),
                api.fetchFestivalDates(),
                isInitial ? api.fetchFestivals(companyData.comp_id, { limit: 10000 }) : Promise.resolve(null)
            ]);
            setReligionsResponse(rels);
            setFestivalsResponse(fests);
            setFestivalDates(dates);
            if (allFestsData) {
                setAllFestivals(allFestsData.data);
            }
        } catch (error) {
            addToast("Failed to load page data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast, companyData, religionPage, festivalPage, searchQuery]);
    
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
            loadData(true);
        }
    }, [companyData]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (companyData) {
                loadData(false);
            }
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, religionPage, festivalPage, companyData, loadData]);


    const religions = useMemo(() => religionsResponse?.data || [], [religionsResponse]);
    const festivals = useMemo(() => festivalsResponse?.data || [], [festivalsResponse]);
    const religionMap = useMemo(() => new Map(religions.map(r => [r.id, r.religion])), [religions]);
    
    const yearOptions = useMemo(() => {
        const yearsFromDates = festivalDates.map(d => new Date(d.festvel_date).getFullYear());
        const currentYear = new Date().getFullYear();
        const surroundingYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); 
        const allYears = new Set([...yearsFromDates, ...surroundingYears]);
        return Array.from(allYears).sort((a, b) => a - b);
    }, [festivalDates]);

    const dateCountMap = useMemo(() => festivalDates.reduce((acc, curr) => {
        acc.set(curr.fest_id, (acc.get(curr.fest_id) || 0) + 1);
        return acc;
    }, new Map<number, number>()), [festivalDates]);

    const festivalDateDisplayItems = useMemo(() => {
        let festivalsToShow = allFestivals.filter(f => f.fest_desc.toLowerCase().includes(searchQuery.toLowerCase()));

        if (monthFilter !== 'all') {
            const festivalIdsInMonth = new Set<number>();
            festivalDates.forEach(d => {
                const date = new Date(d.festvel_date);
                if (date.getFullYear() === yearFilter && date.getMonth() === Number(monthFilter)) {
                    festivalIdsInMonth.add(d.fest_id);
                }
            });
            festivalsToShow = festivalsToShow.filter(f => festivalIdsInMonth.has(f.id));
        }

        return festivalsToShow.map(festival => {
            const dateForYear = festivalDates.find(d => 
                d.fest_id === festival.id && 
                new Date(d.festvel_date).getFullYear() === yearFilter
            );
            return { ...festival, dateObject: dateForYear || null };
        });
    }, [allFestivals, festivalDates, yearFilter, monthFilter, searchQuery]);

    const openModal = (type: 'religion' | 'festival' | 'date', item: any | null) => {
        setModalState({ isOpen: true, type, item: item ? { ...item } : { status: 1 } });
    };
    const closeModal = () => setModalState({ isOpen: false, type: null, item: null });

    const handleSave = async () => {
        if (!modalState.type || !modalState.item || !companyData) return;
        const { type, item } = modalState;
        
        try {
            if (type === 'religion') {
                const typedItem = item as Partial<Religion>;
                if (!typedItem.religion?.trim()) { addToast("Religion Name is required.", "error"); return; }
                await api.saveReligion({ ...typedItem, comp_id: companyData.comp_id });
            } else if (type === 'festival') {
                const typedItem = item as Partial<Festival>;
                if (!typedItem.fest_desc?.trim()) { addToast("Festival Name is required.", "error"); return; }
                await api.saveFestival({ ...typedItem, comp_id: companyData.comp_id });
            } else if (type === 'date') {
                const typedItem = item as Partial<FestivalDate>;
                if (!typedItem.fest_id || !typedItem.festvel_date) { addToast("Festival and Date are required.", "error"); return; }
                await api.saveFestivalDate({ ...typedItem, comp_id: companyData.comp_id });
            }
            addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully.`);
            loadData(true);
            closeModal();
        } catch (e) {
            addToast("Failed to save.", "error");
        }
    };
    
    const handleToggle = async (type: 'religion' | 'festival', item: Religion | Festival) => {
        const newStatus = item.status === 1 ? 0 : 1;
        try {
            if (type === 'religion') {
                await api.saveReligion({ ...item, status: newStatus });
            } else if (type === 'festival') {
                await api.saveFestival({ ...item, status: newStatus });
            }
            addToast(`Status updated.`);
            loadData(true);
        } catch (e) {
            addToast("Failed to update status.", "error");
        }
    };

    const renderTable = (
        title: string, type: 'religion' | 'festival', response: PaginatedResponse<any> | null, setPage: React.Dispatch<React.SetStateAction<number>>, columns: { header: string, accessor: (item: any) => React.ReactNode }[]
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
                        {response?.data.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-2 text-sm">{((response.meta.page - 1) * response.meta.limit) + index + 1}</td>
                                {columns.map(c => <td key={c.header} className="px-4 py-2 text-sm font-medium">{c.accessor(item)}</td>)}
                                <td className="px-4 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggle(type, item)} disabled={!canModify}/></td>
                                <td className="px-4 py-2"><Button size="small" variant="light" className="!p-1.5" onClick={() => openModal(type, item)} disabled={!canModify}><Edit2 size={14}/></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {response && response.meta.pages > 1 && (
                 <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Page {response.meta.page} of {response.meta.pages}
                    </span>
                    <div className="flex gap-2">
                        <Button onClick={() => setPage(p => p - 1)} disabled={!response.meta.has_prev_page} size="small">Previous</Button>
                        <Button onClick={() => setPage(p => p + 1)} disabled={!response.meta.has_next_page} size="small">Next</Button>
                    </div>
                </div>
            )}
        </div>
    );

    if (isLoading && !companyData) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Religion & Festival Management</h2>
            <SearchBar searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); setReligionPage(1); setFestivalPage(1); }} placeholder="Search religions and festivals..." className="max-w-md"/>
            {renderTable('Religions', 'religion', religionsResponse, setReligionPage, [{ header: 'Name', accessor: item => item.religion }])}
            {renderTable('Festivals', 'festival', festivalsResponse, setFestivalPage, [
                { header: 'Name', accessor: item => item.fest_desc },
                { header: 'Religion', accessor: item => religionMap.get(item.religion_id) || <span className="italic text-slate-500">General</span> }
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
                                <th className="px-4 py-2 text-left text-xs font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {festivalDateDisplayItems.length > 0 ? festivalDateDisplayItems.map((item, index) => {
                                const religion = item.religion_id ? allFestivals.find(r => r.id === item.religion_id) : null;
                                return (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-2 text-sm">{index + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                        {item.fest_desc} <span className="text-xs text-slate-400">({dateCountMap.get(item.id) || 0} Dates)</span>
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium">
                                        <div className="flex items-center justify-between">
                                            {item.dateObject ? (
                                                <span>{new Date(item.dateObject.festvel_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                            ) : (
                                                <span className="italic text-slate-400">No date set for {yearFilter}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <Button 
                                            size="small" 
                                            variant="light" 
                                            className="!p-1.5" 
                                            onClick={() => openModal('date', item.dateObject || { fest_id: item.id, festvel_date: `${yearFilter}-01-01`, status: 1 })}
                                            disabled={!canCreate && !item.dateObject}
                                        >
                                            {item.dateObject ? <Edit2 size={14}/> : <CalendarIcon size={14}/>}
                                        </Button>
                                    </td>
                                </tr>
                            )
                            }) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                        <h2 className="text-xl font-bold mb-4">{modalState.item?.id ? 'Edit' : 'Add'} {modalState.type?.charAt(0).toUpperCase() + modalState.type?.slice(1)}</h2>
                        <div className="space-y-4">
                            {modalState.type === 'religion' && <Input label="Religion Name" value={(modalState.item as Religion)?.religion || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, religion: e.target.value}}))} autoFocus required disabled={!canModify}/>}
                            {modalState.type === 'festival' && <>
                                <Input label="Festival Name" value={(modalState.item as Festival)?.fest_desc || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, fest_desc: e.target.value}}))} autoFocus required disabled={!canModify} />
                                <Select label="Religion" value={(modalState.item as Festival)?.religion_id || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, religion_id: e.target.value ? Number(e.target.value) : null}}))} disabled={!canModify}>
                                    <option value="">-- General --</option>
                                    {religions.filter(r => r.status === 1).map(r => <option key={r.id} value={r.id}>{r.religion}</option>)}
                                </Select>
                            </>}
                            {modalState.type === 'date' && <>
                                <Select label="Festival" value={(modalState.item as FestivalDate)?.fest_id || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, fest_id: Number(e.target.value)}}))} disabled={!!modalState.item?.id || !canModify} required>
                                    <option value="">-- Select Festival --</option>
                                    {allFestivals.filter(f => f.status === 1).map(f => <option key={f.id} value={f.id}>{f.fest_desc}</option>)}
                                </Select>
                                <Input label="Date" type="date" value={(modalState.item as FestivalDate)?.festvel_date || ''} onChange={e => setModalState(s => ({...s, item: {...s.item, festvel_date: e.target.value}}))} required disabled={!canModify} />
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
