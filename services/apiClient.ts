import axios, { AxiosRequestConfig } from 'axios';
import { ApiResult } from '../types/api';
import { setupInterceptors } from './interceptors';
import { API_CONFIG } from '../config/api.config';
import { parseError } from '../utils/errorUtils';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

setupInterceptors(axiosInstance);

async function request<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
  try {
    const response = await axiosInstance.request<T>(config);
    return {
      status: true,
      data: response.data,
      message: 'Success',
    };
  } catch (error: any) {
    const msg = parseError(error);
    return {
      status: false,
      data: null as unknown as T,
      message: msg,
    };
  }
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'POST', url, data }),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'PUT', url, data }),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'DELETE', url }),
};