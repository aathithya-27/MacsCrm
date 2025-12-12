import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { IncomeCategory, IncomeHead } from '../../types';
import { useFetch } from '../../hooks/useFetch';

const IncomeMasterPage: React.FC = () => {
  const { data: categories } = useFetch<IncomeCategory[]>('/incomeCategories');

  return (
    <MasterDataLayout title="Income Management">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-8">
        <GenericTableCrud<IncomeCategory>
          title="Income Category"
          endpoint="/incomeCategories"
          columns={[{ header: 'Category Name', accessor: 'income_cate', className: 'font-medium' }]}
          fields={[
            { name: 'income_cate', label: 'Category Name', type: 'text', required: true }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['income_cate']}
        />

        <GenericTableCrud<IncomeHead>
          title="Income Head"
          endpoint="/incomeHeads"
          columns={[
            { header: 'Head Name', accessor: 'income_head', className: 'font-medium' },
            { header: 'Category', accessor: (h) => categories?.find(c => c.id == h.income_cate_id)?.income_cate || '-' }
          ]}
          fields={[
            { 
              name: 'income_cate_id', 
              label: 'Category', 
              type: 'select', 
              required: true, 
              options: categories?.filter(c => c.status === 1).map(c => ({ label: c.income_cate, value: c.id! })) || []
            },
            { name: 'income_head', label: 'Head Name', type: 'text', required: true }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['income_head']}
        />
      </div>
    </MasterDataLayout>
  );
};

export default IncomeMasterPage;
