import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { LeadStage } from '../../types';

const LeadStageMaster: React.FC = () => {
  return (
    <MasterDataLayout title="Lead Pipeline Stages">
      <GenericTableCrud<LeadStage>
        title="Lead Stage"
        endpoint="/leadStages"
        columns={[{ header: 'Stage Name', accessor: 'lead_name', className: 'font-bold' }]}
        fields={[
          { name: 'lead_name', label: 'Stage Name', type: 'text', required: true }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['lead_name']}
      />
    </MasterDataLayout>
  );
};

export default LeadStageMaster;
