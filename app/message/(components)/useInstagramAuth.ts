'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient, { type ApiRequestConfig } from '@/app/lib/apiClient';

type InstagramStatus = 'connected' | 'connecting' | 'not connected';

const STORAGE_KEY = 'instagram_connected';
const TOKEN_DATA_KEY = 'instagram_token_data';

interface TokenData {
  timestamp: number;
  instagram_username?: string;
  instagram_user_id?: string;
  instagram_page_id?: string;
  profile_picture_url?: string;
}

interface InstagramStatusResponse {
  is_connected: boolean;
  instagram_username?: string;
  instagram_user_id?: string;
  instagram_page_id?: string;
  profile_picture_url?: string;
}

export function useInstagramAuth() {
  const [status, setStatus] = useState<InstagramStatus>('not connected');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Reusable function to check connection status
  const checkConnectionStatus = useCallback(async () => {
    try {
      // Check Instagram connection status from backend
      const response = await apiClient.get<InstagramStatusResponse>('/auth/meta/status');
      
      if (response.data.is_connected) {
        // Instagram is connected - update status and store connection data
        setStatus('connected');
        setProfilePictureUrl(response.data.profile_picture_url || null);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, 'true');
          localStorage.setItem(
            TOKEN_DATA_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              instagram_username: response.data.instagram_username,
              instagram_user_id: response.data.instagram_user_id,
              instagram_page_id: response.data.instagram_page_id,
              profile_picture_url: response.data.profile_picture_url,
            } as TokenData),
          );
        }
      } else {
        // Instagram is not connected - clear stored data
        setStatus('not connected');
        setProfilePictureUrl(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_DATA_KEY);
        }
      }
    } catch {
      // If we get an error (401, 404, etc.), Instagram is not connected
      // Clear stored data
      setStatus('not connected');
      setProfilePictureUrl(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
    }
  }, []);

  // Check connection status on mount - verify with backend using status API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      void checkConnectionStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkConnectionStatus]);

  // Process OAuth callback
  const processOAuthCallback = useCallback(async (accessToken: string) => {
    try {
      setStatus('connecting');

      const response = await apiClient.post(
        '/auth/meta/complete',
        {
          short_lived_token: accessToken,
        },
        { skipAuth: true } as ApiRequestConfig
      );

      // After connecting, re-check status to get profile picture and update state
      await checkConnectionStatus();

      return { success: true, data: response.data };
    } catch (error) {
      setStatus('not connected');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
      throw error;
    }
  }, [checkConnectionStatus]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      setStatus('connecting');
      
      // Call backend API to disconnect Instagram
      await apiClient.post('/auth/meta/disconnect');
      
      // Clear local state after successful API call
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
      setStatus('not connected');
      setProfilePictureUrl(null);
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still clear local state on error to ensure UI updates
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
      setStatus('not connected');
      setProfilePictureUrl(null);
      // Re-throw error so calling component can handle it if needed
      throw error;
    }
  }, []);

  return {
    status,
    setStatus,
    processOAuthCallback,
    disconnect,
    profilePictureUrl,
    refreshStatus: checkConnectionStatus,
  };
}
