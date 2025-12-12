import { apiClient } from '../apiClient';
import { Role } from '../../types';

const ENDPOINT = '/roles';

export const roleApi = {
  getAll: () => apiClient.get<Role[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<Role>(`${ENDPOINT}/${id}`),
  create: (data: Role) => apiClient.post<Role>(ENDPOINT, data),
  update: (id: number | string, data: Role) => apiClient.put<Role>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Role>) => apiClient.patch<Role>(`${ENDPOINT}/${id}`, data),
};