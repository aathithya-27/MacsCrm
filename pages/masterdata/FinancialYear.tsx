
import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { FinancialYear, NumberingRule } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { financialYearApi } from '../../services/masterDataApi/financialYear.api';
import toast from 'react-hot-toast';

const FinancialYearPage: React.FC = () => {
  const [selectedFY, setSelectedFY] = useState<FinancialYear | null>(null);
  const { data: rules, refetch: refetchRules } = useFetch<NumberingRule[]>('/numberingRules');

  const handleToggleFY = async (item: FinancialYear) => {
      const newStatus = item.status === 1 ? 0 : 1;
      try {
          await financialYearApi.patchFY(item.id!, { status: newStatus });
          if (rules) {
              const children = rules.filter(r => r.fin_year_id == item.id && r.status !== newStatus);
              await Promise.all(children.map(c => financialYearApi.patchRule(c.id!, { status: newStatus })));
              if(children.length > 0) refetchRules();
          }
          toast.success(newStatus === 1 ? 'Activated' : 'Deactivated');
      } catch {
          toast.error("Failed to update status");
      }
  };

  return (
    <MasterDataLayout title="Financial Year Management">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-8">
        
        {/* Top: Financial Years (Takes full width on mobile, less on desktop) */}
        <div className="lg:col-span-5">
          <GenericTableCrud<FinancialYear>
            title="Financial Years"
            endpoint="/financialYears"
            columns={[
                { header: 'FY', accessor: 'fin_year', className: 'font-bold' },
                { header: 'From', accessor: 'from_date' },
                { header: 'To', accessor: 'to_date' }
            ]}
            fields={[
                { name: 'fin_year', label: 'FY Name (e.g. 2024-25)', type: 'text', required: true },
                { name: 'from_date', label: 'From Date', type: 'date', required: true },
                { name: 'to_date', label: 'To Date', type: 'date', required: true }
            ]}
            defaults={{ comp_id: 1001 }}
            onRowClick={(item) => setSelectedFY(item)}
            selectedId={selectedFY?.id}
            onStatusChange={handleToggleFY}
          />
        </div>

        {/* Bottom/Right: Rules for Selected FY */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           {!selectedFY ? (
               <div className="h-64 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                   Select a Financial Year to configure numbering rules
               </div>
           ) : (
               <>
                  <div className="h-[300px]" key={`voucher-${selectedFY.id}`}>
                      <GenericTableCrud<NumberingRule>
                        title={`Voucher Rules (${selectedFY.fin_year})`}
                        endpoint="/numberingRules"
                        columns={[
                            { header: 'Prefix', accessor: 'prefix' },
                            { header: 'Start No', accessor: 'start_no' }
                        ]}
                        fields={[
                            { name: 'prefix', label: 'Prefix', type: 'text', required: true },
                            { name: 'suffix', label: 'Suffix', type: 'text' },
                            { name: 'start_no', label: 'Start Number', type: 'number', required: true }
                        ]}
                        defaults={{ comp_id: 1001, fin_year_id: selectedFY.id, type: 'VOUCHER', suffix: 'N/A' }}
                        transformRawData={(data) => data.filter(r => r.fin_year_id == selectedFY.id && r.type === 'VOUCHER')}
                      />
                  </div>
                  <div className="h-[300px]" key={`receipt-${selectedFY.id}`}>
                      <GenericTableCrud<NumberingRule>
                        title={`Receipt Rules (${selectedFY.fin_year})`}
                        endpoint="/numberingRules"
                        columns={[
                            { header: 'Prefix', accessor: 'prefix' },
                            { header: 'Start No', accessor: 'start_no' }
                        ]}
                        fields={[
                            { name: 'prefix', label: 'Prefix', type: 'text', required: true },
                            { name: 'suffix', label: 'Suffix', type: 'text' },
                            { name: 'start_no', label: 'Start Number', type: 'number', required: true }
                        ]}
                        defaults={{ comp_id: 1001, fin_year_id: selectedFY.id, type: 'RECEIPT', suffix: 'N/A' }}
                        transformRawData={(data) => data.filter(r => r.fin_year_id == selectedFY.id && r.type === 'RECEIPT')}
                      />
                  </div>
               </>
           )}
        </div>
      </div>
    </MasterDataLayout>
  );
};

export default FinancialYearPage;
