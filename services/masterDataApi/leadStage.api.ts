import { apiClient } from '../apiClient';
import { LeadStage } from '../../types';

const ENDPOINT = '/leadStages';

export const leadStageApi = {
  getAll: () => apiClient.get<LeadStage[]>(ENDPOINT),
  create: (data: LeadStage) => apiClient.post<LeadStage>(ENDPOINT, data),
  update: (id: number | string, data: LeadStage) => apiClient.put<LeadStage>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<LeadStage>) => apiClient.patch<LeadStage>(`${ENDPOINT}/${id}`, data),
};