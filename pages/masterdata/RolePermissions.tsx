import React, { useEffect, useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { rolePermissionApi } from '../../services/masterDataApi/rolePermission.api';
import { Role } from '../../types';
import { Save, Shield, AlertCircle } from 'lucide-react';
import { Button, Select } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import toast from 'react-hot-toast';

const MODULES = ['Company Master', 'Branch', 'Business Vertical', 'Policy Configuration', 'Agency and Scheme', 'Geography', 'Designation', 'Role', 'Role Permissions', 'Document Master', 'Financial Year', 'Bank Master'];
const ACCESS_LEVELS = ['None', 'View', 'Edit', 'Full'] as const;
type AccessLevel = typeof ACCESS_LEVELS[number];

const RolePermissionsPage: React.FC = () => {
  const { data: roles, loading: loadingRoles } = useFetch<Role[]>('/roles');
  const [selectedRoleId, setSelectedRoleId] = useState<number | string | ''>('');
  const [localPermissions, setLocalPermissions] = useState<Record<string, AccessLevel>>({});
  const [permissionIds, setPermissionIds] = useState<Record<string, number | string>>({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  // Strict Mode Compliance: Logic to prevent setting state on unmounted components
  useEffect(() => {
    let isMounted = true;

    if (!selectedRoleId) {
      setLocalPermissions({});
      setPermissionIds({});
      return;
    }

    const fetchPermissions = async () => {
      setLoadingPerms(true);
      try {
        const res = await rolePermissionApi.getByRoleId(selectedRoleId);
        if (!isMounted) return;

        const newLocalPerms: Record<string, AccessLevel> = {};
        const newIds: Record<string, number | string> = {};
        
        // Initialize all modules to 'None'
        MODULES.forEach(m => { newLocalPerms[m] = 'None'; });
        
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach(p => {
             if (MODULES.includes(p.module_name)) {
                newLocalPerms[p.module_name] = p.access_level;
                if (p.id) newIds[p.module_name] = p.id;
             }
          });
        }
        setLocalPermissions(newLocalPerms);
        setPermissionIds(newIds);
      } catch (e) { 
        console.error(e); 
      } finally { 
        if (isMounted) setLoadingPerms(false); 
      }
    };

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, [selectedRoleId]);

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      // Using Promise.all for parallel execution - efficient!
      const promises = MODULES.map(async (moduleName) => {
        const currentLevel = localPermissions[moduleName];
        const existingId = permissionIds[moduleName];
        
        if (existingId) {
          await rolePermissionApi.update(existingId, { 
            id: existingId, 
            role_id: selectedRoleId, 
            module_name: moduleName, 
            access_level: currentLevel 
          });
        } else if (currentLevel !== 'None') {
          await rolePermissionApi.create({ 
            role_id: selectedRoleId, 
            module_name: moduleName, 
            access_level: currentLevel 
          });
        }
      });
      
      await Promise.all(promises);
      
      // Refresh IDs after save
      const res = await rolePermissionApi.getByRoleId(selectedRoleId);
      if (res.data) {
          const newIds: Record<string, number | string> = {};
          res.data.forEach(p => { if (p.id) newIds[p.module_name] = p.id; });
          setPermissionIds(newIds);
      }
      toast.success('Permissions saved successfully!');
    } catch (e) { 
      toast.error('Failed to save permissions.'); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <MasterDataLayout title="Role Permissions">
       <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex flex-col gap-1">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Shield className="text-blue-600" size={20} /> Manage Access Control</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure module access levels for each role.</p>
             </div>
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-64">
                    <Select placeholder="Select a Role" options={roles?.filter(r => r.status === 1).map(r => ({label: r.role_desc, value: r.id!})) || []} value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)} disabled={loadingRoles} />
                </div>
                <Button variant="success" onClick={handleSave} disabled={!selectedRoleId || saving} isLoading={saving} icon={<Save size={18} />}>Save Changes</Button>
             </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/10 p-6">
             {!selectedRoleId ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                    <AlertCircle size={48} className="mb-2 opacity-50" />
                    <p className="font-medium">Please select a Role to view permissions</p>
                 </div>
             ) : loadingPerms ? (
                 <div className="flex justify-center items-center h-64">Loading...</div>
             ) : (
                 <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-gray-200 dark:border-slate-700">
                           <tr>
                              <th className="px-6 py-4 w-1/3">Module Name</th>
                              {ACCESS_LEVELS.map(level => <th key={level} className="px-6 py-4 text-center w-1/6">{level}</th>)}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                           {MODULES.map((module) => (
                              <tr key={module} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                  <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">{module}</td>
                                  {ACCESS_LEVELS.map((level) => (
                                      <td key={level} className="px-6 py-4 text-center">
                                          <input type="radio" name={`perm-${module}`} value={level} checked={localPermissions[module] === level} onChange={() => setLocalPermissions(prev => ({...prev, [module]: level}))} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                      </td>
                                  ))}
                              </tr>
                           ))}
                        </tbody>
                    </table>
                 </div>
             )}
          </div>
       </div>
    </MasterDataLayout>
  );
};

export default RolePermissionsPage;