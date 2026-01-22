export interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active: boolean;
  images?: string[];
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
}

export type AttributeType = 'text' | 'number' | 'select' | 'multi_select' | 'color' | 'boolean';

export interface AttributeDefinition {
  name: string;
  label: string;
  type: AttributeType;
  required: boolean;
  options?: string[];
  help_text?: string;
  placeholder?: string;
}

export interface CategoryConfig {
  category: string;
  display_name: string;
  icon: string;
  attributes: AttributeDefinition[];
}

export interface CreateProductRequest {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active?: boolean;
  attributes?: Record<string, any>;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  sku?: string;
  stock?: number;
  is_active?: boolean;
  attributes?: Record<string, any>;
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
