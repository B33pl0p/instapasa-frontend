'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { createProduct } from '@/app/dashboard/lib/slices/productSlice';
import { CreateProductRequest, CategoryConfig, ProductVariantCreate } from '@/app/dashboard/lib/types/product';
import { fetchCategories, fetchCategoryConfig } from '@/app/dashboard/lib/services/productService';
import { DynamicAttributeFields } from '../(components)/DynamicAttributeFields';
import VariantBuilder from '../(components)/VariantBuilder';

const categoryIcons: Record<string, string> = {
  clothing: '👕',
  footwear: '👟',
  electronics: '📱',
  food: '🍔',
  beauty: '💄',
  home: '🏠',
  books: '📚',
  general: '📦',
};

export default function CreateProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    price: undefined,
    description: '',
    category: '',
    sku: '',
    stock: 0,
    is_active: true,
    attributes: {},
    variants: [],
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useVariants, setUseVariants] = useState(false);

  // Fetch available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    void loadCategories();
  }, []);

  // Fetch category config when category changes
  useEffect(() => {
    const loadCategoryConfig = async () => {
      if (!formData.category) {
        setCategoryConfig(null);
        return;
      }

      try {
        const config = await fetchCategoryConfig(formData.category);
        setCategoryConfig(config);
        // Reset attributes when category changes
        setFormData((prev) => ({ ...prev, attributes: {} }));
      } catch (err) {
        console.error('Failed to load category config:', err);
      }
    };
    void loadCategoryConfig();
  }, [formData.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === 'price' || name === 'stock') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : (name === 'stock' ? 0 : undefined),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAttributesChange = (attributes: Record<string, any>) => {
    setFormData({ ...formData, attributes });
  };

  const handleVariantsChange = (variants: ProductVariantCreate[]) => {
    setFormData({ ...formData, variants });
  };

  const handleUseVariantsToggle = (checked: boolean) => {
    setUseVariants(checked);
    if (checked) {
      // Clear stock and attributes when switching to variant mode
      setFormData({ ...formData, stock: 0, attributes: {}, variants: [] });
    } else {
      // Clear variants when switching to simple mode
      setFormData({ ...formData, variants: [] });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError('Product name is required');
      return false;
    }

    // Validate variants if using variant mode
    if (useVariants) {
      if (!formData.variants || formData.variants.length === 0) {
        setError('At least one variant is required when using variant mode');
        return false;
      }

      // Check for duplicate variants
      const seen = new Set<string>();
      for (const variant of formData.variants) {
        const key = JSON.stringify(variant.attributes);
        if (seen.has(key)) {
          setError('Duplicate variants detected. Each variant must have unique attributes.');
          return false;
        }
        seen.add(key);
      }
    } else {
      // Validate required attributes for single-variant products
      if (categoryConfig?.attributes) {
        for (const attr of categoryConfig.attributes) {
          const value = formData.attributes?.[attr.name];
          if (attr.required && (value === undefined || value === null || value === '')) {
            setError(`${attr.label} is required`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload based on variant mode
      const payload = useVariants
        ? { ...formData, variants: formData.variants, stock: undefined, attributes: undefined }
        : { ...formData, variants: undefined };
      
      await dispatch(createProduct(payload)).unwrap();
      router.push('/dashboard/products');
    } catch (err) {
      setError((err as Error).message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-1">Add a new product to your inventory</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex justify-between items-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    disabled={loading}
                    rows={4}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    disabled={loading || loadingCategories}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryIcons[cat] || '📦'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Category Attributes - Only for single-variant mode */}
            {categoryConfig && !useVariants && (
              <div className="bg-white rounded-lg shadow p-6">
                <DynamicAttributeFields
                  categoryConfig={categoryConfig}
                  attributes={formData.attributes || {}}
                  onChange={handleAttributesChange}
                />
              </div>
            )}

            {/* Variants Builder - Only for multi-variant mode */}
            {useVariants && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Variants</h2>
                <VariantBuilder
                  value={formData.variants || []}
                  onChange={handleVariantsChange}
                  category={formData.category}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Stock Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) {useVariants && <span className="text-sm font-normal text-gray-500">(Base Price)</span>}
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price ?? ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {useVariants && (
                    <p className="text-xs text-gray-500 mt-1">
                      Variants can have individual price adjustments
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Variant Mode Toggle */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVariants}
                      onChange={(e) => handleUseVariantsToggle(e.target.checked)}
                      disabled={loading}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Multiple Variants (Size/Color)
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Enable to add variants with different sizes, colors, or other attributes
                      </p>
                    </div>
                  </label>
                </div>

                {/* Stock - Only show for single-variant mode */}
                {!useVariants && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock ?? 0}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Variant stock info */}
                {useVariants && formData.variants && formData.variants.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">
                      {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Total Stock: {formData.variants.reduce((sum, v) => sum + v.stock, 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active ?? true}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <SaveIcon fontSize="small" />
                  <span>{loading ? 'Creating...' : 'Create Product'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/products')}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <CancelIcon fontSize="small" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
