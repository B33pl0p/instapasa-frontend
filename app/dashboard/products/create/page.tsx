'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { createProduct } from '@/app/dashboard/lib/slices/productSlice';
import { CreateProductRequest } from '@/app/dashboard/lib/types/product';
import { productService } from '@/app/dashboard/lib/services/productService';
import LinearProgress from '@mui/material/LinearProgress';

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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setError(null);

      // Create preview URLs
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Clear input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const createdProduct = await dispatch(createProduct(formData)).unwrap();

      // Upload images if any were selected
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        const uploadErrors: string[] = [];

        for (let i = 0; i < selectedImages.length; i++) {
          try {
            const file = selectedImages[i];
            const presignedData = await productService.getPresignedUrl(createdProduct.id);
            
            if (!presignedData?.presigned_url) {
              throw new Error('Failed to get presigned URL from server');
            }

            await productService.uploadToS3(
              presignedData.presigned_url,
              file,
              (progress) => {
                setUploadProgress(Math.round((progress * (i + 1)) / selectedImages.length));
              }
            );
          } catch (err) {
            const errorMsg = (err as Error).message || `Failed to upload image ${i + 1}`;
            console.error('Image upload failed:', err);
            uploadErrors.push(errorMsg);
          }
        }

        setUploadingImages(false);
        setUploadProgress(0);

        // If there were upload errors, show them but don't block product creation
        if (uploadErrors.length > 0) {
          setError(`Product created but some images failed to upload: ${uploadErrors.join(', ')}`);
          setTimeout(() => {
            router.push('/dashboard/products');
          }, 2000);
          return;
        }
      }

      router.push('/dashboard/products');
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to create product';
      setError(errorMsg);
      console.error('Product creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Create New Product
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
                  value={formData.name}
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

              {/* Image Upload */}
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Product Images
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={loading || uploadingImages}
                    sx={{ py: 2, mb: 2 }}
                  >
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageSelect}
                      disabled={loading || uploadingImages}
                    />
                  </Button>

                  {uploadingImages && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Uploading... {uploadProgress}%
                      </Typography>
                    </Box>
                  )}

                  {imagePreviewUrls.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Selected Images ({imagePreviewUrls.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {imagePreviewUrls.map((url, index) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                paddingBottom: '100%',
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid #ddd',
                              }}
                            >
                              <Box
                                component="img"
                                src={url}
                                alt={`Preview ${index}`}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: '50%',
                                  p: 0.5,
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                                }}
                                onClick={() => removeImage(index)}
                              >
                                <ClearIcon sx={{ color: 'white', fontSize: 18 }} />
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
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
                    {loading ? 'Creating...' : 'Create Product'}
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
