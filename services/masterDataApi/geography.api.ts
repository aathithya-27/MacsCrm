
import { apiClient } from '../apiClient';
import { Country, State, District, City, Area } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const { COUNTRY, STATE, DISTRICT, CITY, AREA } = API_ENDPOINTS.MASTER_DATA;

export const geographyApi = {
  // Country
  getCountries: () => apiClient.get<Country[]>(COUNTRY),
  createCountry: (data: Country) => apiClient.post<Country>(COUNTRY, data),
  updateCountry: (id: number | string, data: Country) => apiClient.put<Country>(`${COUNTRY}/${id}`, data),
  patchCountry: (id: number | string, data: Partial<Country>) => apiClient.patch<Country>(`${COUNTRY}/${id}`, data),

  // State
  getStates: () => apiClient.get<State[]>(STATE),
  createState: (data: State) => apiClient.post<State>(STATE, data),
  updateState: (id: number | string, data: State) => apiClient.put<State>(`${STATE}/${id}`, data),
  patchState: (id: number | string, data: Partial<State>) => apiClient.patch<State>(`${STATE}/${id}`, data),

  // District
  getDistricts: () => apiClient.get<District[]>(DISTRICT),
  createDistrict: (data: District) => apiClient.post<District>(DISTRICT, data),
  updateDistrict: (id: number | string, data: District) => apiClient.put<District>(`${DISTRICT}/${id}`, data),
  patchDistrict: (id: number | string, data: Partial<District>) => apiClient.patch<District>(`${DISTRICT}/${id}`, data),

  // City
  getCities: () => apiClient.get<City[]>(CITY),
  createCity: (data: City) => apiClient.post<City>(CITY, data),
  updateCity: (id: number | string, data: City) => apiClient.put<City>(`${CITY}/${id}`, data),
  patchCity: (id: number | string, data: Partial<City>) => apiClient.patch<City>(`${CITY}/${id}`, data),

  // Area
  getAreas: () => apiClient.get<Area[]>(AREA),
  createArea: (data: Area) => apiClient.post<Area>(AREA, data),
  updateArea: (id: number | string, data: Area) => apiClient.put<Area>(`${AREA}/${id}`, data),
  patchArea: (id: number | string, data: Partial<Area>) => apiClient.patch<Area>(`${AREA}/${id}`, data),
};
