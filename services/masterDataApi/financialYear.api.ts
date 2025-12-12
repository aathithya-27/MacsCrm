import { apiClient } from '../apiClient';
import { FinancialYear, NumberingRule } from '../../types';

const FY_ENDPOINT = '/financialYears';
const RULE_ENDPOINT = '/numberingRules';

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