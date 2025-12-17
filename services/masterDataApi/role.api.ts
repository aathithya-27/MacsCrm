
import { apiClient } from '../apiClient';
import { Role } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.ROLE;

export const roleApi = {
  getAll: () => apiClient.get<Role[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<Role>(`${ENDPOINT}/${id}`),
  create: (data: Role) => apiClient.post<Role>(ENDPOINT, data),
  update: (id: number | string, data: Role) => apiClient.put<Role>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Role>) => apiClient.patch<Role>(`${ENDPOINT}/${id}`, data),
};
