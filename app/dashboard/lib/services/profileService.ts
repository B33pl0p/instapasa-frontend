import apiClient from '../apiClient';
import type {
  SellerProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ProfileUpdateResponse,
} from '../types/profile';

export const profileService = {
  async getProfile(): Promise<SellerProfile> {
    const response = await apiClient.get('/dashboard/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileUpdateResponse> {
    const response = await apiClient.put('/dashboard/profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.put('/dashboard/profile/password', data);
    return response.data;
  },

  async deactivateAccount(): Promise<{ message: string }> {
    const response = await apiClient.delete('/dashboard/profile');
    return response.data;
  },
};
