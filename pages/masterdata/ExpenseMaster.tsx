import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { ExpenseCategory, ExpenseHead } from '../../types';
import { useFetch } from '../../hooks/useFetch';

const ExpenseMasterPage: React.FC = () => {
  const { data: categories } = useFetch<ExpenseCategory[]>('/expenseCategories');

  return (
    <MasterDataLayout title="Expense Management">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-8">
        <GenericTableCrud<ExpenseCategory>
          title="Expense Category"
          endpoint="/expenseCategories"
          columns={[{ header: 'Category Name', accessor: 'expense_cate_name', className: 'font-medium' }]}
          fields={[
            { name: 'expense_cate_name', label: 'Category Name', type: 'text', required: true }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['expense_cate_name']}
        />

        <GenericTableCrud<ExpenseHead>
          title="Expense Head"
          endpoint="/expenseHeads"
          columns={[
            { header: 'Head Name', accessor: 'expense_head_name', className: 'font-medium' },
            { header: 'Category', accessor: (h) => categories?.find(c => c.id == h.expense_cate_id)?.expense_cate_name || '-' }
          ]}
          fields={[
            { 
              name: 'expense_cate_id', 
              label: 'Category', 
              type: 'select', 
              required: true, 
              options: categories?.filter(c => c.status === 1).map(c => ({ label: c.expense_cate_name, value: c.id! })) || []
            },
            { name: 'expense_head_name', label: 'Head Name', type: 'text', required: true }
          ]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['expense_head_name']}
        />
      </div>
    </MasterDataLayout>
  );
};

export default ExpenseMasterPage;
