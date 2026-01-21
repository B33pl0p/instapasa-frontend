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
  getPresignedUrl: async (productId: string): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<PresignedUrlResponse>(
      `${DASHBOARD_BASE}/products/${productId}/get-upload-url`,
      {}
    );
    return response.data;
  },

  // Upload file directly to S3 using presigned URL
  uploadToS3: async (
    presignedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },
};
