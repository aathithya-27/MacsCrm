import { apiClient } from '../apiClient';
import { ExpenseCategory, ExpenseHead, ExpenseIndividual } from '../../types';

const CATE_ENDPOINT = '/expenseCategories';
const HEAD_ENDPOINT = '/expenseHeads';
const IND_ENDPOINT = '/expenseIndividuals';

export const expenseApi = {
  // Category
  getAllCategories: () => apiClient.get<ExpenseCategory[]>(CATE_ENDPOINT),
  createCategory: (data: ExpenseCategory) => apiClient.post<ExpenseCategory>(CATE_ENDPOINT, data),
  updateCategory: (id: number | string, data: ExpenseCategory) => apiClient.put<ExpenseCategory>(`${CATE_ENDPOINT}/${id}`, data),
  patchCategory: (id: number | string, data: Partial<ExpenseCategory>) => apiClient.patch<ExpenseCategory>(`${CATE_ENDPOINT}/${id}`, data),

  // Head
  getAllHeads: () => apiClient.get<ExpenseHead[]>(HEAD_ENDPOINT),
  createHead: (data: ExpenseHead) => apiClient.post<ExpenseHead>(HEAD_ENDPOINT, data),
  updateHead: (id: number | string, data: ExpenseHead) => apiClient.put<ExpenseHead>(`${HEAD_ENDPOINT}/${id}`, data),
  patchHead: (id: number | string, data: Partial<ExpenseHead>) => apiClient.patch<ExpenseHead>(`${HEAD_ENDPOINT}/${id}`, data),

  // Individual
  getAllIndividuals: () => apiClient.get<ExpenseIndividual[]>(IND_ENDPOINT),
  createIndividual: (data: ExpenseIndividual) => apiClient.post<ExpenseIndividual>(IND_ENDPOINT, data),
  updateIndividual: (id: number | string, data: ExpenseIndividual) => apiClient.put<ExpenseIndividual>(`${IND_ENDPOINT}/${id}`, data),
  patchIndividual: (id: number | string, data: Partial<ExpenseIndividual>) => apiClient.patch<ExpenseIndividual>(`${IND_ENDPOINT}/${id}`, data),
};