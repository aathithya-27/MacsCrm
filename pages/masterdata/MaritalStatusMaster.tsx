
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { MaritalStatus } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const MaritalStatusMasterPage: React.FC = () => {
  const { MARITAL_STATUS } = API_ENDPOINTS.MASTER_DATA;
  return (
    <MasterDataLayout title="Manage Marital Statuses">
      <GenericTableCrud<MaritalStatus>
        title="Marital Status"
        endpoint={MARITAL_STATUS}
        columns={[{ header: 'Status Name', accessor: 'marital_status', className: 'font-medium' }]}
        fields={[
          { name: 'marital_status', label: 'Status Name', type: 'text', required: true }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['marital_status']}
      />
    </MasterDataLayout>
  );
};

export default MaritalStatusMasterPage;
