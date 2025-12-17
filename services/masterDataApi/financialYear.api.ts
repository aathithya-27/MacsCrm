
import { apiClient } from '../apiClient';
import { FinancialYear, NumberingRule } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const FY_ENDPOINT = API_ENDPOINTS.MASTER_DATA.FINANCIAL_YEAR;
const RULE_ENDPOINT = API_ENDPOINTS.MASTER_DATA.NUMBERING_RULE;

export const financialYearApi = {
  // Financial Years
  getAllFY: () => apiClient.get<FinancialYear[]>(FY_ENDPOINT),
  createFY: (data: FinancialYear) => apiClient.post<FinancialYear>(FY_ENDPOINT, data),
  updateFY: (id: number | string, data: FinancialYear) => apiClient.put<FinancialYear>(`${FY_ENDPOINT}/${id}`, data),
  patchFY: (id: number | string, data: Partial<FinancialYear>) => apiClient.patch<FinancialYear>(`${FY_ENDPOINT}/${id}`, data),
  
  // Numbering Rules
  getAllRules: () => apiClient.get<NumberingRule[]>(RULE_ENDPOINT),
  createRule: (data: NumberingRule) => apiClient.post<NumberingRule>(RULE_ENDPOINT, data),
  updateRule: (id: number | string, data: NumberingRule) => apiClient.put<NumberingRule>(`${RULE_ENDPOINT}/${id}`, data),
  patchRule: (id: number | string, data: Partial<NumberingRule>) => apiClient.patch<NumberingRule>(`${RULE_ENDPOINT}/${id}`, data),
};
