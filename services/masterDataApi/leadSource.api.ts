import { apiClient } from '../apiClient';
import { LeadSource } from '../../types';

const ENDPOINT = '/leadSources';

export const leadSourceApi = {
  getAll: () => apiClient.get<LeadSource[]>(ENDPOINT),
  create: (data: LeadSource) => apiClient.post<LeadSource>(ENDPOINT, data),
  update: (id: number | string, data: LeadSource) => apiClient.put<LeadSource>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<LeadSource>) => apiClient.patch<LeadSource>(`${ENDPOINT}/${id}`, data),
};