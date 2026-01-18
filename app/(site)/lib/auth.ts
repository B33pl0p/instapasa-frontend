'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/lib/apiClient';

const AUTH_TOKEN_KEY = 'auth_token';
const INSTAGRAM_STORAGE_KEY = 'instagram_connected';
const INSTAGRAM_TOKEN_DATA_KEY = 'instagram_token_data';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  business_name: string;
  instagram_username: string;
  phone?: string;
  brand_description?: string;
  tone?: string;
  website?: string;
  company_contact_person?: string;
  contact_person_role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      setIsAuthenticated(!!token);
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        const response = await apiClient.post<AuthResponse>(
          '/auth/login',
          credentials,
          { skipAuth: true } as any
        );

        const { access_token } = response.data;

        if (typeof window !== 'undefined') {
          // Clear old Instagram connection data when new user logs in
          localStorage.removeItem(INSTAGRAM_STORAGE_KEY);
          localStorage.removeItem(INSTAGRAM_TOKEN_DATA_KEY);
          localStorage.setItem(AUTH_TOKEN_KEY, access_token);
          setIsAuthenticated(true);
        }

        return response.data;
      } catch (error: unknown) {
        throw error;
      }
    },
    []
  );

  // Signup function
  const signup = useCallback(
    async (data: SignupData): Promise<AuthResponse> => {
      try {
        const response = await apiClient.post<AuthResponse>(
          '/auth/signup',
          data,
          { skipAuth: true } as any
        );

        const { access_token } = response.data;

        if (typeof window !== 'undefined') {
          // Clear old Instagram connection data when new user signs up
          localStorage.removeItem(INSTAGRAM_STORAGE_KEY);
          localStorage.removeItem(INSTAGRAM_TOKEN_DATA_KEY);
          localStorage.setItem(AUTH_TOKEN_KEY, access_token);
          setIsAuthenticated(true);
        }

        return response.data;
      } catch (error: unknown) {
        throw error;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Clear all auth and Instagram connection data on logout
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(INSTAGRAM_STORAGE_KEY);
      localStorage.removeItem(INSTAGRAM_TOKEN_DATA_KEY);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  // Get token
  const getToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    getToken,
  };
}
