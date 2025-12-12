import { apiClient } from '../apiClient';
import { BusinessVertical } from '../../types';

const ENDPOINT = '/businessVerticals';

export const businessVerticalApi = {
  getAll: () => apiClient.get<BusinessVertical[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<BusinessVertical>(`${ENDPOINT}/${id}`),
  create: (data: BusinessVertical) => apiClient.post<BusinessVertical>(ENDPOINT, data),
  update: (id: number | string, data: BusinessVertical) => apiClient.put<BusinessVertical>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<BusinessVertical>) => apiClient.patch<BusinessVertical>(`${ENDPOINT}/${id}`, data),
  delete: (id: number | string) => apiClient.delete<any>(`${ENDPOINT}/${id}`),
  
  // Helper to find by company (simulated query)
  getByCompanyId: async (compId: number) => {
    const all = await apiClient.get<BusinessVertical[]>(ENDPOINT);
    if (all.status && Array.isArray(all.data)) {
        return {
            ...all,
            data: all.data.filter(bv => bv.comp_id === compId)
        };
    }
    return all;
  }
};