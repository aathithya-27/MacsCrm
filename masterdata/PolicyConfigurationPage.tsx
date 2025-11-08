
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    InsuranceType, InsuranceSubType, InsuranceFieldMaster, BusinessVertical, Scheme, ProcessFlow,
    DocumentMaster, DocumentRequirement, Member, FieldType, Company
} from '../types';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CreatableSearchableSelect from '../components/ui/CreatableSearchableSelect';
import Modal from '../components/ui/Modal';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { Plus, Edit2, AlertTriangle, Trash2 } from 'lucide-react';

import ProcessStageManager from './ProcessStageManager';
import SearchBar from '../components/ui/SearchBar'; 

const selectClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800";

const InsuranceTypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<InsuranceType & InsuranceSubType>) => void;
    initialData: Partial<InsuranceType & InsuranceSubType> | null;
    businessVerticals: BusinessVertical[];
    parentType?: InsuranceType;
    canModify: boolean;
}> = ({ isOpen, onClose, onSave, initialData, businessVerticals, parentType, canModify }) => {

    const [formData, setFormData] = useState<Partial<InsuranceType & InsuranceSubType>>({});
    const isSubType = 'insurance_type_id' in formData || !!parentType;

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof (InsuranceType & InsuranceSubType), value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} contentClassName="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-lg text-gray-900 dark:text-gray-200">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.id ? 'Edit' : 'Add'} {isSubType ? 'Insurance Sub-Type' : 'Insurance Type'}</h2>
                    {parentType && <p className="text-sm text-gray-500 dark:text-gray-400">Adding as a Sub-Type of "{parentType.insurance_type}"</p>}
                </div>
                <div className="space-y-4">
                    {!isSubType && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Vertical</label>
                            <select
                                value={formData.business_vertical_id || ''}
                                onChange={(e) => handleChange('business_vertical_id', Number(e.target.value))}
                                className={selectClasses}
                                required
                                disabled={!canModify}
                            >
                                <option value="">-- Select Vertical --</option>
                                {businessVerticals.filter(bv => bv.status === 1).map(bv => (
                                    <option key={bv.id} value={bv.id}>{bv.business_vertical_name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Input 
                        label="Name" 
                        value={isSubType ? formData.insurance_sub_type || '' : formData.insurance_type || ''} 
                        onChange={(e) => handleChange(isSubType ? 'insurance_sub_type' : 'insurance_type', e.target.value)} 
                        required 
                        disabled={!canModify} 
                    />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                </div>
            </form>
        </Modal>
    );
};


const PolicyConfigurationPage: React.FC = () => {
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
    const [insuranceSubTypes, setInsuranceSubTypes] = useState<InsuranceSubType[]>([]);
    const [insuranceFields, setInsuranceFields] = useState<InsuranceFieldMaster[]>([]);
    const [businessVerticals, setBusinessVerticals] = useState<BusinessVertical[]>([]);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [processFlows, setProcessFlows] = useState<ProcessFlow[]>([]);
    const [documentMasters, setDocumentMasters] = useState<DocumentMaster[]>([]);
    const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedParentTypeId, setSelectedParentTypeId] = useState<number | null>(null);
    const [selectedConfigTypeId, setSelectedConfigTypeId] = useState<number | null>(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<Partial<InsuranceType & InsuranceSubType> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [itemToAction, setItemToAction] = useState<{ id: number; name: string; isSubType: boolean } | null>(null);
    const [dependentItems, setDependentItems] = useState<{ name: string; type: 'field' | 'policy' }[]>([]);

    const canCreate = companyData?.status === 1;
    const canModify = companyData?.status === 1;

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.comp_id === user.comp_id) || null;
                setCompanyData(currentCompany);

                if (!currentCompany) {
                    setIsLoading(false);
                    return;
                }

                const [typesData, subTypesData, fields, verticalsData, sch, stages, docs, rules, members] = await Promise.all([
                    api.fetchInsuranceTypes(currentCompany.comp_id, { limit: 1000 }),
                    api.fetchInsuranceSubTypes(currentCompany.comp_id, { limit: 1000 }),
                    api.fetchInsuranceFields(currentCompany.comp_id),
                    api.fetchBusinessVerticals(currentCompany.comp_id, { limit: 1000 }),
                    api.fetchSchemes(currentCompany.comp_id),
                    api.fetchProcessFlows(),
                    api.fetchDocumentMasters(),
                    api.fetchDocumentRequirements(),
                    api.fetchAllMembers(),
                ]);
                setInsuranceTypes(typesData.data);
                setInsuranceSubTypes(subTypesData.data);
                setInsuranceFields(fields.data);
                setBusinessVerticals(verticalsData.data);
                setSchemes(sch.data);
                setProcessFlows(stages);
                setDocumentMasters(docs.data);
                setDocumentRequirements(rules);
                setAllMembers(members);
            } catch (error) {
                console.error("Failed to load data", error);
                addToast("Failed to load configuration data", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, [addToast]);

    const parentTypes = useMemo(() => insuranceTypes.sort((a,b) => a.id - b.id), [insuranceTypes]);

    useEffect(() => {
        if (!selectedParentTypeId && parentTypes.length > 0) {
            const firstActive = parentTypes.find(p => p.status === 1);
            if (firstActive) {
                setSelectedParentTypeId(firstActive.id);
                setSelectedConfigTypeId(firstActive.id);
            }
        }
    }, [parentTypes, selectedParentTypeId]);

    const filteredData = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        if (!lowerCaseQuery) {
            return {
                parentTypes,
                childTypes: selectedParentTypeId ? insuranceSubTypes.filter(it => it.insurance_type_id === selectedParentTypeId).sort((a,b) => a.id - b.id) : [],
                fields: selectedConfigTypeId ? insuranceFields.filter(f => f.insurance_type_id === selectedConfigTypeId) : [],
            };
        }

        const visibleTypeIds = new Set<number>();
        const filteredFields = insuranceFields.filter(f => f.field_label.toLowerCase().includes(lowerCaseQuery));
        filteredFields.forEach(f => visibleTypeIds.add(f.insurance_type_id));

        insuranceTypes.forEach(type => { if (type.insurance_type.toLowerCase().includes(lowerCaseQuery)) { visibleTypeIds.add(type.id); } });
        insuranceSubTypes.forEach(subType => { if (subType.insurance_sub_type.toLowerCase().includes(lowerCaseQuery)) { visibleTypeIds.add(subType.id); visibleTypeIds.add(subType.insurance_type_id) } });
        
        const filteredParentTypes = parentTypes.filter(pt => visibleTypeIds.has(pt.id));
        const filteredChildTypes = selectedParentTypeId ? insuranceSubTypes.filter(it => it.insurance_type_id === selectedParentTypeId && visibleTypeIds.has(it.id)) : [];

        return {
            parentTypes: filteredParentTypes,
            childTypes: filteredChildTypes,
            fields: selectedConfigTypeId ? filteredFields.filter(f => f.insurance_type_id === selectedConfigTypeId) : [],
        };
    }, [searchQuery, parentTypes, selectedParentTypeId, selectedConfigTypeId, insuranceSubTypes, insuranceFields]);

    const openTypeModal = (item: Partial<InsuranceType & InsuranceSubType> | null, parent?: InsuranceType) => {
        let initialData: Partial<InsuranceType & InsuranceSubType>;
        if (item) {
             initialData = { ...item };
        } else if (parent) {
            initialData = { insurance_sub_type: '', insurance_type_id: parent.id, status: 1 };
        } else {
             initialData = { insurance_type: '', business_vertical_id: 0, status: 1 };
        }
        setEditingType(initialData);
        setIsTypeModalOpen(true);
    };

    const handleSaveType = async (data: Partial<InsuranceType & InsuranceSubType>) => {
        if (!canModify || !companyData) return;
        
        try {
            if ('insurance_type_id' in data) {
                if (!data.insurance_sub_type?.trim()) { addToast('Sub-Type name is required.', 'error'); return; }
                const payload = { ...data, comp_id: companyData.comp_id, client_id: companyData.client_id };
                const savedSubType = await api.saveInsuranceSubType(payload);
                setInsuranceSubTypes(prev => data.id ? prev.map(st => st.id === savedSubType.id ? savedSubType : st) : [...prev, savedSubType]);
                addToast("Insurance Sub-Type saved successfully.");
            } else {
                if (!data.insurance_type?.trim()) { addToast('Insurance Type name is required.', 'error'); return; }
                if (!data.business_vertical_id) { addToast('Business Vertical is required.', 'error'); return; }
                const payload = { ...data, comp_id: companyData.comp_id, client_id: companyData.client_id };
                const savedType = await api.saveInsuranceType(payload);
                setInsuranceTypes(prev => data.id ? prev.map(t => t.id === savedType.id ? savedType : t) : [...prev, savedType]);
                addToast("Insurance Type saved successfully.");
            }
        } catch (error) {
            addToast("Failed to save.", "error");
        }
        
        setIsTypeModalOpen(false);
    };

    const checkDependencies = (id: number, isSubType: boolean): { name: string; type: 'field' | 'policy' }[] => {
        let dependents: { name: string; type: 'field' | 'policy' }[] = [];

        if (!isSubType) {
            const children = insuranceSubTypes.filter(it => it.insurance_type_id === id);
            dependents.push(...children.map(c => ({ name: `Sub-Type: ${c.insurance_sub_type}`, type: 'field' as const })));
        }

        const schemesLinked = isSubType 
            ? schemes.filter(s => s.insurance_sub_type_id === id)
            : schemes.filter(s => s.insurance_type_id === id);
        
        dependents.push(...schemesLinked.map(s => ({ name: `Scheme: ${s.scheme_name}`, type: 'policy' as const })));

        return dependents;
    };
    
    const performToggle = async (id: number, isSubType: boolean) => {
        if (isSubType) {
            const subTypeToToggle = insuranceSubTypes.find(st => st.id === id);
            if (!subTypeToToggle) return;
            const updatedSubType = { ...subTypeToToggle, status: subTypeToToggle.status === 1 ? 0 : 1 };
            const saved = await api.saveInsuranceSubType(updatedSubType);
            setInsuranceSubTypes(prev => prev.map(st => st.id === id ? saved : st));
            addToast("Sub-Type status updated.");
        } else {
            const typeToToggle = insuranceTypes.find(t => t.id === id);
            if (!typeToToggle) return;
            const newStatus = typeToToggle.status === 1 ? 0 : 1;
            
            const updatedType = { ...typeToToggle, status: newStatus };
            const childSubTypesToUpdate = insuranceSubTypes
                .filter(st => st.insurance_type_id === id)
                .map(st => ({ ...st, status: newStatus }));

            try {
                const [savedType, ...savedSubTypes] = await Promise.all([
                    api.saveInsuranceType(updatedType),
                    ...childSubTypesToUpdate.map(st => api.saveInsuranceSubType(st))
                ]);

                setInsuranceTypes(prev => prev.map(t => t.id === id ? savedType : t));
                setInsuranceSubTypes(prev => {
                    const updatedIds = new Set(savedSubTypes.map(st => st.id));
                    return prev.map(st => {
                        const updated = savedSubTypes.find(s => s.id === st.id);
                        return updated || st;
                    });
                });
                addToast(`"${typeToToggle.insurance_type}" and its sub-types have been ${newStatus ? 'activated' : 'deactivated'}.`);
            } catch (error) {
                addToast("Failed to update status.", "error");
            }
        }
    };


    const handleToggleType = (id: number, name: string, isSubType: boolean, currentStatus: number) => {
        if (currentStatus === 1) { 
            const dependents = checkDependencies(id, isSubType);
            
            if (dependents.length > 0) {
                setItemToAction({ id, name, isSubType });
                setDependentItems(dependents);
                setIsWarningModalOpen(true);
            } else {
                performToggle(id, isSubType); 
            }
        } else {
            performToggle(id, isSubType); 
        }
    };

    const confirmWarningAction = () => {
        if (itemToAction) {
            performToggle(itemToAction.id, itemToAction.isSubType);
        }
        setIsWarningModalOpen(false);
        setItemToAction(null);
        setDependentItems([]);
    };

    const FieldManager: React.FC<{typeId: number, canCreate: boolean, canModify: boolean}> = ({typeId, canCreate, canModify}) => {
        const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
        const [editingField, setEditingField] = useState<Partial<InsuranceFieldMaster> | null>(null);

        const fieldsForType = useMemo(() => insuranceFields.filter(f => f.insurance_type_id === typeId).sort((a,b) => a.seq_no - b.seq_no), [insuranceFields, typeId]);

        const openFieldModal = (field: InsuranceFieldMaster | null) => {
            setEditingField(field ? {...field} : { 
                insurance_type_id: typeId, 
                field_label: '', 
                field_name: '', 
                field_group: 'Personal Information', 
                status: 1, 
                column_span: 1, 
                cdata_type: 'Text Input' 
            });
            setIsFieldModalOpen(true);
        };

        const handleSaveField = async (fieldData: Partial<InsuranceFieldMaster>) => {
            const fieldToSave = {
                ...fieldData,
                insurance_type_id: typeId,
                field_name: fieldData.field_label?.toLowerCase().replace(/\s/g, '') || ''
            };
            try {
                const savedField = await api.saveInsuranceField(fieldToSave);
                setInsuranceFields(prev => fieldData.id 
                    ? prev.map(f => f.id === savedField.id ? savedField : f) 
                    : [...prev, savedField]);
                addToast("Field saved successfully.");
                setIsFieldModalOpen(false);
            } catch (error) {
                addToast("Failed to save field.", "error");
            }
        };

        const handleToggleField = async (fieldId: number) => {
            const fieldToToggle = insuranceFields.find(f => f.id === fieldId);
            if (!fieldToToggle) return;
            const updatedField = { ...fieldToToggle, status: fieldToToggle.status === 1 ? 0 : 1 };
            try {
                const savedField = await api.saveInsuranceField(updatedField);
                setInsuranceFields(prev => prev.map(f => f.id === savedField.id ? savedField : f));
                addToast("Field status updated.");
            } catch (error) {
                addToast("Failed to update field status.", "error");
            }
        };
        
        const FieldModal: React.FC<{
            isOpen: boolean; onClose: () => void; onSave: (data: Partial<InsuranceFieldMaster>) => void; initialData: Partial<InsuranceFieldMaster> | null;
        }> = ({isOpen, onClose, onSave, initialData}) => {
            const groupNameOptions = useMemo(() => {
                const allGroups = [...new Set(insuranceFields.map(f => f.field_group).filter(Boolean) as string[])];
                return allGroups.sort().map(group => ({ value: group, label: group }));
            }, [insuranceFields]);

            const [fieldData, setFieldData] = useState<Partial<InsuranceFieldMaster>>({});
            useEffect(() => { if (isOpen) setFieldData(initialData || {}); }, [isOpen, initialData]);
            const handleChange = (key: keyof InsuranceFieldMaster, value: any) => setFieldData(p => ({...p, [key]: value}));
            const fieldTypes: FieldType[] = ['Text Input', 'Number Input', 'Date Input', 'Toggle (Yes/No)', 'Dropdown (Select)', 'Checkbox Group', 'Table'];

            return (
                 <Modal isOpen={isOpen} onClose={onClose} contentClassName="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl">
                    <form onSubmit={(e) => { e.preventDefault(); onSave(fieldData); }}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{initialData?.id ? 'Edit' : 'Add'} Field</h2>
                            <div className="space-y-4">
                                <Input label="Field Label" value={fieldData.field_label || ''} onChange={(e) => handleChange('field_label', e.target.value)} required disabled={!canModify}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CreatableSearchableSelect
                                        label="Group Name"
                                        options={groupNameOptions}
                                        value={fieldData.field_group || null}
                                        onChange={(value) => handleChange('field_group', value)}
                                        placeholder="Select or create a group..."
                                        disabled={!canModify}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Column Span</label>
                                        <select value={fieldData.column_span || 1} onChange={e => handleChange('column_span', Number(e.target.value) as 1 | 2 | 3)} className={selectClasses} disabled={!canModify}>
                                            <option value={1}>1 (Normal)</option>
                                            <option value={2}>2 (Half)</option>
                                            <option value={3}>3 (Full)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Field Type</label>
                                    <select value={fieldData.cdata_type || ''} onChange={e => handleChange('cdata_type', e.target.value as FieldType)} className={selectClasses} disabled={!canModify}>
                                        {fieldTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <footer className="flex justify-end gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="success" disabled={!canModify}>Save</Button>
                        </footer>
                    </form>
                </Modal>
            )
        }

        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Fields</h3>
                    <Button onClick={() => openFieldModal(null)} disabled={!canCreate}><Plus size={16}/> Add New Field</Button>
                </div>
                <div className="overflow-auto max-h-96">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase w-8">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase">Group</th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-bold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fieldsForType.map((field, idx) => (
                                <tr key={field.id} className={field.status === 0 ? 'opacity-50' : ''}>
                                    <td className="px-3 py-2 text-sm">{idx+1}</td>
                                    <td className="px-3 py-2 text-sm">{field.field_group}</td>
                                    <td className="px-3 py-2 font-medium">{field.field_label}</td>
                                    <td className="px-3 py-2"><ToggleSwitch enabled={field.status === 1} onChange={() => handleToggleField(field.id)} disabled={!canModify}/></td>
                                    <td className="px-3 py-2">
                                        <Button size="small" variant="light" className="!p-1.5" onClick={() => openFieldModal(field)} disabled={!canModify}><Edit2 size={14}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <FieldModal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} onSave={handleSaveField} initialData={editingField} />
            </div>
        );
    }
    
    const DocumentRuleManager: React.FC<{configTypeId: number, canCreate: boolean, canModify: boolean}> = ({ configTypeId, canCreate, canModify }) => {
        const [docToAdd, setDocToAdd] = useState<string>('');
        const selectedType = insuranceTypes.find(t => t.id === configTypeId) || insuranceSubTypes.find(st => st.id === configTypeId);
        const parentTypeId = selectedType && 'insurance_type_id' in selectedType ? selectedType.insurance_type_id : configTypeId;
        const subTypeId = selectedType && 'insurance_type_id' in selectedType ? configTypeId : null;
        
        const rulesForType = useMemo(() => documentRequirements.filter(r => {
            return subTypeId ? r.insu_sub_type_id === subTypeId : r.insu_type_id === parentTypeId && !r.insu_sub_type_id;
        }), [documentRequirements, parentTypeId, subTypeId]);
        
        const documentMap = useMemo(() => new Map(documentMasters.map(d => [d.id, d.doc_name])), [documentMasters]);
        const availableDocs = useMemo(() => documentMasters.filter(d => d.status === 1 && !rulesForType.some(r => r.doc_id === d.id)), [documentMasters, rulesForType]);

        const updateRules = async (newRules: DocumentRequirement[]) => {
            await api.onUpdateDocumentRequirements(newRules);
            setDocumentRequirements(newRules);
        }

        const handleAddRule = () => {
            if (!docToAdd || !canCreate || !companyData) return;
            const now = new Date().toISOString();
            const dummyUser = 1;
            const newRule = { 
                insu_type_id: parentTypeId,
                insu_sub_type_id: subTypeId,
                doc_id: Number(docToAdd), 
                is_mandatory: 0, 
                comp_id: companyData.comp_id, 
                status: 1,
            };
            updateRules([...documentRequirements, newRule as DocumentRequirement]);
            addToast("Document requirement added.");
            setDocToAdd(''); 
        };

        const handleToggleMandatory = (ruleId: number) => {
            updateRules(documentRequirements.map(r => r.id === ruleId ? { ...r, is_mandatory: r.is_mandatory === 1 ? 0 : 1 } : r));
            addToast("Requirement updated.");
        };

        const handleRemoveRule = (ruleId: number) => {
            updateRules(documentRequirements.filter(r => r.id !== ruleId));
            addToast("Requirement removed.");
        };


        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Document Requirements</h3>
                <div className="flex items-center gap-2 mb-4">
                    <select value={docToAdd} onChange={e => setDocToAdd(e.target.value)} className={selectClasses + " flex-grow"} disabled={!canCreate}>
                        <option value="">-- Select a document to add --</option>
                        {availableDocs.map(doc => (<option key={doc.id} value={doc.id}>{doc.doc_name}</option>))}
                    </select>
                    <Button onClick={handleAddRule} disabled={!docToAdd || !canCreate}><Plus size={16}/> Add</Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {rulesForType.length > 0 ? rulesForType.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                            <span className="font-medium text-sm">{documentMap.get(rule.doc_id) || 'Unknown Document'}</span>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <ToggleSwitch enabled={rule.is_mandatory === 1} onChange={() => handleToggleMandatory(rule.id)} disabled={!canModify} />
                                    Mandatory
                                </label>
                                {<Button size="small" variant="danger" className="!p-1.5" onClick={() => handleRemoveRule(rule.id)} disabled={!canModify}><Trash2 size={14}/></Button>}
                            </div>
                        </div>
                    )) : (<p className="text-center text-slate-500 py-4">No documents required for this type.</p>)}
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading policy configurations...</div>;
    const selectedParent = selectedParentTypeId ? insuranceTypes.find(it => it.id === selectedParentTypeId) : null;
    const isParentTypeSelected = selectedConfigTypeId && parentTypes.some(p => p.id === selectedConfigTypeId);
    
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Policy Configuration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3">Define Insurance types, their Sub-Type, and the specific fields & checklists for each.</p>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="Search all types, fields, and checklist items..." className="max-w-md" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Insurance Type</h4>
                        {<Button onClick={() => openTypeModal(null)} variant="primary" disabled={!canCreate}><Plus size={16}/> Add</Button>}
                    </div>
                    <div className="overflow-auto max-h-60">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase w-8">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.parentTypes.map((item, index) => (
                                    <tr key={item.id} onClick={() => { setSelectedParentTypeId(item.id); setSelectedConfigTypeId(item.id); }}
                                        className={`cursor-pointer ${selectedParentTypeId === item.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${item.status === 0 ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                                        <td className="px-3 py-2 font-medium">{item.insurance_type}</td>
                                        <td className="px-3 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleType(item.id, item.insurance_type, false, item.status)} disabled={!canModify}/></td>
                                        <td className="px-3 py-2">
                                            <Button size="small" variant="light" className="!p-1.5" onClick={(e) => { e.stopPropagation(); openTypeModal(item); }} disabled={!canModify}><Edit2 size={14}/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Manage Insurance Sub-Type</h4>
                        {<Button onClick={() => { if (!selectedParent) { addToast('Please select a Insurance type first.', 'error'); return; } openTypeModal(null, selectedParent); }} variant="primary" disabled={!canCreate}><Plus size={16}/> Add</Button>}
                    </div>
                    <div className="overflow-auto max-h-60">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase w-8">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.childTypes.map((item, index) => (
                                    <tr key={item.id} onClick={() => { setSelectedConfigTypeId(item.id); }}
                                        className={`cursor-pointer ${selectedConfigTypeId === selectedParentTypeId ? '' : selectedConfigTypeId === item.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${item.status === 0 ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                                        <td className="px-3 py-2 font-medium">{item.insurance_sub_type}</td>
                                        <td className="px-3 py-2"><ToggleSwitch enabled={item.status === 1} onChange={() => handleToggleType(item.id, item.insurance_sub_type, true, item.status)} disabled={!canModify}/></td>
                                        <td className="px-3 py-2">
                                            <Button size="small" variant="light" className="!p-1.5" onClick={(e) => { e.stopPropagation(); openTypeModal(item, selectedParent); }} disabled={!canModify}><Edit2 size={14}/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {selectedConfigTypeId && (
                <div className="animate-fade-in space-y-6">
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300"> Configure for: <span className="text-blue-600 dark:text-blue-400">
                        {insuranceTypes.find(it => it.id === selectedConfigTypeId)?.insurance_type || insuranceSubTypes.find(it => it.id === selectedConfigTypeId)?.insurance_sub_type}
                    </span> </h4>
                    {isParentTypeSelected && selectedParent && (
                        <ProcessStageManager
                            key={`psm-${selectedConfigTypeId}`}
                            title="Manage Process Flow"
                            insuranceTypeId={selectedParent.id}
                            items={processFlows.filter(psm => psm.insurance_type_id === selectedParent.id)}
                            onUpdate={async (updatedStages) => {
                                const otherStages = processFlows.filter(psm => psm.insurance_type_id !== selectedParent.id);
                                const allStages = [...otherStages, ...updatedStages].sort((a,b) => a.id - b.id);
                                await api.onUpdateProcessFlows(allStages);
                                setProcessFlows(allStages);
                            }}
                            allMembers={allMembers}
                            canCreate={canCreate}
                            canModify={canModify}
                        />
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FieldManager typeId={selectedConfigTypeId} canCreate={canCreate} canModify={canModify} />
                        <DocumentRuleManager key={selectedConfigTypeId} configTypeId={selectedConfigTypeId} canCreate={canCreate} canModify={canModify} />
                    </div>
                </div>
            )}

            <InsuranceTypeModal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} onSave={handleSaveType} initialData={editingType} businessVerticals={businessVerticals} parentType={editingType && 'insurance_type_id' in editingType ? parentTypes.find(p => p.id === editingType.insurance_type_id) : undefined} canModify={canModify} />

            <Modal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} contentClassName="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">Deactivate "{itemToAction?.name}"?</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">This item is currently used by <strong>{dependentItems.length} record(s)</strong>. Deactivating it may cause data inconsistencies.</p>
                            <ul className="text-xs text-gray-400 dark:text-gray-500 mt-2 list-disc list-inside max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                {dependentItems.slice(0, 5).map((item, index) => <li key={index}>{item.name}</li>)}
                                {dependentItems.length > 5 && <li>...and {dependentItems.length - 5} more.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button variant="danger" onClick={confirmWarningAction}>Deactivate Anyway</Button>
                    <Button variant="secondary" onClick={() => setIsWarningModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>
        </div>
    );
};

export default PolicyConfigurationPage;