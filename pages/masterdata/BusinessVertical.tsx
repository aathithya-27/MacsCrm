
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { BusinessVertical } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const BusinessVerticalPage: React.FC = () => {
  const { BUSINESS_VERTICAL } = API_ENDPOINTS.MASTER_DATA;
  return (
    <MasterDataLayout title="Business Vertical Management">
      <GenericTableCrud<BusinessVertical>
        title="Business Vertical"
        endpoint={BUSINESS_VERTICAL}
        columns={[{ header: 'Vertical Name', accessor: 'business_vertical_name', className: 'font-bold' }]}
        fields={[
          { name: 'business_vertical_name', label: 'Vertical Name', type: 'text', required: true, placeholder: 'e.g. Insurance' }
        ]}
        defaults={{ comp_id: 1001, client_id: 1 }}
        searchKeys={['business_vertical_name']}
      />
    </MasterDataLayout>
  );
};

export default BusinessVerticalPage;
