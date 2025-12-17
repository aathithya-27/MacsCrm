
import { apiClient } from '../apiClient';
import { RolePermission } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.ROLE_PERMISSION;

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
