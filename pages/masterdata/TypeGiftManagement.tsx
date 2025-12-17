
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Gift, SumAssuredTier, PremiumTier, CustomerType } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { API_ENDPOINTS } from '../../config/api.config';

const TypeGiftManagementPage: React.FC = () => {
  const { GIFT, CUSTOMER_TYPE, SUM_ASSURED_TIER, PREMIUM_TIER } = API_ENDPOINTS.MASTER_DATA;

  const { data: gifts } = useFetch<Gift[]>(GIFT);
  const { data: customerTypes } = useFetch<CustomerType[]>(CUSTOMER_TYPE);

  const giftOptions = [
      { label: '-- No Gift --', value: '' },
      ...(gifts?.filter(g => g.status === 1).map(g => ({ label: g.gift_name, value: g.gift_name })) || [])
  ];

  const typeOptions = customerTypes?.filter(t => t.status === 1).map(t => ({ label: t.cust_type, value: t.cust_type })) || [];

  return (
    <MasterDataLayout title="Type & Gift Management">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full pb-8">
        
        {/* 1. Gifts */}
        <div className="xl:col-span-1">
            <GenericTableCrud<Gift>
                title="Master Gift List"
                endpoint={GIFT}
                columns={[{ header: 'Gift Name', accessor: 'gift_name' }]}
                fields={[{ name: 'gift_name', label: 'Gift Name', type: 'text', required: true }]}
                searchKeys={['gift_name']}
            />
        </div>

        {/* 2. Sum Assured Tiers */}
        <div className="xl:col-span-1">
            <GenericTableCrud<SumAssuredTier>
                title="Type by Sum Assured"
                endpoint={SUM_ASSURED_TIER}
                columns={[
                    { header: 'Type', accessor: 'tier_name', className: 'font-bold' },
                    { header: 'Min SA (₹)', accessor: (r) => r.minimum_sum_assured?.toLocaleString() }
                ]}
                fields={[
                    { name: 'tier_name', label: 'Customer Type', type: 'select', required: true, options: typeOptions },
                    { name: 'minimum_sum_assured', label: 'Min Sum Assured', type: 'number', required: true },
                    { name: 'assigned_gift', label: 'Gift', type: 'select', options: giftOptions }
                ]}
                defaults={{ comp_id: 1001, assigned_gift: 'No Gift', minimum_sum_assured: 0 }}
            />
        </div>

        {/* 3. Premium Tiers */}
        <div className="xl:col-span-1">
            <GenericTableCrud<PremiumTier>
                title="Type by Premium"
                endpoint={PREMIUM_TIER}
                columns={[
                    { header: 'Type', accessor: 'tier_name', className: 'font-bold' },
                    { header: 'Min Prem (₹)', accessor: (r) => r.minimum_premium?.toLocaleString() }
                ]}
                fields={[
                    { name: 'tier_name', label: 'Customer Type', type: 'select', required: true, options: typeOptions },
                    { name: 'minimum_premium', label: 'Min Premium', type: 'number', required: true },
                    { name: 'assigned_gift', label: 'Gift', type: 'select', options: giftOptions }
                ]}
                defaults={{ comp_id: 1001, assigned_gift: 'No Gift', minimum_premium: 0 }}
            />
        </div>

      </div>
    </MasterDataLayout>
  );
};

export default TypeGiftManagementPage;
