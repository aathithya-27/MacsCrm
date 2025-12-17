
import { apiClient } from '../apiClient';
import { Route } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const ENDPOINT = API_ENDPOINTS.MASTER_DATA.ROUTE;

export const routeApi = {
  getAll: () => apiClient.get<Route[]>(ENDPOINT),
  create: (data: Route) => apiClient.post<Route>(ENDPOINT, data),
  update: (id: number, data: Route) => apiClient.put<Route>(`${ENDPOINT}/${id}`, data),
  patch: (id: number, data: Partial<Route>) => apiClient.patch<Route>(`${ENDPOINT}/${id}`, data),
};
