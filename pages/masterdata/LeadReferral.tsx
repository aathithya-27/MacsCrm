import React, { useEffect, useState, useMemo } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { leadSourceApi } from '../../services/masterDataApi/leadSource.api';
import { LeadSource } from '../../types';
import { Plus, Edit2, ChevronRight, ChevronDown, CornerDownRight } from 'lucide-react';
import { Button, Input, Modal, Toggle } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { useMasterCrud } from '../../hooks/useMasterCrud';
import { transformToTree, TreeItem as TreeItemType } from '../../utils/dataUtils';
import toast from 'react-hot-toast';

const LeadReferralPage: React.FC = () => {
  const { data: sourceData, loading, refetch, setData } = useFetch<LeadSource[]>('/leadSources');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number | string>>(new Set());

  // Using our new engine hook
  const crud = useMasterCrud<LeadSource>({
    api: leadSourceApi,
    refetch,
    updateLocalData: setData,
    validate: (item) => !item.ref_desc ? "Description required" : null,
    initialState: { client_id: 1, individual: false }
  });

  // Calculate tree data only when sourceData changes (Performance optimization)
  const treeData = useMemo(() => {
    if (!sourceData) return [];
    return transformToTree(sourceData);
  }, [sourceData]);

  // Auto-expand all nodes on initial load
  useEffect(() => {
    if (sourceData) {
      setExpandedNodes(new Set(sourceData.map(d => d.id!)));
    }
  }, [sourceData]);

  const toggleExpand = (id: number | string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const handleAddChild = (parentId: number | string) => {
    crud.handleOpenModal({ parent_id: parentId } as unknown as LeadSource);
  };

  // Custom Cascade Toggle (Handles both Activation and Deactivation for entire hierarchy)
  const handleToggleStatus = async (item: LeadSource) => {
    const newStatus = item.status === 1 ? 0 : 1;
    
    // Recursive function to find all descendant IDs
    const getDescendantsIds = (pid: number | string, allItems: LeadSource[]): (number | string)[] => {
      const children = allItems.filter(d => d.parent_id == pid);
      let ids = children.map(c => c.id!);
      children.forEach(c => {
        ids = [...ids, ...getDescendantsIds(c.id!, allItems)];
      });
      return ids;
    };

    const descendantsIds = sourceData ? getDescendantsIds(item.id!, sourceData) : [];
    const idsToUpdate = [item.id!, ...descendantsIds];

    // Optimistic Update
    setData(prev => prev?.map(d => idsToUpdate.includes(d.id!) ? { ...d, status: newStatus } : d) || []);

    // API Update
    try {
        // Parallel update for better performance
        await Promise.all(idsToUpdate.map(id => leadSourceApi.patch(id, { status: newStatus })));
        
        const message = newStatus === 1 
            ? `Activated Source and ${descendantsIds.length} descendants` 
            : `Deactivated Source and ${descendantsIds.length} descendants`;
        toast.success(message);
    } catch (e) {
        refetch();
        toast.error("Failed to update status");
    }
  };

  // Recursive Tree Item Component
  const TreeItem: React.FC<{ node: LeadSource; level: number }> = ({ node, level }) => {
     if (searchQuery && !node.ref_desc.toLowerCase().includes(searchQuery.toLowerCase())) return null;
     
     const hasChildren = node.children && node.children.length > 0;
     
     return (
        <>
            <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${level > 0 ? 'bg-slate-50/30 dark:bg-slate-800/50' : ''}`} style={{ paddingLeft: `${level * 24 + 16}px` }}>
                <div className="flex items-center gap-3">
                    {hasChildren ? (
                      <button onClick={() => toggleExpand(node.id!)} className="text-slate-400 hover:text-blue-500">
                        {expandedNodes.has(node.id!) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    ) : (
                      <span className="w-4 h-4 block"></span>
                    )}
                    {level > 0 && <CornerDownRight size={14} className="text-slate-300" />}
                    <span className={`text-sm font-medium ${node.status === 1 ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>{node.ref_desc}</span>
                    {node.individual && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Referrer Selection</span>}
                </div>
                <div className="flex items-center gap-4">
                     <Toggle checked={node.status === 1} onChange={() => handleToggleStatus(node)} size="sm" />
                     <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => handleAddChild(node.id!)}><Plus size={14} /></Button>
                         <Button variant="ghost" size="icon" onClick={() => crud.handleOpenModal(node)}><Edit2 size={14} /></Button>
                     </div>
                </div>
            </div>
            {hasChildren && expandedNodes.has(node.id!) && 
              <div>
                {node.children!.map((child: any) => <TreeItem key={child.id} node={child} level={level + 1} />)}
              </div>
            }
        </>
     );
  };

  return (
    <MasterDataLayout title="Lead/Referral Management">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-[calc(100vh-12rem)]">
         <div className="p-4 border-b flex justify-between items-center gap-4">
            <Input className="w-96" placeholder="Search tree..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Button onClick={() => crud.handleOpenModal({ parent_id: 0 } as unknown as LeadSource)} icon={<Plus size={16} />}>Add Root Source</Button>
         </div>
         <div className="flex-1 overflow-auto bg-white dark:bg-slate-800">
             {loading ? <div className="p-8 text-center">Loading...</div> : treeData.map((node: any) => <TreeItem key={node.id} node={node} level={0} />)}
         </div>
      </div>
      
      <Modal 
        isOpen={crud.isModalOpen} onClose={crud.handleCloseModal} 
        title={crud.currentItem.id ? 'Edit Source' : 'Add Source'} 
        footer={
          <>
            <Button variant="secondary" onClick={crud.handleCloseModal}>Cancel</Button>
            <Button variant="success" onClick={crud.handleSave} isLoading={crud.saving}>Save</Button>
          </>
        }
      >
          <div className="space-y-4">
              <Input label="Name" value={crud.currentItem.ref_desc || ''} onChange={e => crud.setCurrentItem({...crud.currentItem, ref_desc: e.target.value})} autoFocus />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Referrer Selection?</span>
                <Toggle checked={!!crud.currentItem.individual} onChange={(v) => crud.setCurrentItem({...crud.currentItem, individual: v})} />
              </div>
          </div>
      </Modal>
    </MasterDataLayout>
  );
};

export default LeadReferralPage;