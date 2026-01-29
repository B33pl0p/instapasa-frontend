import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lakhey.tech';
const API_VERSION = '/api/v2';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip auth for certain endpoints
    if ((config as any).skipAuth) {
      delete (config as any).skipAuth;
      return config;
    }

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login only if not already on login page and not a login request
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Don't redirect if this is a login request (the component will handle it)
        const isLoginRequest = (error.config?.url?.includes('/auth/login') || 
                                error.config?.url?.includes('/auth/signup'));
        
        if (!isLoginRequest) {
          // Clear token and redirect for other endpoints
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Extended config type to support skipAuth
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

export default apiClient;
