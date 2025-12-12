import { apiClient } from '../apiClient';
import { Agency, Scheme } from '../../types';

const AGENCY_ENDPOINT = '/agencies';
const SCHEME_ENDPOINT = '/schemes';

export const agencyApi = {
  // Agency
  getAllAgencies: () => apiClient.get<Agency[]>(AGENCY_ENDPOINT),
  getAgencyById: (id: number | string) => apiClient.get<Agency>(`${AGENCY_ENDPOINT}/${id}`),
  createAgency: (data: Agency) => apiClient.post<Agency>(AGENCY_ENDPOINT, data),
  updateAgency: (id: number | string, data: Agency) => apiClient.put<Agency>(`${AGENCY_ENDPOINT}/${id}`, data),
  patchAgency: (id: number | string, data: Partial<Agency>) => apiClient.patch<Agency>(`${AGENCY_ENDPOINT}/${id}`, data),
  deleteAgency: (id: number | string) => apiClient.delete<any>(`${AGENCY_ENDPOINT}/${id}`),

  // Scheme
  getAllSchemes: () => apiClient.get<Scheme[]>(SCHEME_ENDPOINT),
  getSchemeById: (id: number | string) => apiClient.get<Scheme>(`${SCHEME_ENDPOINT}/${id}`),
  createScheme: (data: Scheme) => apiClient.post<Scheme>(SCHEME_ENDPOINT, data),
  updateScheme: (id: number | string, data: Scheme) => apiClient.put<Scheme>(`${SCHEME_ENDPOINT}/${id}`, data),
  patchScheme: (id: number | string, data: Partial<Scheme>) => apiClient.patch<Scheme>(`${SCHEME_ENDPOINT}/${id}`, data),
  deleteScheme: (id: number | string) => apiClient.delete<any>(`${SCHEME_ENDPOINT}/${id}`),
};