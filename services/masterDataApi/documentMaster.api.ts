import { apiClient } from '../apiClient';
import { DocumentMaster } from '../../types';

const ENDPOINT = '/documentMasters';

export const documentMasterApi = {
  getAll: () => apiClient.get<DocumentMaster[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<DocumentMaster>(`${ENDPOINT}/${id}`),
  create: (data: DocumentMaster) => apiClient.post<DocumentMaster>(ENDPOINT, data),
  update: (id: number | string, data: DocumentMaster) => apiClient.put<DocumentMaster>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<DocumentMaster>) => apiClient.patch<DocumentMaster>(`${ENDPOINT}/${id}`, data),
  delete: (id: number | string) => apiClient.delete<any>(`${ENDPOINT}/${id}`),
};