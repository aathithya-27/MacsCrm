
import { apiClient } from '../apiClient';
import { CompanyMaster } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.COMPANY;

export const companyMasterApi = {
  getAll: () => apiClient.get<CompanyMaster[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<CompanyMaster>(`${ENDPOINT}/${id}`),
  create: (data: CompanyMaster) => apiClient.post<CompanyMaster>(ENDPOINT, data),
  update: (id: number | string, data: CompanyMaster) => apiClient.put<CompanyMaster>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<CompanyMaster>) => apiClient.patch<CompanyMaster>(`${ENDPOINT}/${id}`, data),
};
