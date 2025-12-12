import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { DocumentMaster } from '../../types';

const DocumentMasterPage: React.FC = () => {
  return (
    <MasterDataLayout title="Document Master">
      <GenericTableCrud<DocumentMaster>
        title="Document"
        endpoint="/documentMasters"
        columns={[{ header: 'Document Name', accessor: 'doc_name', className: 'font-bold' }]}
        fields={[
          { name: 'doc_name', label: 'Document Name', type: 'text', required: true, placeholder: 'e.g. PAN Card' }
        ]}
        searchKeys={['doc_name']}
      />
    </MasterDataLayout>
  );
};

export default DocumentMasterPage;
