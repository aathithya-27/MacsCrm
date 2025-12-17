
import { apiClient } from '../apiClient';
import { LeadStage } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.LEAD_STAGE;

export const leadStageApi = {
  getAll: () => apiClient.get<LeadStage[]>(ENDPOINT),
  create: (data: LeadStage) => apiClient.post<LeadStage>(ENDPOINT, data),
  update: (id: number | string, data: LeadStage) => apiClient.put<LeadStage>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<LeadStage>) => apiClient.patch<LeadStage>(`${ENDPOINT}/${id}`, data),
};
