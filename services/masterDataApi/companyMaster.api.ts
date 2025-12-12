import { apiClient } from '../apiClient';
import { CompanyMaster } from '../../types';

const ENDPOINT = '/companyMaster';

export const companyMasterApi = {
  getAll: () => apiClient.get<CompanyMaster[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<CompanyMaster>(`${ENDPOINT}/${id}`),
  create: (data: CompanyMaster) => apiClient.post<CompanyMaster>(ENDPOINT, data),
  update: (id: number | string, data: CompanyMaster) => apiClient.put<CompanyMaster>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<CompanyMaster>) => apiClient.patch<CompanyMaster>(`${ENDPOINT}/${id}`, data),
};