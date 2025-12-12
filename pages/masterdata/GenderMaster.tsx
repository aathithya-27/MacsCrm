import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Gender } from '../../types';

const GenderMasterPage: React.FC = () => {
  return (
    <MasterDataLayout title="Manage Genders">
      <GenericTableCrud<Gender>
        title="Gender"
        endpoint="/genders"
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
