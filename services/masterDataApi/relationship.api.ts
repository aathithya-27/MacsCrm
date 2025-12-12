import { apiClient } from '../apiClient';
import { Relationship } from '../../types';

const ENDPOINT = '/relationships';

export const relationshipApi = {
  getAll: () => apiClient.get<Relationship[]>(ENDPOINT),
  create: (data: Relationship) => apiClient.post<Relationship>(ENDPOINT, data),
  update: (id: number | string, data: Relationship) => apiClient.put<Relationship>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Relationship>) => apiClient.patch<Relationship>(`${ENDPOINT}/${id}`, data),
};