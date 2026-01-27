'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { updateProduct } from '@/app/dashboard/lib/slices/productSlice';
import { productService } from '@/app/dashboard/lib/services/productService';
import { UpdateProductRequest } from '@/app/dashboard/lib/types/product';

export default function EditProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: '',
    price: undefined,
    description: '',
    category: '',
    sku: '',
    stock: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const product = await productService.getProduct(productId);
        setFormData({
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          sku: product.sku,
          stock: product.stock,
          is_active: product.is_active,
        });
      } catch (err) {
        setError((err as Error).message || 'Failed to load product');
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      void fetchProduct();
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement;

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

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setError('Product name is required');
      return false;
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
      await dispatch(updateProduct({ productId, data: formData })).unwrap();
      router.push('/dashboard/products');
    } catch (err) {
      setError((err as Error).message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Edit Product
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Product Name */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter product name"
                />
              </Grid>

              {/* Price */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.price ?? ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="0.00"
                />
              </Grid>

              {/* Category */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter category"
                />
              </Grid>

              {/* SKU */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter product SKU"
                />
              </Grid>

              {/* Stock */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  inputProps={{ min: '0' }}
                  value={formData.stock ?? 0}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="0"
                />
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter product description"
                />
              </Grid>

              {/* Active Status */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={formData.is_active ?? true}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  }
                  label="Active"
                />
              </Grid>

              {/* Actions */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => router.push('/dashboard/products')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}