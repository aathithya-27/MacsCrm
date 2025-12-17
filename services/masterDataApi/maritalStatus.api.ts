
import { apiClient } from '../apiClient';
import { MaritalStatus } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.MARITAL_STATUS;

export const maritalStatusApi = {
  getAll: () => apiClient.get<MaritalStatus[]>(ENDPOINT),
  create: (data: MaritalStatus) => apiClient.post<MaritalStatus>(ENDPOINT, data),
  update: (id: number, data: MaritalStatus) => apiClient.put<MaritalStatus>(`${ENDPOINT}/${id}`, data),
  patch: (id: number, data: Partial<MaritalStatus>) => apiClient.patch<MaritalStatus>(`${ENDPOINT}/${id}`, data),
};
