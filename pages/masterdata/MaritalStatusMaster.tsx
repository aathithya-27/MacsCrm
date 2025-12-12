import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { MaritalStatus } from '../../types';

const MaritalStatusMasterPage: React.FC = () => {
  return (
    <MasterDataLayout title="Manage Marital Statuses">
      <GenericTableCrud<MaritalStatus>
        title="Marital Status"
        endpoint="/maritalStatuses"
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
