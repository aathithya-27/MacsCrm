import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { TaskStatus } from '../../services/masterDataApi/taskStatus.api';
import { API_ENDPOINTS } from '../../config/api.config';

const TaskStatusPage: React.FC = () => {
  return (
    <MasterDataLayout title="Task Status Management">
      <GenericTableCrud<TaskStatus>
        title="Task Status"
        endpoint={API_ENDPOINTS.MASTER_DATA.TASK_STATUS}
        columns={[
          { header: 'Status Name', accessor: 'status_name', className: 'font-medium' },
          { 
              header: 'Color', 
              accessor: (item) => (
                  <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md border border-gray-200 shadow-sm" style={{ backgroundColor: item.color_code || '#ccc' }}></span>
                      <span className="text-xs text-slate-500 font-mono uppercase">{item.color_code}</span>
                  </div>
              ) 
          },
          { 
              header: 'Default', 
              accessor: (item) => item.is_default ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Default</span> : '-' 
          }
        ]}
        fields={[
          { name: 'status_name', label: 'Status Name', type: 'text', required: true, placeholder: 'e.g. Pending' },
          { name: 'color_code', label: 'Color Code (Hex)', type: 'text', placeholder: '#000000' },
          { name: 'is_default', label: 'Set as Default Status', type: 'toggle' }
        ]}
        defaults={{ comp_id: 1001, color_code: '#3b82f6', is_default: false }}
        searchKeys={['status_name']}
      />
    </MasterDataLayout>
  );
};

export default TaskStatusPage;
