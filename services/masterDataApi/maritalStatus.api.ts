import { apiClient } from '../apiClient';
import { MaritalStatus } from '../../types';

const ENDPOINT = '/maritalStatuses';

export const maritalStatusApi = {
  getAll: () => apiClient.get<MaritalStatus[]>(ENDPOINT),
  create: (data: MaritalStatus) => apiClient.post<MaritalStatus>(ENDPOINT, data),
  update: (id: number, data: MaritalStatus) => apiClient.put<MaritalStatus>(`${ENDPOINT}/${id}`, data),
  patch: (id: number, data: Partial<MaritalStatus>) => apiClient.patch<MaritalStatus>(`${ENDPOINT}/${id}`, data),
};