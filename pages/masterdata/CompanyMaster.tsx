import React, { useEffect, useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { companyMasterApi } from '../../services/masterDataApi/companyMaster.api';
import { branchApi } from '../../services/masterDataApi/branch.api';
import { businessVerticalApi } from '../../services/masterDataApi/businessVertical.api';
import { CompanyMaster, Country, State, District, City, Area } from '../../types';
import { Save } from 'lucide-react';
import { Button, Input, Select, Toggle } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { DEFAULTS } from '../../constants';
import toast from 'react-hot-toast';

const CompanyMasterPage: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyMaster>({
    comp_id: DEFAULTS.COMP_ID, 
    client_id: DEFAULTS.CLIENT_ID, 
    comp_code: '', comp_name: '', registered_name: '', date_of_creation: '',
    address_1: '', address_2: '', address_3: '', country: '', state: '', district: '', city: '', area: '',
    pin_code: '', phone_no: '', email: '', fax_no: '', gst_no: '', pan_no: '', tan_no: '', 
    status: DEFAULTS.STATUS_ACTIVE
  });

  const { data: companyData, loading } = useFetch<CompanyMaster>('/companyMaster/1');
  const { data: countries } = useFetch<Country[]>('/countries');
  const { data: states } = useFetch<State[]>('/states');
  const { data: districts } = useFetch<District[]>('/districts');
  const { data: cities } = useFetch<City[]>('/cities');
  const { data: areas } = useFetch<Area[]>('/areas');

  const [locIds, setLocIds] = useState<{country?: number | string, state?: number | string, district?: number | string, city?: number | string}>({});

  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
      
      if (companyData.country && countries) {
        const c = countries.find(x => x.country_name === companyData.country);
        if (c) {
            let newIds: any = { country: c.id };
            if (companyData.state && states) {
                const s = states.find(x => x.state === companyData.state && x.country_id == c.id);
                if (s) {
                    newIds.state = s.id;
                    if (companyData.district && districts) {
                        const d = districts.find(x => x.district_name === companyData.district && x.state_id == s.id);
                        if (d) {
                            newIds.district = d.id;
                            if (companyData.city && cities) {
                                const ct = cities.find(x => x.city === companyData.city && x.district_id == d.id);
                                if (ct) newIds.city = ct.id;
                            }
                        }
                    }
                }
            }
            setLocIds(newIds);
        }
      }
    }
  }, [companyData, countries, states, districts, cities]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocChange = (level: 'country' | 'state' | 'district' | 'city' | 'area', id: string) => {
      if (level === 'country') {
          const obj = countries?.find(x => x.id == id);
          setLocIds({ country: id });
          setFormData(prev => ({ ...prev, country: obj?.country_name || '', state: '', district: '', city: '', area: '' }));
      } else if (level === 'state') {
          const obj = states?.find(x => x.id == id);
          setLocIds(prev => ({ ...prev, state: id, district: undefined, city: undefined }));
          setFormData(prev => ({ ...prev, state: obj?.state || '', district: '', city: '', area: '' }));
      } else if (level === 'district') {
          const obj = districts?.find(x => x.id == id);
          setLocIds(prev => ({ ...prev, district: id, city: undefined }));
          setFormData(prev => ({ ...prev, district: obj?.district_name || '', city: '', area: '' }));
      } else if (level === 'city') {
          const obj = cities?.find(x => x.id == id);
          setLocIds(prev => ({ ...prev, city: id }));
          setFormData(prev => ({ ...prev, city: obj?.city || '', area: '' }));
      } else if (level === 'area') {
          const obj = areas?.find(x => x.id == id);
          setFormData(prev => ({ ...prev, area: obj?.area || '' }));
      }
  };

  const handleToggleStatus = (val: boolean) => {
    setFormData(prev => ({ ...prev, status: val ? 1 : 0 }));
    if (!val) toast("Warning: Deactivating Company will cascade to Branches and Verticals.", { icon: '⚠️' });
  };

  const processCascadeDeactivation = async () => {
    if (formData.status !== 0 || !formData.comp_id) return;
    
    try {
        const [bRes, vRes] = await Promise.all([branchApi.getAll(), businessVerticalApi.getAll()]);
        
        const tasks = [];
        if (bRes.data) {
            const connectedBranches = bRes.data.filter(b => b.comp_id === formData.comp_id && b.status === 1);
            tasks.push(...connectedBranches.map(b => branchApi.patch(b.id!, { status: 0 })));
        }
        if (vRes.data) {
            const connectedVerticals = vRes.data.filter(v => v.comp_id === formData.comp_id && v.status === 1);
            tasks.push(...connectedVerticals.map(v => businessVerticalApi.patch(v.id!, { status: 0 })));
        }
        await Promise.all(tasks);
    } catch (e) {
        console.error("Cascade deactivation failed", e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formData.id) {
        await companyMasterApi.update(formData.id, formData);
        await processCascadeDeactivation();
      } else {
        await companyMasterApi.create(formData);
      }
      toast.success('Company info saved successfully!');
    } catch (e) { 
      toast.error('Failed to save company info.'); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return <MasterDataLayout title="Company Master"><div className="flex justify-center h-64 items-center">Loading Company Data...</div></MasterDataLayout>;

  return (
    <MasterDataLayout title="Company Master">
      <div className="space-y-6 pb-10">
        
        {}
        <div className="flex justify-end">
            <Button variant="success" onClick={handleSave} isLoading={saving} icon={<Save size={16} />}>Save Changes</Button>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Company Info</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Code" name="comp_code" value={formData.comp_code} onChange={handleChange} disabled placeholder="Auto-generated" />
              <Input label="Company Name" name="comp_name" value={formData.comp_name} onChange={handleChange} />
              
              <Input label="Registered Name" name="registered_name" value={formData.registered_name} onChange={handleChange} />
              <Input type="date" label="Date of Creation" name="date_of_creation" value={formData.date_of_creation} onChange={handleChange} />
              
              <div className="flex items-center mt-2 col-span-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-3">Status</span>
                  <Toggle checked={formData.status === 1} onChange={handleToggleStatus} label={formData.status === 1 ? 'Active' : 'Inactive'} />
              </div>
           </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Address & Contact</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Line 1" name="address_1" value={formData.address_1} onChange={handleChange} />
              <Input label="Line 2" name="address_2" value={formData.address_2} onChange={handleChange} />
              
              <Input label="Line 3" name="address_3" value={formData.address_3 || ''} onChange={handleChange} />
              <Select label="Country" options={countries?.filter(c => c.status === 1).map(c => ({label: c.country_name, value: c.id!})) || []} value={locIds.country || ''} onChange={(e) => handleLocChange('country', e.target.value)} />
              
              <Select label="State" options={states?.filter(s => s.country_id == locIds.country && s.status === 1).map(s => ({label: s.state, value: s.id!})) || []} value={locIds.state || ''} onChange={(e) => handleLocChange('state', e.target.value)} disabled={!locIds.country} />
              <Select label="District" options={districts?.filter(d => d.state_id == locIds.state && d.status === 1).map(d => ({label: d.district_name, value: d.id!})) || []} value={locIds.district || ''} onChange={(e) => handleLocChange('district', e.target.value)} disabled={!locIds.state} />
              
              <Select label="City" options={cities?.filter(c => c.district_id == locIds.district && c.status === 1).map(c => ({label: c.city, value: c.id!})) || []} value={locIds.city || ''} onChange={(e) => handleLocChange('city', e.target.value)} disabled={!locIds.district} />
              <Select label="Area" options={areas?.filter(a => a.city_id == locIds.city && a.status === 1).map(a => ({label: a.area, value: a.id!})) || []} value={areas?.find(a => a.area === formData.area && a.city_id == locIds.city)?.id || ''} onChange={(e) => handleLocChange('area', e.target.value)} disabled={!locIds.city} />
              
              <Input label="Pin Code" name="pin_code" value={formData.pin_code} onChange={handleChange} />
              <Input label="Phone No." name="phone_no" value={formData.phone_no} onChange={handleChange} />
              
              <Input label="Email ID" name="email" value={formData.email} onChange={handleChange} />
              <Input label="FAX No." name="fax_no" value={formData.fax_no || ''} onChange={handleChange} />
           </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
           <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Tax Info</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="GSTIN" name="gst_no" value={formData.gst_no} onChange={handleChange} />
              <Input label="PAN" name="pan_no" value={formData.pan_no} onChange={handleChange} />
              <Input label="TAN" name="tan_no" value={formData.tan_no} onChange={handleChange} />
           </div>
        </div>

      </div>
    </MasterDataLayout>
  );
};

export default CompanyMasterPage;