'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Typography,
  Alert,
  FormHelperText,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { createProduct } from '@/app/dashboard/lib/slices/productSlice';
import { CreateProductRequest, CategoryConfig, ProductVariantCreate } from '@/app/dashboard/lib/types/product';
import { fetchCategories, fetchCategoryConfig } from '@/app/dashboard/lib/services/productService';
import { DynamicAttributeFields } from '../(components)/DynamicAttributeFields';
import VariantBuilder from '../(components)/VariantBuilder';

const categoryIcons: Record<string, string> = {
  clothing: 'Clothing',
  footwear: 'Footwear',
  electronics: 'Electronics',
  food: 'Food',
  beauty: 'Beauty',
  home: 'Home',
  books: 'Books',
  general: 'Product',
};

export default function CreateProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const theme = useTheme();

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
    <Box sx={{ p: 3, maxHeight: '100vh', overflowY: 'auto', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
          Create New Product
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Add a new product to your inventory
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Main Details */}
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Information Card */}
              <Card sx={{ backgroundColor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Product Name */}
                    <TextField
                      fullWidth
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Enter product name"
                      variant="outlined"
                      size="small"
                    />

                    {/* Description */}
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      disabled={loading}
                      multiline
                      rows={4}
                      placeholder="Enter product description"
                      variant="outlined"
                      size="small"
                    />

                    {/* Category */}
                    <Box>
                      <Select
                        fullWidth
                        name="category"
                        value={formData.category || ''}
                        onChange={(e) => handleChange(e as any)}
                        disabled={loading || loadingCategories}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="">-- Select Category --</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Dynamic Category Attributes - Only for single-variant mode */}
              {categoryConfig && !useVariants && (
                <Card sx={{ backgroundColor: 'background.paper' }}>
                  <CardContent>
                    <DynamicAttributeFields
                      categoryConfig={categoryConfig}
                      attributes={formData.attributes || {}}
                      onChange={handleAttributesChange}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Variants Builder - Only for multi-variant mode */}
              {useVariants && (
                <Card sx={{ backgroundColor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                      Product Variants
                    </Typography>
                    <VariantBuilder
                      value={formData.variants || []}
                      onChange={handleVariantsChange}
                      category={formData.category}
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Pricing & Stock Card */}
              <Card sx={{ backgroundColor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                    Pricing & Inventory
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Price */}
                    <Box>
                      <TextField
                        fullWidth
                        label={useVariants ? 'Price (Rs.) - Base Price' : 'Price (Rs.)'}
                        type="number"
                        name="price"
                        inputProps={{ step: '0.01', min: '0' }}
                        value={formData.price ?? ''}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="0.00"
                        variant="outlined"
                        size="small"
                      />
                      {useVariants && (
                        <FormHelperText>
                          Variants can have individual price adjustments
                        </FormHelperText>
                      )}
                    </Box>

                    {/* SKU */}
                    <TextField
                      fullWidth
                      label="SKU"
                      type="text"
                      name="sku"
                      value={formData.sku || ''}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter SKU"
                      variant="outlined"
                      size="small"
                    />

                    {/* Variant Mode Toggle */}
                    <Box sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={useVariants}
                            onChange={(e) => handleUseVariantsToggle(e.target.checked)}
                            disabled={loading}
                            name="useVariants"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Multiple Variants (Size/Color)
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Enable to add variants with different sizes, colors, or other attributes
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>

                    {/* Stock - Only show for single-variant mode */}
                    {!useVariants && (
                      <TextField
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        name="stock"
                        inputProps={{ min: '0' }}
                        value={formData.stock ?? 0}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="0"
                        variant="outlined"
                        size="small"
                      />
                    )}

                    {/* Variant stock info */}
                    {useVariants && formData.variants && formData.variants.length > 0 && (
                      <Box sx={{ backgroundColor: 'info.lighter', border: `1px solid ${theme.palette.info.main}`, borderRadius: 1, p: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.dark' }}>
                          {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'info.main', display: 'block', mt: 0.5 }}>
                          Total Stock: {formData.variants.reduce((sum, v) => sum + v.stock, 0)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card sx={{ backgroundColor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                    Status
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="is_active"
                        checked={formData.is_active ?? true}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    }
                    label="Active (visible to customers)"
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card sx={{ backgroundColor: 'background.paper' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={<SaveIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      {loading ? 'Creating...' : 'Create Product'}
                    </Button>
                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push('/dashboard/products')}
                      disabled={loading}
                      startIcon={<CancelIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
