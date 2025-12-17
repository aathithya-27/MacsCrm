
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { DocumentMaster } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const DocumentMasterPage: React.FC = () => {
  const { DOCUMENT_MASTER } = API_ENDPOINTS.MASTER_DATA;
  return (
    <MasterDataLayout title="Document Master">
      <GenericTableCrud<DocumentMaster>
        title="Document"
        endpoint={DOCUMENT_MASTER}
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
