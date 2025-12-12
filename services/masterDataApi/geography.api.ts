import { apiClient } from '../apiClient';
import { Country, State, District, City, Area } from '../../types';

export const geographyApi = {
  // Country
  getCountries: () => apiClient.get<Country[]>('/countries'),
  createCountry: (data: Country) => apiClient.post<Country>('/countries', data),
  updateCountry: (id: number | string, data: Country) => apiClient.put<Country>(`/countries/${id}`, data),
  patchCountry: (id: number | string, data: Partial<Country>) => apiClient.patch<Country>(`/countries/${id}`, data),

  // State
  getStates: () => apiClient.get<State[]>('/states'),
  createState: (data: State) => apiClient.post<State>('/states', data),
  updateState: (id: number | string, data: State) => apiClient.put<State>(`/states/${id}`, data),
  patchState: (id: number | string, data: Partial<State>) => apiClient.patch<State>(`/states/${id}`, data),

  // District
  getDistricts: () => apiClient.get<District[]>('/districts'),
  createDistrict: (data: District) => apiClient.post<District>('/districts', data),
  updateDistrict: (id: number | string, data: District) => apiClient.put<District>(`/districts/${id}`, data),
  patchDistrict: (id: number | string, data: Partial<District>) => apiClient.patch<District>(`/districts/${id}`, data),

  // City
  getCities: () => apiClient.get<City[]>('/cities'),
  createCity: (data: City) => apiClient.post<City>('/cities', data),
  updateCity: (id: number | string, data: City) => apiClient.put<City>(`/cities/${id}`, data),
  patchCity: (id: number | string, data: Partial<City>) => apiClient.patch<City>(`/cities/${id}`, data),

  // Area
  getAreas: () => apiClient.get<Area[]>('/areas'),
  createArea: (data: Area) => apiClient.post<Area>('/areas', data),
  updateArea: (id: number | string, data: Area) => apiClient.put<Area>(`/areas/${id}`, data),
  patchArea: (id: number | string, data: Partial<Area>) => apiClient.patch<Area>(`/areas/${id}`, data),
};