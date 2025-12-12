import React, { useEffect, useState, useRef } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { policyApi } from '../../services/masterDataApi/policy.api';
import { InsuranceType, InsuranceSubType, ProcessFlow, PolicyField, PolicyDocument, DocumentMaster, BusinessVertical } from '../../types';
import { Plus, GripVertical, GitBranch, CheckSquare, FileText, ChevronDown } from 'lucide-react';
import { Button, Input, Select, Modal, Toggle, DataTable } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { useMasterCrud } from '../../hooks/useMasterCrud';
import toast from 'react-hot-toast';

const PolicyConfigurationPage: React.FC = () => {
  const [activeParent, setActiveParent] = useState<InsuranceType | null>(null);
  const [activeChild, setActiveChild] = useState<InsuranceSubType | null>(null);
  
  const { data: verticals } = useFetch<BusinessVertical[]>('/businessVerticals');
  const { data: types, refetch: refetchTypes, setData: setTypes } = useFetch<InsuranceType[]>('/insuranceTypes');
  const { data: subTypes, refetch: refetchSubTypes, setData: setSubTypes } = useFetch<InsuranceSubType[]>('/insuranceSubTypes');
  const { data: docMasters } = useFetch<DocumentMaster[]>('/documentMasters');
  
  const [processFlows, setProcessFlows] = useState<ProcessFlow[]>([]);
  const [fields, setFields] = useState<PolicyField[]>([]);
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);

  const typeCrud = useMasterCrud({ api: { create: policyApi.createType, update: policyApi.updateType, patch: policyApi.patchType }, refetch: refetchTypes, updateLocalData: setTypes, validate: i => !i.insurance_type ? "Name required" : null, defaults: { client_id: 1, comp_id: 1001 } });
  const subTypeCrud = useMasterCrud({ api: { create: policyApi.createSubType, update: policyApi.updateSubType, patch: policyApi.patchSubType }, refetch: refetchSubTypes, updateLocalData: setSubTypes, validate: i => !i.insurance_sub_type ? "Name required" : null, defaults: { client_id: 1, comp_id: 1001 } });
  
  const fetchConfigsWrapper = () => fetchConfigurationData();

  const processCrud = useMasterCrud({ api: { create: policyApi.createProcess, update: policyApi.updateProcess, patch: policyApi.patchProcess }, refetch: fetchConfigsWrapper, validate: i => !i.process_desc ? "Name required" : null, defaults: { client_id: 1, comp_id: 1001, repeat: false } });
  const fieldCrud = useMasterCrud({ api: { create: policyApi.createField, update: policyApi.updateField, patch: policyApi.patchField }, refetch: fetchConfigsWrapper, validate: i => !i.field_label ? "Label required" : null, defaults: { column_span: 1, field_type: 'Text Input' } });

  const [selectedDocId, setSelectedDocId] = useState<string | number>('');
  
  const [groupSearch, setGroupSearch] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const groupWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeParent) fetchConfigurationData();
  }, [activeParent, activeChild]);

  const fetchConfigurationData = async () => {
    const typeId = activeParent?.id;
    const subTypeId = activeChild?.id;
    if (!typeId) return;

    try {
      if (!activeChild) {
        const pfRes = await policyApi.getProcessFlows();
        if (pfRes.data) setProcessFlows(pfRes.data.filter(pf => pf.insurance_type_id == typeId).sort((a,b) => a.seq_no - b.seq_no));
      }
      const fRes = await policyApi.getFields();
      if (fRes.data) setFields(fRes.data.filter(f => activeChild ? f.insurance_sub_type_id == subTypeId : (f.insurance_type_id == typeId && !f.insurance_sub_type_id)));
      
      const dRes = await policyApi.getDocuments();
      if (dRes.data) setDocuments(dRes.data.filter(d => activeChild ? d.insurance_sub_type_id == subTypeId : (d.insurance_type_id == typeId && !d.insurance_sub_type_id)));
    } catch (error) { console.error(error); }
  };

  const handleAddDocument = async () => {
    if (!selectedDocId) return;
    await policyApi.createDocument({ insurance_type_id: activeParent!.id!, insurance_sub_type_id: activeChild?.id, doc_master_id: selectedDocId, is_mandatory: true });
    setSelectedDocId('');
    fetchConfigurationData();
    toast.success("Document added");
  };

  const handleToggleDocMandatory = async (doc: PolicyDocument) => {
      const newValue = !doc.is_mandatory;
      setDocuments(prev => prev.map(d => d.id === doc.id ? {...d, is_mandatory: newValue} : d));
      if (doc.id) await policyApi.updateDocument(doc.id, { ...doc, is_mandatory: newValue });
      toast.success("Requirement updated");
  };

  const handleDeleteDoc = async (id: number | string) => {
      if (confirm("Remove requirement?")) {
        await policyApi.deleteDocument(id);
        fetchConfigurationData();
        toast.success("Removed");
      }
  };

  // --- CASCADE TOGGLE HANDLERS ---

  const handleToggleType = async (item: InsuranceType) => {
    const newStatus = item.status === 1 ? 0 : 1;
    setTypes(prev => prev?.map(t => t.id === item.id ? { ...t, status: newStatus } : t) || []);
    
    const promises: Promise<any>[] = [policyApi.patchType(item.id!, { status: newStatus })];
    let updateCount = 0;

    // Cascade to SubTypes
    const childSubTypes = subTypes?.filter(st => st.insurance_type_id == item.id) || [];
    childSubTypes.forEach(st => {
        if (st.status !== newStatus) {
            setSubTypes(prev => prev?.map(s => s.id === st.id ? { ...s, status: newStatus } : s) || []);
            promises.push(policyApi.patchSubType(st.id!, { status: newStatus }));
            updateCount++;
        }
    });

    // Cascade to Flows and Fields (Fetch all to ensure we get children linked to Type)
    try {
        const [flowsRes, fieldsRes] = await Promise.all([policyApi.getProcessFlows(), policyApi.getFields()]);
        const allFlows = flowsRes.data || [];
        const allFields = fieldsRes.data || [];

        const relatedFlows = allFlows.filter(f => f.insurance_type_id == item.id && f.status !== newStatus);
        const relatedFields = allFields.filter(f => f.insurance_type_id == item.id && f.status !== newStatus);

        relatedFlows.forEach(f => {
             promises.push(policyApi.patchProcess(f.id!, { status: newStatus }));
             updateCount++;
        });
        
        relatedFields.forEach(f => {
             promises.push(policyApi.patchField(f.id!, { status: newStatus }));
             updateCount++;
        });
        
        // Update View State if currently viewing this type
        if (activeParent?.id === item.id) {
            setProcessFlows(prev => prev.map(p => ({...p, status: newStatus})));
            setFields(prev => prev.map(f => ({...f, status: newStatus})));
        }

        await Promise.all(promises);
        toast.success(newStatus === 1 ? `Activated Type and ${updateCount} related items` : `Deactivated Type and ${updateCount} related items`);

    } catch(e) {
        refetchTypes(); // Revert
        toast.error("Failed to update status");
    }
  };

  const handleToggleSubType = async (item: InsuranceSubType) => {
    const newStatus = item.status === 1 ? 0 : 1;
    setSubTypes(prev => prev?.map(s => s.id === item.id ? { ...s, status: newStatus } : s) || []);
    
    const promises: Promise<any>[] = [policyApi.patchSubType(item.id!, { status: newStatus })];
    let updateCount = 0;

    try {
        const fieldsRes = await policyApi.getFields();
        const relatedFields = (fieldsRes.data || []).filter(f => f.insurance_sub_type_id == item.id && f.status !== newStatus);

        relatedFields.forEach(f => {
             promises.push(policyApi.patchField(f.id!, { status: newStatus }));
             updateCount++;
        });

        // Update View State if currently viewing this subtype
        if (activeChild?.id === item.id) {
            setFields(prev => prev.map(f => ({...f, status: newStatus})));
        }

        await Promise.all(promises);
        toast.success(newStatus === 1 ? `Activated Sub-Type and ${updateCount} items` : `Deactivated Sub-Type and ${updateCount} items`);
    } catch (e) {
        refetchSubTypes();
        toast.error("Failed to update status");
    }
  };

  const uniqueGroups = Array.from(
    new Set<string>(fields.map(f => f.group_name).filter((g): g is string => !!g))
  ).sort();

  const filteredGroups = uniqueGroups.filter(g =>
    g.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const openProcessModal = (item?: ProcessFlow) => processCrud.handleOpenModal(item || { insurance_type_id: activeParent?.id, seq_no: processFlows.length + 1 } as any);
  const openFieldModal = (item?: PolicyField) => {
      setGroupSearch(item?.group_name || '');
      fieldCrud.handleOpenModal(item || { insurance_type_id: activeParent?.id, insurance_sub_type_id: activeChild?.id } as any);
  };

  return (
    <MasterDataLayout title="Policy Configuration">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PARENT: INSURANCE TYPE */}
            <Section title="Manage Insurance Type" crud={typeCrud}>
                <DataTable data={types || []} columns={[{ header: 'Name', accessor: 'insurance_type', className: 'font-bold' }]}
                    onEdit={typeCrud.handleOpenModal} 
                    onToggleStatus={handleToggleType} // Custom cascade handler
                    onRowClick={(item) => { setActiveParent(item); setActiveChild(null); }}
                    selectedId={activeParent?.id}
                />
            </Section>

            {/* CHILD: INSURANCE SUB-TYPE */}
            <Section title="Manage Insurance Sub-Type" crud={subTypeCrud} onAdd={() => subTypeCrud.handleOpenModal({ insurance_type_id: activeParent?.id } as any)} disableAdd={!activeParent}>
                {activeParent ? (
                    <DataTable data={subTypes?.filter(st => st.insurance_type_id == activeParent.id) || []} columns={[{ header: 'Name', accessor: 'insurance_sub_type', className: 'font-bold' }]}
                        onEdit={subTypeCrud.handleOpenModal} 
                        onToggleStatus={handleToggleSubType} // Custom cascade handler
                        emptyMessage={`No Sub-Types for ${activeParent.insurance_type}`}
                        onRowClick={(item) => setActiveChild(item)}
                        selectedId={activeChild?.id}
                    />
                ) : <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm p-6">Select an Insurance Type</div>}
            </Section>
        </div>

        {(activeParent) && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-4"><h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">Configure: <span className="text-blue-600 font-bold">{activeChild ? `${activeParent.insurance_type} > ${activeChild.insurance_sub_type}` : activeParent.insurance_type}</span></h2></div>

                {!activeChild && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-6 flex flex-col">
                        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><GitBranch size={18} /> Process Flow</h3><Button size="sm" onClick={() => openProcessModal()} icon={<Plus size={14} />}>Add Stage</Button></div>
                        <DataTable data={processFlows} columns={[{ header: '', accessor: () => <GripVertical size={16} className="text-slate-300"/>, width: 'w-10' }, { header: 'Seq', accessor: 'seq_no', width: 'w-16' }, { header: 'Name', accessor: 'process_desc', className: 'font-bold' }]}
                            onEdit={openProcessModal} onToggleStatus={item => { processCrud.handleToggleStatus(item); setProcessFlows(p => p.map(x => x.id === item.id ? {...x, status: x.status===1?0:1} : x)) }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* FIELDS */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[400px]">
                        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><CheckSquare size={18} /> Fields</h3><Button size="sm" onClick={() => openFieldModal()} icon={<Plus size={14} />}>Add Field</Button></div>
                        <DataTable data={fields} columns={[{ header: 'Label', accessor: 'field_label', className: 'font-medium' }, { header: 'Group', accessor: (item) => item.group_name ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{item.group_name}</span> : '-' }, { header: 'Type', accessor: 'field_type', className: 'text-xs font-mono' }]}
                            onEdit={openFieldModal} onToggleStatus={item => { fieldCrud.handleToggleStatus(item); setFields(f => f.map(x => x.id === item.id ? {...x, status: x.status===1?0:1} : x)) }}
                        />
                    </div>

                    {/* DOCUMENTS */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[400px]">
                        <div className="px-6 py-4 border-b"><h3 className="font-bold flex items-center gap-2 mb-3"><FileText size={18} /> Documents</h3><div className="flex gap-2"><Select options={docMasters?.filter(dm => dm.status === 1 && !documents.some(d => d.doc_master_id == dm.id)).map(d => ({ label: d.doc_name, value: d.id! })) || []} value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} placeholder="Select doc" /><Button onClick={handleAddDocument} disabled={!selectedDocId} size="sm">Add</Button></div></div>
                        <div className="flex-1 overflow-auto p-4 space-y-2">
                             {documents.map(doc => (
                                 <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded border border-gray-100 dark:border-slate-700">
                                     <span className="font-medium text-slate-800 dark:text-white">{docMasters?.find(dm => dm.id == doc.doc_master_id)?.doc_name}</span>
                                     <div className="flex items-center gap-4"><div className="flex items-center gap-2"><Toggle checked={doc.is_mandatory} onChange={() => handleToggleDocMandatory(doc)} size="sm"/><span className="text-xs text-slate-500">{doc.is_mandatory ? 'Mandatory' : 'Optional'}</span></div><Button variant="danger" size="icon" onClick={() => handleDeleteDoc(doc.id!)} className="h-6 w-6"><Plus size={14} className="rotate-45"/></Button></div>
                                 </div>
                             ))}
                             {documents.length === 0 && <p className="text-sm text-slate-400 text-center pt-10">No documents required.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={typeCrud.isModalOpen} onClose={typeCrud.handleCloseModal} title={typeCrud.currentItem.id ? "Edit Type" : "Add Type"} footer={<Footer crud={typeCrud} />}>
          <div className="space-y-4">
              <Select label="Business Vertical" options={verticals?.filter(v => v.status === 1).map(v => ({label: v.business_vertical_name, value: v.id!})) || []} value={typeCrud.currentItem.business_vertical_id || ''} onChange={(e) => typeCrud.setCurrentItem({...typeCrud.currentItem, business_vertical_id: e.target.value})} />
              <Input label="Name" value={typeCrud.currentItem.insurance_type || ''} onChange={e => typeCrud.setCurrentItem({...typeCrud.currentItem, insurance_type: e.target.value})} />
          </div>
      </Modal>

      <Modal isOpen={subTypeCrud.isModalOpen} onClose={subTypeCrud.handleCloseModal} title="Add Sub-Type" footer={<Footer crud={subTypeCrud} />}>
           <Input label="Name" value={subTypeCrud.currentItem.insurance_sub_type || ''} onChange={e => subTypeCrud.setCurrentItem({...subTypeCrud.currentItem, insurance_sub_type: e.target.value})} autoFocus />
      </Modal>

      <Modal isOpen={processCrud.isModalOpen} onClose={processCrud.handleCloseModal} title={processCrud.currentItem.id ? "Edit Stage" : "Add Stage"} footer={<Footer crud={processCrud} />}>
          <Input label="Stage Name" value={processCrud.currentItem.process_desc || ''} onChange={e => processCrud.setCurrentItem({...processCrud.currentItem, process_desc: e.target.value})} autoFocus />
      </Modal>

      <Modal isOpen={fieldCrud.isModalOpen} onClose={fieldCrud.handleCloseModal} title={fieldCrud.currentItem.id ? "Edit Field" : "Add Field"} footer={<Footer crud={fieldCrud} />}>
          <div className="space-y-5">
              <Input label="Field Label" value={fieldCrud.currentItem.field_label || ''} onChange={e => fieldCrud.setCurrentItem({...fieldCrud.currentItem, field_label: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative" ref={groupWrapperRef}>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Group Name</label>
                      <div className="relative">
                          <input type="text" value={groupSearch} onChange={(e) => { setGroupSearch(e.target.value); setIsGroupDropdownOpen(true); }} onFocus={() => setIsGroupDropdownOpen(true)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800" placeholder="Select or type..." />
                          <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
                      </div>
                      {isGroupDropdownOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {filteredGroups.map((group) => (<div key={group} onClick={() => { setGroupSearch(group || ''); fieldCrud.setCurrentItem({...fieldCrud.currentItem, group_name: group || ''}); setIsGroupDropdownOpen(false); }} className="px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-600 cursor-pointer">{group}</div>))}
                              {groupSearch && !filteredGroups.includes(groupSearch) && (<div onClick={() => { fieldCrud.setCurrentItem({...fieldCrud.currentItem, group_name: groupSearch}); setIsGroupDropdownOpen(false); }} className="px-3 py-2 text-sm text-green-600 cursor-pointer flex items-center gap-2 border-t"><Plus size={14} /> Create "{groupSearch}"</div>)}
                          </div>
                      )}
                  </div>
                  <Select label="Column Span" options={[{label:'1 Column', value:1}, {label:'2 Columns', value:2}, {label:'3 Columns', value:3}]} value={fieldCrud.currentItem.column_span || 1} onChange={e => fieldCrud.setCurrentItem({...fieldCrud.currentItem, column_span: Number(e.target.value)})} />
              </div>
              <Select label="Field Type" options={['Text Input', 'Number Input', 'Date Input', 'Toggle (Yes/No)', 'Dropdown (Select)', 'Checkbox Group', 'Table'].map(t => ({label: t, value: t}))} value={fieldCrud.currentItem.field_type || 'Text Input'} onChange={e => fieldCrud.setCurrentItem({...fieldCrud.currentItem, field_type: e.target.value})} />
          </div>
      </Modal>
    </MasterDataLayout>
  );
};

const Section = ({ title, children, crud, onAdd, disableAdd }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col min-h-[300px]">
        <div className="px-6 py-4 border-b flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-white">{title}</h3><Button size="sm" onClick={onAdd || (() => crud.handleOpenModal())} disabled={disableAdd} icon={<Plus size={14} />}>Add</Button></div>
        {children}
    </div>
);
const Footer = ({ crud }: any) => (<><Button variant="secondary" onClick={crud.handleCloseModal}>Cancel</Button><Button variant="success" onClick={crud.handleSave} isLoading={crud.saving}>Save</Button></>);

export default PolicyConfigurationPage;