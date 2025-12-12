import { apiClient } from '../apiClient';
import { Religion, Festival, FestivalDate } from '../../types';

const RELIGION_ENDPOINT = '/religions';
const FESTIVAL_ENDPOINT = '/festivals';
const DATES_ENDPOINT = '/festivalDates';

export const religionFestivalApi = {
  // Religion
  getAllReligions: () => apiClient.get<Religion[]>(RELIGION_ENDPOINT),
  createReligion: (data: Religion) => apiClient.post<Religion>(RELIGION_ENDPOINT, data),
  updateReligion: (id: number | string, data: Religion) => apiClient.put<Religion>(`${RELIGION_ENDPOINT}/${id}`, data),
  patchReligion: (id: number | string, data: Partial<Religion>) => apiClient.patch<Religion>(`${RELIGION_ENDPOINT}/${id}`, data),
  deleteReligion: (id: number | string) => apiClient.delete<any>(`${RELIGION_ENDPOINT}/${id}`),

  // Festival
  getAllFestivals: () => apiClient.get<Festival[]>(FESTIVAL_ENDPOINT),
  createFestival: (data: Festival) => apiClient.post<Festival>(FESTIVAL_ENDPOINT, data),
  updateFestival: (id: number | string, data: Festival) => apiClient.put<Festival>(`${FESTIVAL_ENDPOINT}/${id}`, data),
  patchFestival: (id: number | string, data: Partial<Festival>) => apiClient.patch<Festival>(`${FESTIVAL_ENDPOINT}/${id}`, data),
  deleteFestival: (id: number | string) => apiClient.delete<any>(`${FESTIVAL_ENDPOINT}/${id}`),

  // Festival Dates
  getAllDates: () => apiClient.get<FestivalDate[]>(DATES_ENDPOINT),
  createDate: (data: FestivalDate) => apiClient.post<FestivalDate>(DATES_ENDPOINT, data),
  updateDate: (id: number | string, data: FestivalDate) => apiClient.put<FestivalDate>(`${DATES_ENDPOINT}/${id}`, data),
  patchDate: (id: number | string, data: Partial<FestivalDate>) => apiClient.patch<FestivalDate>(`${DATES_ENDPOINT}/${id}`, data),
  deleteDate: (id: number | string) => apiClient.delete<any>(`${DATES_ENDPOINT}/${id}`),
};