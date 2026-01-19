'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient, { type ApiRequestConfig } from '@/app/lib/apiClient';

type MessengerStatus = 'connected' | 'connecting' | 'not connected';

const STORAGE_KEY = 'messenger_connected';
const TOKEN_DATA_KEY = 'messenger_token_data';

interface TokenData {
  timestamp: number;
  page_id?: string;
}

interface MessengerStatusResponse {
  is_connected: boolean;
  page_id?: string;
}

export function useMessengerAuth() {
  const [status, setStatus] = useState<MessengerStatus>('not connected');

  // Reusable function to check connection status
  const checkConnectionStatus = useCallback(async () => {
    try {
      // Check Messenger connection status from backend
      // Using the same endpoint pattern as Instagram but for messenger/facebook
      const response = await apiClient.get<MessengerStatusResponse>('/auth/meta/status', {
        params: { platform: 'messenger' }
      });
      
      if (response.data.is_connected) {
        setStatus('connected');
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, 'true');
          localStorage.setItem(
            TOKEN_DATA_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              page_id: response.data.page_id,
            } as TokenData),
          );
        }
      } else {
        setStatus('not connected');
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_DATA_KEY);
        }
      }
    } catch {
      setStatus('not connected');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
    }
  }, []);

  // Check connection status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
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
          platform: 'messenger',
        },
        { skipAuth: true } as ApiRequestConfig
      );

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
      
      await apiClient.post('/auth/meta/disconnect', { platform: 'messenger' });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
      setStatus('not connected');
    } catch (error) {
      console.error('Disconnect error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_DATA_KEY);
      }
      setStatus('not connected');
      throw error;
    }
  }, []);

  return {
    status,
    setStatus,
    processOAuthCallback,
    disconnect,
    refreshStatus: checkConnectionStatus,
  };
}
