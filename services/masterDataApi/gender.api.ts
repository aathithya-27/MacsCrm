import { apiClient } from '../apiClient';
import { Gender } from '../../types';

const ENDPOINT = '/genders';

export const genderApi = {
  getAll: () => apiClient.get<Gender[]>(ENDPOINT),
  create: (data: Gender) => apiClient.post<Gender>(ENDPOINT, data),
  update: (id: number | string, data: Gender) => apiClient.put<Gender>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<Gender>) => apiClient.patch<Gender>(`${ENDPOINT}/${id}`, data),
};