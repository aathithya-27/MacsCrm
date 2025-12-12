import { apiClient } from '../apiClient';
import { BankMaster, AccountType } from '../../types';

const BANK_ENDPOINT = '/banks';
const ACCT_TYPE_ENDPOINT = '/accountTypes';

export const bankApi = {
  // Bank Master
  getAllBanks: () => apiClient.get<BankMaster[]>(BANK_ENDPOINT),
  createBank: (data: BankMaster) => apiClient.post<BankMaster>(BANK_ENDPOINT, data),
  updateBank: (id: number | string, data: BankMaster) => apiClient.put<BankMaster>(`${BANK_ENDPOINT}/${id}`, data),
  patchBank: (id: number | string, data: Partial<BankMaster>) => apiClient.patch<BankMaster>(`${BANK_ENDPOINT}/${id}`, data),

  // Account Types
  getAllAccountTypes: () => apiClient.get<AccountType[]>(ACCT_TYPE_ENDPOINT),
  createAccountType: (data: AccountType) => apiClient.post<AccountType>(ACCT_TYPE_ENDPOINT, data),
  updateAccountType: (id: number | string, data: AccountType) => apiClient.put<AccountType>(`${ACCT_TYPE_ENDPOINT}/${id}`, data),
  patchAccountType: (id: number | string, data: Partial<AccountType>) => apiClient.patch<AccountType>(`${ACCT_TYPE_ENDPOINT}/${id}`, data),
};