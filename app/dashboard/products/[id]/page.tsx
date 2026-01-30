'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Grid,
  FormLabel,
  Stack,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { updateProduct } from '@/app/dashboard/lib/slices/productSlice';
import { 
  productService, 
  fetchCategories, 
  fetchCategoryConfig 
} from '@/app/dashboard/lib/services/productService';
import { UpdateProductRequest, Product, CategoryConfig, ProductVariantCreate } from '@/app/dashboard/lib/types/product';
import { DynamicAttributeFields } from '../(components)/DynamicAttributeFields';
import { ImageUploader } from '../(components)/ImageUploader';
import { VariantImageManager } from '../(components)/VariantImageManager';
import VariantBuilder from '../(components)/VariantBuilder';
import Image from 'next/image';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';
import RouteGuard from '@/app/dashboard/message/(components)/RouteGuard';

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

export default function EditProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductRequest>({
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
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'variant-images'>('details');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useVariants, setUseVariants] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // Fetch product details on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const data = await productService.getProduct(productId);
        setProduct(data);
        
        // Detect if product uses variants
        const hasVariants = data.variants && data.variants.length > 0;
        setUseVariants(!!hasVariants);
        
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description || '',
          category: data.category || '',
          sku: data.sku || '',
          stock: data.stock || 0,
          is_active: data.is_active ?? true,
          attributes: data.attributes || {},
          variants: hasVariants ? (data.variants || []).map(v => ({
            attributes: v.attributes,
            stock: v.stock,
            price_adjustment: v.price_adjustment,
            sku: v.sku || undefined,
            images: v.images || undefined,
          })) : [],
        });
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details');
      } finally {
        setFetching(false);
      }
    };
    void fetchProduct();
  }, [productId]);

  // Fetch available categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
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
          if (attr.required && !formData.attributes?.[attr.name]) {
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
      
      await dispatch(updateProduct({ productId: productId, data: payload })).unwrap();
      // Refetch product to get updated data
      const updatedProduct = await productService.getProduct(productId);
      setProduct(updatedProduct);
      setError(null);
      showToast('Product updated successfully!', 'success');
    } catch (err) {
      setError((err as Error).message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploadSuccess = async () => {
    // Refetch product to get updated images
    try {
      const updatedProduct = await productService.getProduct(productId);
      setProduct(updatedProduct);
      showToast('Images uploaded successfully', 'success');
    } catch (err) {
      console.error('Failed to refresh product:', err);
      showToast('Failed to refresh product images', 'error');
    }
  };

  const theme = useTheme();

  if (fetching) {
    return (
      <RouteGuard>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </RouteGuard>
    );
  }

  if (!product) {
    return (
      <RouteGuard>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Product not found</Alert>
        </Box>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Edit Product
            </Typography>
            <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              Update product information
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.push('/dashboard/products')}
            sx={{ textTransform: 'none' }}
          >
            Back to Products
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={
              activeTab === 'details' ? 0 : 
              activeTab === 'images' ? 1 : 
              activeTab === 'variant-images' ? 2 : 0
            } 
            onChange={(e, val) => {
              if (val === 0) setActiveTab('details');
              else if (val === 1) setActiveTab('images');
              else if (val === 2) setActiveTab('variant-images');
            }}
          >
            <Tab label="Product Details" />
            <Tab label={`Product Images (${product.images?.length || 0})`} />
            {product.variants && product.variants.length > 0 && (
              <Tab label={`Variant Images (${product.variants.reduce((sum, v) => sum + (v.images?.length || 0), 0)})`} />
            )}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
              {/* Main Details */}
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
                <Stack spacing={3}>
                  {/* Basic Information Card */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Basic Information
                      </Typography>
                      <Stack spacing={2}>
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
                          size="small"
                        />

                        {/* Category */}
                        <TextField
                          fullWidth
                          select
                          label="Category"
                          name="category"
                          value={formData.category || ''}
                          onChange={handleChange}
                          disabled={loading || loadingCategories}
                          size="small"
                        >
                          <MenuItem value="">-- Select Category --</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Dynamic Category Attributes - Only for single-variant mode */}
                  {categoryConfig && !useVariants && (
                    <Card>
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
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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
                </Stack>
              </Box>

              {/* Sidebar */}
              <Box sx={{ gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
                <Stack spacing={3}>
                  {/* Pricing & Stock Card */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Pricing & Inventory
                      </Typography>
                      <Stack spacing={2}>
                        {/* Price */}
                        <TextField
                          fullWidth
                          label="Price (Rs.)"
                          name="price"
                          type="number"
                          inputProps={{ step: '0.01', min: '0' }}
                          value={formData.price ?? ''}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="0.00"
                          size="small"
                          helperText={useVariants ? 'Variants can have individual price adjustments' : ''}
                        />

                        {/* SKU */}
                        <TextField
                          fullWidth
                          label="SKU"
                          name="sku"
                          value={formData.sku || ''}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="Enter SKU"
                          size="small"
                        />

                        {/* Variant Mode Toggle - Only allow switching if no existing variants */}
                        {!product?.variants?.length && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={useVariants}
                                onChange={(e) => handleUseVariantsToggle(e.target.checked)}
                                disabled={loading}
                              />
                            }
                            label="Multiple Variants (Size/Color)"
                          />
                        )}

                        {/* Display variant mode status if product has variants */}
                        {product?.variants?.length ? (
                          <Alert severity="info">
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Variant Mode Active
                            </Typography>
                            <Typography variant="caption">
                              This product uses variants. Stock is managed per variant.
                            </Typography>
                          </Alert>
                        ) : null}

                        {/* Stock - Only show for single-variant mode */}
                        {!useVariants && (
                          <TextField
                            fullWidth
                            label="Stock Quantity"
                            name="stock"
                            type="number"
                            inputProps={{ min: '0' }}
                            value={formData.stock ?? 0}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="0"
                            size="small"
                          />
                        )}

                        {/* Variant stock info */}
                        {useVariants && formData.variants && formData.variants.length > 0 && (
                          <Alert severity="info">
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {formData.variants.length} variant{formData.variants.length !== 1 ? 's' : ''}
                            </Typography>
                            <Typography variant="caption">
                              Total Stock: {formData.variants.reduce((sum, v) => sum + v.stock, 0)}
                            </Typography>
                          </Alert>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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
                  <Card>
                    <CardContent>
                      <Stack spacing={1}>
                        <Button
                          variant="contained"
                          type="submit"
                          disabled={loading}
                          startIcon={<SaveIcon />}
                          fullWidth
                          sx={{ textTransform: 'none' }}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          type="button"
                          onClick={() => router.push('/dashboard/products')}
                          disabled={loading}
                          startIcon={<CancelIcon />}
                          fullWidth
                          sx={{ textTransform: 'none' }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
            </Box>
          </Box>
        ) : activeTab === 'variant-images' ? (
          /* Variant Images Tab */
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Variant-Specific Images
              </Typography>
              <VariantImageManager 
                product={product} 
                onUpdate={handleImageUploadSuccess}
                showToast={showToast}
              />
            </CardContent>
          </Card>
        ) : (
          /* Product Images Tab */
          /* Product Images Tab */
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Product Images
              </Typography>

              {/* Image Gallery */}
              {product.images && product.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                    Current Images
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {product.images.map((image, index) => (
                      <Box key={index}>
                        <Box sx={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden' }}>
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
                            style={{ objectFit: 'cover' }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              opacity: 0,
                              '&:hover': { opacity: 1 },
                              transition: 'opacity 0.3s',
                            }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon fontSize="small" />}
                              onClick={() => {
                                setImageToDelete(index);
                                setDeleteDialogOpen(true);
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Upload New Image */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                  Upload New Image
                </Typography>
                <ImageUploader productId={productId} onUploadComplete={handleImageUploadSuccess} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this image? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={async () => {
              if (imageToDelete === null) return;
              
              try {
                await productService.deleteImage(productId, imageToDelete);
                // Refetch the product to get updated images
                const updatedProduct = await productService.getProduct(productId);
                setProduct(updatedProduct);
                showToast('Image deleted successfully', 'success');
              } catch (err) {
                showToast((err as Error).message || 'Failed to delete image', 'error');
              } finally {
                setDeleteDialogOpen(false);
                setImageToDelete(null);
              }
            }}
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </RouteGuard>
  );
}
