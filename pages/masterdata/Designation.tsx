import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Designation } from '../../types';

const DesignationPage: React.FC = () => {
  return (
    <MasterDataLayout title="Designation Master">
      <GenericTableCrud<Designation>
        title="Designation"
        endpoint="/designations"
        columns={[
          { header: 'Designation Name', accessor: 'designation_name', className: 'font-bold' },
          { header: 'Rank', accessor: 'designation_rank', align: 'center' }
        ]}
        fields={[
          { name: 'designation_name', label: 'Designation Name', type: 'text', required: true },
          { name: 'designation_rank', label: 'Rank (Priority)', type: 'number', placeholder: 'Lower number = Higher priority' }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['designation_name']}
        transformRawData={(data) => data.sort((a,b) => (Number(a.designation_rank)||999) - (Number(b.designation_rank)||999))}
      />
    </MasterDataLayout>
  );
};

export default DesignationPage;
