
import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Route } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const RouteMasterPage: React.FC = () => {
  const { ROUTE } = API_ENDPOINTS.MASTER_DATA;
  return (
    <MasterDataLayout title="Manage Route">
      <GenericTableCrud<Route>
        title="Route"
        endpoint={ROUTE}
        columns={[{ header: 'Route Name', accessor: 'route_name', className: 'font-medium' }]}
        fields={[
          { name: 'route_name', label: 'Route Name', type: 'text', required: true }
        ]}
        defaults={{ comp_id: 1001 }}
        searchKeys={['route_name']}
      />
    </MasterDataLayout>
  );
};

export default RouteMasterPage;
