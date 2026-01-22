export interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active: boolean;
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  url: string;
  key: string;
}

export interface CreateProductRequest {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface PresignedUrlResponse {
  presigned_url: string;
  image_url: string;
  s3_key: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
}
