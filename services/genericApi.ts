import { apiClient } from './apiClient';

export class GenericApi<T> {
  constructor(private endpoint: string) {}

  getAll = () => apiClient.get<T[]>(this.endpoint);
  getById = (id: number | string) => apiClient.get<T>(`${this.endpoint}/${id}`);
  create = (data: T) => apiClient.post<T>(this.endpoint, data);
  update = (id: number | string, data: T) => apiClient.put<T>(`${this.endpoint}/${id}`, data);
  patch = (id: number | string, data: Partial<T>) => apiClient.patch<T>(`${this.endpoint}/${id}`, data);
  delete = (id: number | string) => apiClient.delete<any>(`${this.endpoint}/${id}`);
}

export const createGenericApi = <T>(endpoint: string) => new GenericApi<T>(endpoint);
