
import { apiClient } from '../apiClient';
import { Gift, SumAssuredTier, PremiumTier } from '../../types';
import { API_ENDPOINTS } from '../../config/api.config';

const GIFT_ENDPOINT = API_ENDPOINTS.MASTER_DATA.GIFT;
const SA_TIER_ENDPOINT = API_ENDPOINTS.MASTER_DATA.SUM_ASSURED_TIER;
const PREM_TIER_ENDPOINT = API_ENDPOINTS.MASTER_DATA.PREMIUM_TIER;

export const giftApi = {
  // Gifts
  getAllGifts: () => apiClient.get<Gift[]>(GIFT_ENDPOINT),
  createGift: (data: Gift) => apiClient.post<Gift>(GIFT_ENDPOINT, data),
  updateGift: (id: number, data: Gift) => apiClient.put<Gift>(`${GIFT_ENDPOINT}/${id}`, data),
  patchGift: (id: number, data: Partial<Gift>) => apiClient.patch<Gift>(`${GIFT_ENDPOINT}/${id}`, data),

  // Sum Assured Tiers
  getAllSumAssuredTiers: () => apiClient.get<SumAssuredTier[]>(SA_TIER_ENDPOINT),
  createSumAssuredTier: (data: SumAssuredTier) => apiClient.post<SumAssuredTier>(SA_TIER_ENDPOINT, data),
  updateSumAssuredTier: (id: number, data: SumAssuredTier) => apiClient.put<SumAssuredTier>(`${SA_TIER_ENDPOINT}/${id}`, data),
  patchSumAssuredTier: (id: number, data: Partial<SumAssuredTier>) => apiClient.patch<SumAssuredTier>(`${SA_TIER_ENDPOINT}/${id}`, data),

  // Premium Tiers
  getAllPremiumTiers: () => apiClient.get<PremiumTier[]>(PREM_TIER_ENDPOINT),
  createPremiumTier: (data: PremiumTier) => apiClient.post<PremiumTier>(PREM_TIER_ENDPOINT, data),
  updatePremiumTier: (id: number, data: PremiumTier) => apiClient.put<PremiumTier>(`${PREM_TIER_ENDPOINT}/${id}`, data),
  patchPremiumTier: (id: number, data: Partial<PremiumTier>) => apiClient.patch<PremiumTier>(`${PREM_TIER_ENDPOINT}/${id}`, data),
};
