import { apiClient } from '../apiClient';
import { Gift, SumAssuredTier, PremiumTier } from '../../types';

const GIFT_ENDPOINT = '/gifts';
const SA_TIER_ENDPOINT = '/sumAssuredTiers';
const PREM_TIER_ENDPOINT = '/premiumTiers';

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