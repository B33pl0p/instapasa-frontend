'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { productService } from '@/app/dashboard/lib/services/productService';
import { Product } from '@/app/dashboard/lib/types/product';
import { ImageUploader } from '../../(components)/ImageUploader';

export default function ProductImagesPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const prod = await productService.getProduct(productId);
        setProduct(prod);
      } catch (err) {
        setError((err as Error).message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      void fetchProduct();
    }
  }, [productId]);

  const handleUploadComplete = async () => {
    // Refresh product data
    try {
      const prod = await productService.getProduct(productId);
      setProduct(prod);
    } catch (err) {
      setError((err as Error).message || 'Failed to refresh product');
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    setDeletingImageUrl(imageUrl);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingImageUrl) return;

    try {
      // TODO: Implement delete image endpoint
      // For now, just show a placeholder
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images?.filter((img) => img !== deletingImageUrl),
            }
          : null
      );
      setDeleteConfirm(false);
      setDeletingImageUrl(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            Manage Images
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {product.name}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upload New Image
          </Typography>
          <ImageUploader productId={productId} onUploadComplete={handleUploadComplete} />
        </Box>
      </Card>

      {/* Images Grid */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Images ({product.images?.length || 0})
        </Typography>

        {!product.images || product.images.length === 0 ? (
          <Card>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No images uploaded yet. Upload your first image above.
              </Typography>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {product.images.map((image, index) => (
              <Grid key={`${image.key}-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.url}
                    alt={`Product image ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteImage(image.url)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this image?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
