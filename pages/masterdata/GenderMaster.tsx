
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Gender } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const GenderMasterPage: React.FC = () => {
  const { GENDER } = API_ENDPOINTS.MASTER_DATA;
  return (
    <MasterDataLayout title="Manage Genders">
      <GenericTableCrud<Gender>
        title="Gender"
        endpoint={GENDER}
        columns={[{ header: 'Name', accessor: 'gender_name' }]}
        fields={[
          { name: 'gender_name', label: 'Gender Name', type: 'text', required: true }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['gender_name']}
      />
    </MasterDataLayout>
  );
};

export default GenderMasterPage;
