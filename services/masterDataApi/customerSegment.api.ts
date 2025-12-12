import { apiClient } from '../apiClient';
import { CustomerCategory, CustomerSubCategory, CustomerGroup, CustomerType } from '../../types';

const CATE_ENDPOINT = '/customerCategories';
const SUB_CATE_ENDPOINT = '/customerSubCategories';
const GROUP_ENDPOINT = '/customerGroups';
const TYPE_ENDPOINT = '/customerTypes';

export const customerSegmentApi = {
  // Category
  getAllCategories: () => apiClient.get<CustomerCategory[]>(CATE_ENDPOINT),
  createCategory: (data: CustomerCategory) => apiClient.post<CustomerCategory>(CATE_ENDPOINT, data),
  updateCategory: (id: number | string, data: CustomerCategory) => apiClient.put<CustomerCategory>(`${CATE_ENDPOINT}/${id}`, data),
  patchCategory: (id: number | string, data: Partial<CustomerCategory>) => apiClient.patch<CustomerCategory>(`${CATE_ENDPOINT}/${id}`, data),

  // Sub-Category
  getAllSubCategories: () => apiClient.get<CustomerSubCategory[]>(SUB_CATE_ENDPOINT),
  createSubCategory: (data: CustomerSubCategory) => apiClient.post<CustomerSubCategory>(SUB_CATE_ENDPOINT, data),
  updateSubCategory: (id: number | string, data: CustomerSubCategory) => apiClient.put<CustomerSubCategory>(`${SUB_CATE_ENDPOINT}/${id}`, data),
  patchSubCategory: (id: number | string, data: Partial<CustomerSubCategory>) => apiClient.patch<CustomerSubCategory>(`${SUB_CATE_ENDPOINT}/${id}`, data),

  // Group
  getAllGroups: () => apiClient.get<CustomerGroup[]>(GROUP_ENDPOINT),
  createGroup: (data: CustomerGroup) => apiClient.post<CustomerGroup>(GROUP_ENDPOINT, data),
  updateGroup: (id: number | string, data: CustomerGroup) => apiClient.put<CustomerGroup>(`${GROUP_ENDPOINT}/${id}`, data),
  patchGroup: (id: number | string, data: Partial<CustomerGroup>) => apiClient.patch<CustomerGroup>(`${GROUP_ENDPOINT}/${id}`, data),

  // Type
  getAllTypes: () => apiClient.get<CustomerType[]>(TYPE_ENDPOINT),
  createType: (data: CustomerType) => apiClient.post<CustomerType>(TYPE_ENDPOINT, data),
  updateType: (id: number | string, data: CustomerType) => apiClient.put<CustomerType>(`${TYPE_ENDPOINT}/${id}`, data),
  patchType: (id: number | string, data: Partial<CustomerType>) => apiClient.patch<CustomerType>(`${TYPE_ENDPOINT}/${id}`, data),
};