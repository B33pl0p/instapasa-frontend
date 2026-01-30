import apiClient from '../apiClient';
import type {
  BuyerStats,
  Buyer,
  BuyerProfile,
  BuyersListResponse,
  BuyerStatusFilter,
} from '../types/buyer';

const BUYERS_BASE = '/dashboard/buyers';

export const buyerService = {
  // Get buyer statistics
  getStats: async (): Promise<BuyerStats> => {
    const response = await apiClient.get<BuyerStats>(`${BUYERS_BASE}/stats`);
    return response.data;
  },

  // List all buyers with filters
  listBuyers: async (
    offset: number = 0,
    limit: number = 50,
    status: BuyerStatusFilter = 'all',
    search?: string
  ): Promise<BuyersListResponse> => {
    const params = new URLSearchParams();
    params.append('offset', offset.toString());
    params.append('limit', limit.toString());
    params.append('status', status);
    
    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get<BuyersListResponse>(
      `${BUYERS_BASE}?${params.toString()}`
    );
    return response.data;
  },

  // Get buyer profile
  getBuyerProfile: async (buyerId: string): Promise<BuyerProfile> => {
    const response = await apiClient.get<BuyerProfile>(
      `${BUYERS_BASE}/${buyerId}`
    );
    return response.data;
  },

  // Update buyer tags
  updateTags: async (buyerId: string, tags: string[]): Promise<{ message: string; tags: string[] }> => {
    const response = await apiClient.post(
      `${BUYERS_BASE}/${buyerId}/tags`,
      { tags }
    );
    return response.data;
  },

  // Update buyer notes
  updateNotes: async (buyerId: string, notes: string): Promise<{ message: string; notes: string }> => {
    const response = await apiClient.put(
      `${BUYERS_BASE}/${buyerId}/notes`,
      { notes }
    );
    return response.data;
  },
};
