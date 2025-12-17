
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { CustomerCategory, CustomerSubCategory, CustomerGroup, CustomerType } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { customerSegmentApi } from '../../services/masterDataApi/customerSegment.api';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api.config';

const CustomerSegmentPage: React.FC = () => {
  const { CUSTOMER_CATEGORY, CUSTOMER_SUB_CATEGORY, CUSTOMER_GROUP, CUSTOMER_TYPE } = API_ENDPOINTS.MASTER_DATA;

  const { data: categories, refetch: refetchCategories } = useFetch<CustomerCategory[]>(CUSTOMER_CATEGORY);
  const { data: subCategories, refetch: refetchSubCategories } = useFetch<CustomerSubCategory[]>(CUSTOMER_SUB_CATEGORY);

  const handleToggleCategory = async (item: CustomerCategory) => {
    const newStatus = item.status === 1 ? 0 : 1;
    try {
        await customerSegmentApi.patchCategory(item.id!, { status: newStatus });
        
        if (subCategories) {
            const children = subCategories.filter(s => s.cust_cate_id == item.id && s.status !== newStatus);
            await Promise.all(children.map(child => 
                customerSegmentApi.patchSubCategory(child.id!, { status: newStatus })
            ));
            if (children.length > 0) {
                toast.success(`Updated Category and ${children.length} sub-categories`);
                refetchSubCategories();
            } else {
                toast.success(newStatus === 1 ? 'Activated' : 'Deactivated');
            }
        }
        refetchCategories();
    } catch (e) {
        toast.error("Failed to update status");
    }
  };

  return (
    <MasterDataLayout title="Customer Segment Management">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-8">
        {}
        <GenericTableCrud<CustomerCategory>
          title="Customer Category"
          endpoint={CUSTOMER_CATEGORY}
          columns={[{ header: 'Name', accessor: 'customer_category' }]}
          fields={[{ name: 'customer_category', label: 'Category Name', type: 'text', required: true }]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['customer_category']}
          onStatusChange={handleToggleCategory}
        />

        <GenericTableCrud<CustomerSubCategory>
          title="Sub-Category"
          endpoint={CUSTOMER_SUB_CATEGORY}
          columns={[
              { header: 'Name', accessor: 'cust_sub_cate' },
              { header: 'Parent', accessor: (i) => categories?.find(c => c.id == i.cust_cate_id)?.customer_category || '-' }
          ]}
          fields={[
              { name: 'cust_sub_cate', label: 'Sub-Category Name', type: 'text', required: true },
              { 
                  name: 'cust_cate_id', 
                  label: 'Parent Category', 
                  type: 'select', 
                  required: true,
                  options: categories?.filter(c => c.status === 1).map(c => ({ label: c.customer_category, value: c.id! })) || []
              }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['cust_sub_cate']}
        />

        {}
        <GenericTableCrud<CustomerGroup>
          title="Customer Group"
          endpoint={CUSTOMER_GROUP}
          columns={[{ header: 'Name', accessor: 'customer_group' }]}
          fields={[{ name: 'customer_group', label: 'Group Name', type: 'text', required: true }]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['customer_group']}
        />

        <GenericTableCrud<CustomerType>
          title="Customer Type"
          endpoint={CUSTOMER_TYPE}
          columns={[{ header: 'Name', accessor: 'cust_type' }]}
          fields={[{ name: 'cust_type', label: 'Type Name', type: 'text', required: true }]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['cust_type']}
        />
      </div>
    </MasterDataLayout>
  );
};

export default CustomerSegmentPage;
