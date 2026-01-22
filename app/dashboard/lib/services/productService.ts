import apiClient from '@/app/dashboard/lib/apiClient';
import {
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  PresignedUrlResponse,
  ProductFilters,
} from '@/app/dashboard/lib/types/product';

const DASHBOARD_BASE = '/dashboard';

export const productService = {
  // List all products with pagination and filters
  listProducts: async (
    skip: number = 0,
    limit: number = 20,
    filters?: ProductFilters
  ): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }

    const response = await apiClient.get<ProductListResponse | Product[]>(
      `${DASHBOARD_BASE}/products?${params.toString()}`
    );

    // Handle both response formats:
    // 1. Expected format: { items: [], total: 0, skip: 0, limit: 0 }
    // 2. API actual format: [] (plain array)
    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        total: response.data.length,
        skip,
        limit,
      };
    }

    return response.data;
  },

  // Get single product
  getProduct: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<Product>(
      `${DASHBOARD_BASE}/products/${productId}`
    );
    return response.data;
  },

  // Create new product
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>(
      `${DASHBOARD_BASE}/products`,
      data
    );
    return response.data;
  },

  // Update product
  updateProduct: async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> => {
    const response = await apiClient.put<Product>(
      `${DASHBOARD_BASE}/products/${productId}`,
      data
    );
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`${DASHBOARD_BASE}/products/${productId}`);
  },

  // Delete multiple products
  deleteMultipleProducts: async (productIds: string[]): Promise<void> => {
    await Promise.all(productIds.map((id) => productService.deleteProduct(id)));
  },

  // Get presigned URL for image upload
  getPresignedUrl: async (productId: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>(
      `${DASHBOARD_BASE}/products/${productId}/get-upload-url?content_type=${encodeURIComponent(contentType)}`,
      {}
    );
    return response.data;
  },

  // Confirm image upload completion
  confirmImageUpload: async (productId: string, imageUrl: string, s3Key: string): Promise<Product> => {
    const encodedUrl = encodeURIComponent(imageUrl);
    const response = await apiClient.post<Product>(
      `${DASHBOARD_BASE}/products/${productId}/confirm-upload?image_url=${encodedUrl}`,
      {}
    );
    return response.data;
  },

  // Upload file directly to S3 using presigned URL via Next.js API route (avoids CORS)
  uploadToS3: async (
    presignedUrl: string,
    file: File,
    contentType: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('presigned_url', presignedUrl);
      formData.append('file', file);
      formData.append('content_type', contentType);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      if (onProgress) {
        onProgress(100);
      }
    } catch (error) {
      throw error;
    }
  },
};
