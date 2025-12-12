import { apiClient } from '../apiClient';
import { RolePermission } from '../../types';

const ENDPOINT = '/rolePermissions';

export const rolePermissionApi = {
  // Fetch permissions for a specific role
  getByRoleId: async (roleId: number | string) => {
    // Using json-server filtering: ?role_id=1
    const response = await apiClient.get<RolePermission[]>(`${ENDPOINT}?role_id=${roleId}`);
    return response;
  },
  
  create: (data: RolePermission) => apiClient.post<RolePermission>(ENDPOINT, data),
  
  update: (id: number | string, data: RolePermission) => apiClient.put<RolePermission>(`${ENDPOINT}/${id}`, data),
  
  // Optional: Delete if setting "None" removes record
  delete: (id: number | string) => apiClient.delete<any>(`${ENDPOINT}/${id}`),
};