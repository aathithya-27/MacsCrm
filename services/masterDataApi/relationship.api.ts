
import { apiClient } from '../apiClient';
import { Relationship } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.RELATIONSHIP;

export const relationshipApi = {
  getAll: () => apiClient.get<Relationship[]>(ENDPOINT),
  create: (data: Relationship) => apiClient.post<Relationship>(ENDPOINT, data),
  update: (id: number | string, data: Relationship) => apiClient.put<Relationship>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Relationship>) => apiClient.patch<Relationship>(`${ENDPOINT}/${id}`, data),
};
