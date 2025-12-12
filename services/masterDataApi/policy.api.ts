import { apiClient } from '../apiClient';
import { InsuranceType, InsuranceSubType, ProcessFlow, PolicyField, PolicyDocument } from '../../types';

// Endpoints
const TYPES_ENDPOINT = '/insuranceTypes';
const SUBTYPES_ENDPOINT = '/insuranceSubTypes';
const PROCESS_ENDPOINT = '/processFlows';
const FIELDS_ENDPOINT = '/policyFields';
const DOCS_ENDPOINT = '/policyDocuments';

export const policyApi = {
  // Insurance Types
  getTypes: () => apiClient.get<InsuranceType[]>(TYPES_ENDPOINT),
  createType: (data: InsuranceType) => apiClient.post<InsuranceType>(TYPES_ENDPOINT, data),
  updateType: (id: number | string, data: InsuranceType) => apiClient.put<InsuranceType>(`${TYPES_ENDPOINT}/${id}`, data),
  patchType: (id: number | string, data: Partial<InsuranceType>) => apiClient.patch<InsuranceType>(`${TYPES_ENDPOINT}/${id}`, data),

  // Insurance Sub-Types
  getSubTypes: () => apiClient.get<InsuranceSubType[]>(SUBTYPES_ENDPOINT),
  createSubType: (data: InsuranceSubType) => apiClient.post<InsuranceSubType>(SUBTYPES_ENDPOINT, data),
  updateSubType: (id: number | string, data: InsuranceSubType) => apiClient.put<InsuranceSubType>(`${SUBTYPES_ENDPOINT}/${id}`, data),
  patchSubType: (id: number | string, data: Partial<InsuranceSubType>) => apiClient.patch<InsuranceSubType>(`${SUBTYPES_ENDPOINT}/${id}`, data),

  // Process Flows
  getProcessFlows: () => apiClient.get<ProcessFlow[]>(PROCESS_ENDPOINT),
  createProcess: (data: ProcessFlow) => apiClient.post<ProcessFlow>(PROCESS_ENDPOINT, data),
  updateProcess: (id: number | string, data: ProcessFlow) => apiClient.put<ProcessFlow>(`${PROCESS_ENDPOINT}/${id}`, data),
  patchProcess: (id: number | string, data: Partial<ProcessFlow>) => apiClient.patch<ProcessFlow>(`${PROCESS_ENDPOINT}/${id}`, data),
  deleteProcess: (id: number | string) => apiClient.delete<any>(`${PROCESS_ENDPOINT}/${id}`),

  // Fields
  getFields: () => apiClient.get<PolicyField[]>(FIELDS_ENDPOINT),
  createField: (data: PolicyField) => apiClient.post<PolicyField>(FIELDS_ENDPOINT, data),
  updateField: (id: number | string, data: PolicyField) => apiClient.put<PolicyField>(`${FIELDS_ENDPOINT}/${id}`, data),
  patchField: (id: number | string, data: Partial<PolicyField>) => apiClient.patch<PolicyField>(`${FIELDS_ENDPOINT}/${id}`, data),
  deleteField: (id: number | string) => apiClient.delete<any>(`${FIELDS_ENDPOINT}/${id}`),

  // Documents Mapping
  getDocuments: () => apiClient.get<PolicyDocument[]>(DOCS_ENDPOINT),
  createDocument: (data: PolicyDocument) => apiClient.post<PolicyDocument>(DOCS_ENDPOINT, data),
  updateDocument: (id: number | string, data: PolicyDocument) => apiClient.put<PolicyDocument>(`${DOCS_ENDPOINT}/${id}`, data),
  deleteDocument: (id: number | string) => apiClient.delete<any>(`${DOCS_ENDPOINT}/${id}`),
};