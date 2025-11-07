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
    const isSubType = 'INSURANCE_TYPE_ID' in formData || !!parentType;

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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.ID ? 'Edit' : 'Add'} {isSubType ? 'Insurance Sub-Type' : 'Insurance Type'}</h2>
                    {parentType && <p className="text-sm text-gray-500 dark:text-gray-400">Adding as a Sub-Type of "{parentType.INSURANCE_TYPE}"</p>}
                </div>
                <div className="space-y-4">
                    {!isSubType && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Vertical</label>
                            <select
                                value={formData.BUSINESS_VERTICAL_ID || ''}
                                onChange={(e) => handleChange('BUSINESS_VERTICAL_ID', Number(e.target.value))}
                                className={selectClasses}
                                required
                                disabled={!canModify}
                            >
                                <option value="">-- Select Vertical --</option>
                                {businessVerticals.filter(bv => bv.STATUS === 1).map(bv => (
                                    <option key={bv.ID} value={bv.ID}>{bv.BUSINESS_VERTICAL_NAME}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Input 
                        label="Name" 
                        value={isSubType ? formData.INSURANCE_SUB_TYPE || '' : formData.INSURANCE_TYPE || ''} 
                        onChange={(e) => handleChange(isSubType ? 'INSURANCE_SUB_TYPE' : 'INSURANCE_TYPE', e.target.value)} 
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

    const canCreate = companyData?.STATUS === 1;
    const canModify = companyData?.STATUS === 1;

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                const user = await api.fetchCurrentUser();
                const companies = await api.fetchCompanies();
                const currentCompany = companies.find(c => c.COMP_ID === user.comp_id) || null;
                setCompanyData(currentCompany);

                const [types, subTypes, fields, verticals, sch, stages, docs, rules, members] = await Promise.all([
                    api.fetchInsuranceTypes(),
                    api.fetchInsuranceSubTypes(),
                    api.fetchInsuranceFields(),
                    api.fetchBusinessVerticals(),
                    api.fetchSchemes(),
                    api.fetchProcessFlows(),
                    api.fetchDocumentMasters(),
                    api.fetchDocumentRequirements(),
                    api.fetchAllMembers(),
                ]);
                setInsuranceTypes(types);
                setInsuranceSubTypes(subTypes);
                setInsuranceFields(fields);
                setBusinessVerticals(verticals);
                setSchemes(sch);
                setProcessFlows(stages);
                setDocumentMasters(docs);
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

    const parentTypes = useMemo(() => insuranceTypes.sort((a,b) => a.ID - b.ID), [insuranceTypes]);

    useEffect(() => {
        if (!selectedParentTypeId && parentTypes.length > 0) {
            const firstActive = parentTypes.find(p => p.STATUS === 1);
            if (firstActive) {
                setSelectedParentTypeId(firstActive.ID);
                setSelectedConfigTypeId(firstActive.ID);
            }
        }
    }, [parentTypes, selectedParentTypeId]);

    const filteredData = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        if (!lowerCaseQuery) {
            return {
                parentTypes,
                childTypes: selectedParentTypeId ? insuranceSubTypes.filter(it => it.INSURANCE_TYPE_ID === selectedParentTypeId).sort((a,b) => a.ID - b.ID) : [],
                fields: selectedConfigTypeId ? insuranceFields.filter(f => f.INSURANCE_TYPE_ID === selectedConfigTypeId) : [],
            };
        }

        const visibleTypeIds = new Set<number>();
        const filteredFields = insuranceFields.filter(f => f.FIELD_LABEL.toLowerCase().includes(lowerCaseQuery));
        filteredFields.forEach(f => visibleTypeIds.add(f.INSURANCE_TYPE_ID));

        insuranceTypes.forEach(type => { if (type.INSURANCE_TYPE.toLowerCase().includes(lowerCaseQuery)) { visibleTypeIds.add(type.ID); } });
        insuranceSubTypes.forEach(subType => { if (subType.INSURANCE_SUB_TYPE.toLowerCase().includes(lowerCaseQuery)) { visibleTypeIds.add(subType.ID); visibleTypeIds.add(subType.INSURANCE_TYPE_ID) } });
        
        const filteredParentTypes = parentTypes.filter(pt => visibleTypeIds.has(pt.ID));
        const filteredChildTypes = selectedParentTypeId ? insuranceSubTypes.filter(it => it.INSURANCE_TYPE_ID === selectedParentTypeId && visibleTypeIds.has(it.ID)) : [];

        return {
            parentTypes: filteredParentTypes,
            childTypes: filteredChildTypes,
            fields: selectedConfigTypeId ? filteredFields.filter(f => f.INSURANCE_TYPE_ID === selectedConfigTypeId) : [],
        };
    }, [searchQuery, parentTypes, selectedParentTypeId, selectedConfigTypeId, insuranceSubTypes, insuranceFields]);

    const openTypeModal = (item: Partial<InsuranceType & InsuranceSubType> | null, parent?: InsuranceType) => {
        let initialData: Partial<InsuranceType & InsuranceSubType>;
        if (item) {
             initialData = { ...item };
        } else if (parent) {
            initialData = { INSURANCE_SUB_TYPE: '', INSURANCE_TYPE_ID: parent.ID, STATUS: 1 };
        } else {
             initialData = { INSURANCE_TYPE: '', BUSINESS_VERTICAL_ID: 0, STATUS: 1 };
        }
        setEditingType(initialData);
        setIsTypeModalOpen(true);
    };

    const handleSaveType = async (data: Partial<InsuranceType & InsuranceSubType>) => {
        if (!canModify) return;
        const now = new Date().toISOString();

        if ('INSURANCE_TYPE_ID' in data) {
            if (!data.INSURANCE_SUB_TYPE?.trim()) { addToast('Sub-Type name is required.', 'error'); return; }
            
            let updatedSubTypes: InsuranceSubType[];
            if (data.ID) {
                updatedSubTypes = insuranceSubTypes.map(st => st.ID === data.ID ? { ...st, ...data } as InsuranceSubType : st);
            } else {
                const newSubType: InsuranceSubType = {
                    ID: Date.now(),
                    INSURANCE_SUB_TYPE: data.INSURANCE_SUB_TYPE.trim(),
                    INSURANCE_TYPE_ID: data.INSURANCE_TYPE_ID!,
                    STATUS: 1,
                    COMP_ID: 1, CLIENT_ID: 101, CREATED_BY: 1, MODIFIED_BY: 1, DATE_OF_CREATION: now, MODIFIED_ON: now,
                };
                updatedSubTypes = [...insuranceSubTypes, newSubType];
            }
            await api.onUpdateInsuranceSubTypes(updatedSubTypes);
            setInsuranceSubTypes(updatedSubTypes);
            addToast("Insurance Sub-Type saved successfully.");

        } else {
            if (!data.INSURANCE_TYPE?.trim()) { addToast('Insurance Type name is required.', 'error'); return; }
            if (!data.BUSINESS_VERTICAL_ID) { addToast('Business Vertical is required.', 'error'); return; }
            
            let updatedTypes: InsuranceType[];
            if (data.ID) {
                updatedTypes = insuranceTypes.map(t => t.ID === data.ID ? { ...t, ...data } as InsuranceType : t);
            } else {
                const newType: InsuranceType = {
                    ID: Date.now(),
                    INSURANCE_TYPE: data.INSURANCE_TYPE.trim(),
                    BUSINESS_VERTICAL_ID: data.BUSINESS_VERTICAL_ID,
                    STATUS: 1,
                    COMP_ID: 1, CLIENT_ID: 101, CREATED_BY: 1, MODIFIED_BY: 1, DATE_OF_CREATION: now, MODIFIED_ON: now,
                };
                updatedTypes = [...insuranceTypes, newType];
            }
            await api.onUpdateInsuranceTypes(updatedTypes);
            setInsuranceTypes(updatedTypes);
            addToast("Insurance Type saved successfully.");
        }
        
        setIsTypeModalOpen(false);
    };

    const checkDependencies = (id: number, isSubType: boolean): { name: string; type: 'field' | 'policy' }[] => {
        let dependents: { name: string; type: 'field' | 'policy' }[] = [];

        if (!isSubType) {
            const children = insuranceSubTypes.filter(it => it.INSURANCE_TYPE_ID === id);
            dependents.push(...children.map(c => ({ name: `Sub-Type: ${c.INSURANCE_SUB_TYPE}`, type: 'field' as const })));
        }

        const schemesLinked = isSubType 
            ? schemes.filter(s => s.INSURANCE_SUB_TYPE_ID === id)
            : schemes.filter(s => s.INSURANCE_TYPE_ID === id);
        
        dependents.push(...schemesLinked.map(s => ({ name: `Scheme: ${s.SCHEME_NAME}`, type: 'policy' as const })));

        return dependents;
    };
    
    const performToggle = async (id: number, isSubType: boolean) => {
        if(isSubType) {
            const updated = insuranceSubTypes.map(st => st.ID === id ? {...st, STATUS: st.STATUS === 1 ? 0 : 1} : st);
            await api.onUpdateInsuranceSubTypes(updated);
            setInsuranceSubTypes(updated);
            addToast("Sub-Type status updated.");
        } else {
            const typeToToggle = insuranceTypes.find(t => t.ID === id);
            if(!typeToToggle) return;
            const newStatus = typeToToggle.STATUS === 1 ? 0 : 1;
            
            const updatedTypes = insuranceTypes.map(it => it.ID === id ? { ...it, STATUS: newStatus } : it);
            const childIds = insuranceSubTypes.filter(it => it.INSURANCE_TYPE_ID === id).map(it => it.ID);
            const updatedSubTypes = insuranceSubTypes.map(it => childIds.includes(it.ID) ? { ...it, STATUS: newStatus } : it);
            
            await Promise.all([
                api.onUpdateInsuranceTypes(updatedTypes),
                api.onUpdateInsuranceSubTypes(updatedSubTypes)
            ]);
            setInsuranceTypes(updatedTypes);
            setInsuranceSubTypes(updatedSubTypes);
            addToast(`"${typeToToggle.INSURANCE_TYPE}" and its sub-types have been ${newStatus ? 'activated' : 'deactivated'}.`);
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

        const fieldsForType = useMemo(() => insuranceFields.filter(f => f.INSURANCE_TYPE_ID === typeId).sort((a,b) => a.SEQ_NO - b.SEQ_NO), [insuranceFields, typeId]);

        const openFieldModal = (field: InsuranceFieldMaster | null) => {
            setEditingField(field ? {...field} : { 
                INSURANCE_TYPE_ID: typeId, 
                FIELD_LABEL: '', 
                FIELD_NAME: '', 
                FIELD_GROUP: 'Personal Information', 
                STATUS: 1, 
                COLUMN_SPAN: 1, 
                CDATA_TYPE: 'Text Input' 
            });
            setIsFieldModalOpen(true);
        };

        const handleSaveField = async (fieldData: Partial<InsuranceFieldMaster>) => {
            let updatedFields;
            const fieldToSave = {
                ...fieldData,
                INSURANCE_TYPE_ID: typeId,
                FIELD_NAME: fieldData.FIELD_LABEL?.toLowerCase().replace(/\s/g, '') || ''
            }
            if (fieldData.ID) {
                updatedFields = insuranceFields.map(f => f.ID === fieldData.ID ? (fieldToSave as InsuranceFieldMaster) : f);
            } else {
                const newField: InsuranceFieldMaster = {
                    ID: Date.now(),
                    SEQ_NO: insuranceFields.length,
                    ...fieldToSave
                } as InsuranceFieldMaster;
                updatedFields = [...insuranceFields, newField];
            }
            await api.onUpdateInsuranceFields(updatedFields);
            setInsuranceFields(updatedFields);
            addToast("Field saved successfully.");
            setIsFieldModalOpen(false);
        };

        const handleToggleField = async (fieldId: number) => {
            const updatedFields = insuranceFields.map(f => f.ID === fieldId ? {...f, STATUS: f.STATUS === 1 ? 0 : 1} : f);
            await api.onUpdateInsuranceFields(updatedFields);
            setInsuranceFields(updatedFields);
            addToast("Field status updated.");
        };
        
        const FieldModal: React.FC<{
            isOpen: boolean; onClose: () => void; onSave: (data: Partial<InsuranceFieldMaster>) => void; initialData: Partial<InsuranceFieldMaster> | null;
        }> = ({isOpen, onClose, onSave, initialData}) => {
            const groupNameOptions = useMemo(() => {
                const allGroups = [...new Set(insuranceFields.map(f => f.FIELD_GROUP).filter(Boolean) as string[])];
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
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{initialData?.ID ? 'Edit' : 'Add'} Field</h2>
                            <div className="space-y-4">
                                <Input label="Field Label" value={fieldData.FIELD_LABEL || ''} onChange={(e) => handleChange('FIELD_LABEL', e.target.value)} required disabled={!canModify}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CreatableSearchableSelect
                                        label="Group Name"
                                        options={groupNameOptions}
                                        value={fieldData.FIELD_GROUP || null}
                                        onChange={(value) => handleChange('FIELD_GROUP', value)}
                                        placeholder="Select or create a group..."
                                        disabled={!canModify}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Column Span</label>
                                        <select value={fieldData.COLUMN_SPAN || 1} onChange={e => handleChange('COLUMN_SPAN', Number(e.target.value) as 1 | 2 | 3)} className={selectClasses} disabled={!canModify}>
                                            <option value={1}>1 (Normal)</option>
                                            <option value={2}>2 (Half)</option>
                                            <option value={3}>3 (Full)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Field Type</label>
                                    <select value={fieldData.CDATA_TYPE || ''} onChange={e => handleChange('CDATA_TYPE', e.target.value as FieldType)} className={selectClasses} disabled={!canModify}>
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
                                <tr key={field.ID} className={field.STATUS === 0 ? 'opacity-50' : ''}>
                                    <td className="px-3 py-2 text-sm">{idx+1}</td>
                                    <td className="px-3 py-2 text-sm">{field.FIELD_GROUP}</td>
                                    <td className="px-3 py-2 font-medium">{field.FIELD_LABEL}</td>
                                    <td className="px-3 py-2"><ToggleSwitch enabled={field.STATUS === 1} onChange={() => handleToggleField(field.ID)} disabled={!canModify}/></td>
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
        const selectedType = insuranceTypes.find(t => t.ID === configTypeId) || insuranceSubTypes.find(st => st.ID === configTypeId);
        const parentTypeId = selectedType && 'INSURANCE_TYPE_ID' in selectedType ? selectedType.INSURANCE_TYPE_ID : configTypeId;
        const subTypeId = selectedType && 'INSURANCE_TYPE_ID' in selectedType ? configTypeId : null;
        
        const rulesForType = useMemo(() => documentRequirements.filter(r => {
            return subTypeId ? r.INSU_SUB_TYPE_ID === subTypeId : r.INSU_TYPE_ID === parentTypeId && !r.INSU_SUB_TYPE_ID;
        }), [documentRequirements, parentTypeId, subTypeId]);
        
        const documentMap = useMemo(() => new Map(documentMasters.map(d => [d.ID, d.DOC_NAME])), [documentMasters]);
        const availableDocs = useMemo(() => documentMasters.filter(d => d.STATUS === 1 && !rulesForType.some(r => r.DOC_ID === d.ID)), [documentMasters, rulesForType]);

        const updateRules = async (newRules: DocumentRequirement[]) => {
            await api.onUpdateDocumentRequirements(newRules);
            setDocumentRequirements(newRules);
        }

        const handleAddRule = () => {
            if (!docToAdd || !canCreate) return;
            const newRule: DocumentRequirement = { 
                ID: Date.now(), 
                INSU_TYPE_ID: parentTypeId,
                INSU_SUB_TYPE_ID: subTypeId,
                DOC_ID: Number(docToAdd), 
                IS_MANDATORY: 0, 
                COMP_ID: 1, STATUS: 1, CREATED_BY: 1, MODIFIED_BY: 1, CREATED_ON: new Date().toISOString(), MODIFIED_ON: new Date().toISOString() 
            };
            updateRules([...documentRequirements, newRule]);
            addToast("Document requirement added.");
            setDocToAdd(''); 
        };

        const handleToggleMandatory = (ruleId: number) => {
            updateRules(documentRequirements.map(r => r.ID === ruleId ? { ...r, IS_MANDATORY: r.IS_MANDATORY === 1 ? 0 : 1 } : r));
            addToast("Requirement updated.");
        };

        const handleRemoveRule = (ruleId: number) => {
            updateRules(documentRequirements.filter(r => r.ID !== ruleId));
            addToast("Requirement removed.");
        };


        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Document Requirements</h3>
                <div className="flex items-center gap-2 mb-4">
                    <select value={docToAdd} onChange={e => setDocToAdd(e.target.value)} className={selectClasses + " flex-grow"} disabled={!canCreate}>
                        <option value="">-- Select a document to add --</option>
                        {availableDocs.map(doc => (<option key={doc.ID} value={doc.ID}>{doc.DOC_NAME}</option>))}
                    </select>
                    <Button onClick={handleAddRule} disabled={!docToAdd || !canCreate}><Plus size={16}/> Add</Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {rulesForType.length > 0 ? rulesForType.map(rule => (
                        <div key={rule.ID} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                            <span className="font-medium text-sm">{documentMap.get(rule.DOC_ID) || 'Unknown Document'}</span>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <ToggleSwitch enabled={rule.IS_MANDATORY === 1} onChange={() => handleToggleMandatory(rule.ID)} disabled={!canModify} />
                                    Mandatory
                                </label>
                                {<Button size="small" variant="danger" className="!p-1.5" onClick={() => handleRemoveRule(rule.ID)} disabled={!canModify}><Trash2 size={14}/></Button>}
                            </div>
                        </div>
                    )) : (<p className="text-center text-slate-500 py-4">No documents required for this type.</p>)}
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading policy configurations...</div>;
    const selectedParent = selectedParentTypeId ? insuranceTypes.find(it => it.ID === selectedParentTypeId) : null;
    const isParentTypeSelected = selectedConfigTypeId && parentTypes.some(p => p.ID === selectedConfigTypeId);
    
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
                                    <tr key={item.ID} onClick={() => { setSelectedParentTypeId(item.ID); setSelectedConfigTypeId(item.ID); }}
                                        className={`cursor-pointer ${selectedParentTypeId === item.ID ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${item.STATUS === 0 ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                                        <td className="px-3 py-2 font-medium">{item.INSURANCE_TYPE}</td>
                                        <td className="px-3 py-2"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggleType(item.ID, item.INSURANCE_TYPE, false, item.STATUS)} disabled={!canModify}/></td>
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
                                    <tr key={item.ID} onClick={() => { setSelectedConfigTypeId(item.ID); }}
                                        className={`cursor-pointer ${selectedConfigTypeId === selectedParentTypeId ? '' : selectedConfigTypeId === item.ID ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} ${item.STATUS === 0 ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                                        <td className="px-3 py-2 font-medium">{item.INSURANCE_SUB_TYPE}</td>
                                        <td className="px-3 py-2"><ToggleSwitch enabled={item.STATUS === 1} onChange={() => handleToggleType(item.ID, item.INSURANCE_SUB_TYPE, true, item.STATUS)} disabled={!canModify}/></td>
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
                        {insuranceTypes.find(it => it.ID === selectedConfigTypeId)?.INSURANCE_TYPE || insuranceSubTypes.find(it => it.ID === selectedConfigTypeId)?.INSURANCE_SUB_TYPE}
                    </span> </h4>
                    {isParentTypeSelected && selectedParent && (
                        <ProcessStageManager
                            key={`psm-${selectedConfigTypeId}`}
                            title="Manage Process Flow"
                            insuranceTypeId={selectedParent.ID}
                            items={processFlows.filter(psm => psm.INSURANCE_TYPE_ID === selectedParent.ID)}
                            onUpdate={async (updatedStages) => {
                                const otherStages = processFlows.filter(psm => psm.INSURANCE_TYPE_ID !== selectedParent.ID);
                                const allStages = [...otherStages, ...updatedStages].sort((a,b) => a.ID - b.ID);
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

            <InsuranceTypeModal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} onSave={handleSaveType} initialData={editingType} businessVerticals={businessVerticals} parentType={editingType && 'INSURANCE_TYPE_ID' in editingType ? parentTypes.find(p => p.ID === editingType.INSURANCE_TYPE_ID) : undefined} canModify={canModify} />

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