import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Relationship } from '../../types';

const RelationshipMaster: React.FC = () => {
  return (
    <MasterDataLayout title="Relationship Types">
      <GenericTableCrud<Relationship>
        title="Relationship"
        endpoint="/relationships"
        columns={[{ header: 'Relationship Name', accessor: 'relationship_name', className: 'font-bold' }]}
        fields={[
          { name: 'relationship_name', label: 'Relationship Name', type: 'text', required: true }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['relationship_name']}
      />
    </MasterDataLayout>
  );
};

export default RelationshipMaster;
