import { apiClient } from '../apiClient';
import { Branch } from '../../types';

const ENDPOINT = '/branches';

export const branchApi = {
  getAll: () => apiClient.get<Branch[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<Branch>(`${ENDPOINT}/${id}`),
  create: (data: Branch) => apiClient.post<Branch>(ENDPOINT, data),
  update: (id: number | string, data: Branch) => apiClient.put<Branch>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Branch>) => apiClient.patch<Branch>(`${ENDPOINT}/${id}`, data),
  delete: (id: number | string) => apiClient.delete<any>(`${ENDPOINT}/${id}`),
};