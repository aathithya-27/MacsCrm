
import { apiClient } from '../apiClient';
import { AccountCategory, AccountSubCategory, AccountHead } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const { ACCOUNT_CATEGORY, ACCOUNT_SUB_CATEGORY, ACCOUNT_HEAD } = API_ENDPOINTS.MASTER_DATA;

export const accountsCategoryApi = {
  // Categories
  getAllCategories: () => apiClient.get<AccountCategory[]>(ACCOUNT_CATEGORY),
  createCategory: (data: AccountCategory) => apiClient.post<AccountCategory>(ACCOUNT_CATEGORY, data),
  updateCategory: (id: number | string, data: AccountCategory) => apiClient.put<AccountCategory>(`${ACCOUNT_CATEGORY}/${id}`, data),
  patchCategory: (id: number | string, data: Partial<AccountCategory>) => apiClient.patch<AccountCategory>(`${ACCOUNT_CATEGORY}/${id}`, data),

  // Sub Categories
  getAllSubCategories: () => apiClient.get<AccountSubCategory[]>(ACCOUNT_SUB_CATEGORY),
  createSubCategory: (data: AccountSubCategory) => apiClient.post<AccountSubCategory>(ACCOUNT_SUB_CATEGORY, data),
  updateSubCategory: (id: number | string, data: AccountSubCategory) => apiClient.put<AccountSubCategory>(`${ACCOUNT_SUB_CATEGORY}/${id}`, data),
  patchSubCategory: (id: number | string, data: Partial<AccountSubCategory>) => apiClient.patch<AccountSubCategory>(`${ACCOUNT_SUB_CATEGORY}/${id}`, data),

  // Heads
  getAllHeads: () => apiClient.get<AccountHead[]>(ACCOUNT_HEAD),
  createHead: (data: AccountHead) => apiClient.post<AccountHead>(ACCOUNT_HEAD, data),
  updateHead: (id: number | string, data: AccountHead) => apiClient.put<AccountHead>(`${ACCOUNT_HEAD}/${id}`, data),
  patchHead: (id: number | string, data: Partial<AccountHead>) => apiClient.patch<AccountHead>(`${ACCOUNT_HEAD}/${id}`, data),
};
