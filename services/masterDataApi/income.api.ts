import { apiClient } from '../apiClient';
import { IncomeCategory, IncomeHead } from '../../types';

const CATE_ENDPOINT = '/incomeCategories';
const HEAD_ENDPOINT = '/incomeHeads';

export const incomeApi = {
  // Category
  getAllCategories: () => apiClient.get<IncomeCategory[]>(CATE_ENDPOINT),
  createCategory: (data: IncomeCategory) => apiClient.post<IncomeCategory>(CATE_ENDPOINT, data),
  updateCategory: (id: number | string, data: IncomeCategory) => apiClient.put<IncomeCategory>(`${CATE_ENDPOINT}/${id}`, data),
  patchCategory: (id: number | string, data: Partial<IncomeCategory>) => apiClient.patch<IncomeCategory>(`${CATE_ENDPOINT}/${id}`, data),

  // Head
  getAllHeads: () => apiClient.get<IncomeHead[]>(HEAD_ENDPOINT),
  createHead: (data: IncomeHead) => apiClient.post<IncomeHead>(HEAD_ENDPOINT, data),
  updateHead: (id: number | string, data: IncomeHead) => apiClient.put<IncomeHead>(`${HEAD_ENDPOINT}/${id}`, data),
  patchHead: (id: number | string, data: Partial<IncomeHead>) => apiClient.patch<IncomeHead>(`${HEAD_ENDPOINT}/${id}`, data),
};