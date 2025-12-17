import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../config/api.config';

export interface TaskStatus {
  id?: number | string;
  comp_id: number;
  status_name: string;
  color_code?: string;
  is_default?: boolean;
  status: number;
}

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.TASK_STATUS;

export const taskStatusApi = {
  getAll: () => apiClient.get<TaskStatus[]>(ENDPOINT),
  getById: (id: number | string) => apiClient.get<TaskStatus>(`${ENDPOINT}/${id}`),
  create: (data: TaskStatus) => apiClient.post<TaskStatus>(ENDPOINT, data),
  update: (id: number | string, data: TaskStatus) => apiClient.put<TaskStatus>(`${ENDPOINT}/${id}`, data),
  patch: (id: number | string, data: Partial<TaskStatus>) => apiClient.patch<TaskStatus>(`${ENDPOINT}/${id}`, data),
};
