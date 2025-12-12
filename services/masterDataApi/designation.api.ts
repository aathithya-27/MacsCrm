import { apiClient } from '../apiClient';
import { Designation } from '../../types';

const ENDPOINT = '/designations';

export const designationApi = {
  getAll: () => apiClient.get<Designation[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<Designation>(`${ENDPOINT}/${id}`),
  create: (data: Designation) => apiClient.post<Designation>(ENDPOINT, data),
  update: (id: number | string, data: Designation) => apiClient.put<Designation>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Designation>) => apiClient.patch<Designation>(`${ENDPOINT}/${id}`, data),
};