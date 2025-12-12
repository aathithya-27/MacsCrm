import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { BankMaster, AccountType } from '../../types';

const BankMasterPage: React.FC = () => {
  return (
    <MasterDataLayout title="Bank Management">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-8">
        <GenericTableCrud<BankMaster>
          title="Bank"
          endpoint="/banks"
          columns={[{ header: 'Bank Name', accessor: 'bank_name', className: 'font-medium' }]}
          fields={[
            { name: 'bank_name', label: 'Bank Name', type: 'text', required: true, placeholder: 'e.g. State Bank of India' }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['bank_name']}
        />
        
        <GenericTableCrud<AccountType>
          title="Account Type"
          endpoint="/accountTypes"
          columns={[{ header: 'Account Type', accessor: 'account_type_name', className: 'font-medium' }]}
          fields={[
            { name: 'account_type_name', label: 'Account Type', type: 'text', required: true, placeholder: 'e.g. Savings' }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['account_type_name']}
        />
      </div>
    </MasterDataLayout>
  );
};

export default BankMasterPage;
