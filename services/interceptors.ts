import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { NetworkError, AuthenticationError } from '../types/errors';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number };

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(new AuthenticationError());
      }

      // Retry logic
      if (
        !originalRequest._retry &&
        (error.code === 'ERR_NETWORK' || (error.response && error.response.status >= 500))
      ) {
        originalRequest._retry = (originalRequest._retry || 0) + 1;
        
        if (originalRequest._retry <= API_CONFIG.RETRY_COUNT) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, originalRequest._retry - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return axiosInstance(originalRequest);
        }
      }

      // Transform into custom error
      if (error.code === 'ERR_NETWORK') {
        return Promise.reject(new NetworkError());
      }

      return Promise.reject(error);
    }
  );
};