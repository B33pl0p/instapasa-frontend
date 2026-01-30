'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from 'next/image';
import { ProductVariant, Product } from '@/app/dashboard/lib/types/product';
import { productService } from '@/app/dashboard/lib/services/productService';

interface VariantImageManagerProps {
  product: Product;
  onUpdate: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export const VariantImageManager: React.FC<VariantImageManagerProps> = ({
  product,
  onUpdate,
  showToast,
}) => {
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, UploadingFile[]>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ variantId: string; imageIndex: number } | null>(null);

  if (!product.variants || product.variants.length === 0) {
    return (
      <Alert severity="info">
        This product doesn't have variants. Variant images are only available for products with multiple variants.
      </Alert>
    );
  }

  const formatVariantName = (variant: ProductVariant): string => {
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${value}`)
      .join(' - ');
  };

  const compressImage = async (file: File, maxWidth = 1080, maxHeight = 1080, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileSelect = async (variantId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} is not a valid image file`, 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} exceeds 5MB limit`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingFiles(prev => ({
      ...prev,
      [variantId]: validFiles.map(file => ({ file, progress: 0 })),
    }));

    // Upload files sequentially
    for (let i = 0; i < validFiles.length; i++) {
      try {
        const file = validFiles[i];
        
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Update progress
        setUploadingFiles(prev => ({
          ...prev,
          [variantId]: prev[variantId].map((item, idx) =>
            idx === i ? { ...item, progress: 30 } : item
          ),
        }));

        // Get presigned URL
        const presignedData = await productService.getVariantPresignedUrl(
          product.id,
          variantId,
          compressedFile.type
        );

        setUploadingFiles(prev => ({
          ...prev,
          [variantId]: prev[variantId].map((item, idx) =>
            idx === i ? { ...item, progress: 50 } : item
          ),
        }));

        // Upload to S3
        await productService.uploadToS3(
          presignedData.presigned_url,
          compressedFile,
          compressedFile.type,
          (progress) => {
            setUploadingFiles(prev => ({
              ...prev,
              [variantId]: prev[variantId]?.map((item, idx) =>
                idx === i ? { ...item, progress: 50 + progress * 0.4 } : item
              ) || [],
            }));
          }
        );

        // Confirm upload
        await productService.confirmVariantImageUpload(
          product.id,
          variantId,
          presignedData.image_url,
          presignedData.s3_key
        );

        setUploadingFiles(prev => ({
          ...prev,
          [variantId]: prev[variantId].map((item, idx) =>
            idx === i ? { ...item, progress: 100 } : item
          ),
        }));
      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => ({
          ...prev,
          [variantId]: prev[variantId].map((item, idx) =>
            idx === i ? { ...item, error: (error as Error).message } : item
          ),
        }));
      }
    }

    // Refresh product data
    setTimeout(() => {
      onUpdate();
      setUploadingFiles(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });
      showToast('Variant images uploaded successfully', 'success');
    }, 500);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      await productService.deleteVariantImage(
        product.id,
        imageToDelete.variantId,
        imageToDelete.imageIndex
      );
      onUpdate();
      showToast('Image deleted successfully', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to delete image', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload images specific to each variant. Customers will see these images when they select a particular variant.
      </Typography>

      {product.variants.map((variant) => {
        const variantName = formatVariantName(variant);
        const imageCount = variant.images?.length || 0;
        const uploading = uploadingFiles[variant.variant_id];

        return (
          <Accordion
            key={variant.variant_id}
            expanded={expandedVariant === variant.variant_id}
            onChange={(_, isExpanded) => setExpandedVariant(isExpanded ? variant.variant_id : null)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600 }}>{variantName}</Typography>
                <Chip label={`${imageCount} image${imageCount !== 1 ? 's' : ''}`} size="small" />
                <Chip label={`Stock: ${variant.stock}`} size="small" color={variant.stock > 0 ? 'success' : 'error'} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Current Images */}
              {variant.images && variant.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                    Current Images
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {variant.images.map((image, index) => (
                      <Box key={index}>
                        <Box sx={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', borderRadius: 1 }}>
                          <Image
                            src={image}
                            alt={`${variantName} image ${index + 1}`}
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
                                setImageToDelete({ variantId: variant.variant_id, imageIndex: index });
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

              {/* Upload Section */}
              <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc' }} />
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(variant.variant_id, e.target.files)}
                    style={{ display: 'none' }}
                    id={`variant-image-upload-${variant.variant_id}`}
                  />
                  <label htmlFor={`variant-image-upload-${variant.variant_id}`} style={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      component="span"
                      fullWidth
                      disabled={!!uploading}
                      startIcon={<CloudUploadIcon />}
                    >
                      Select Images for {variantName}
                    </Button>
                  </label>

                  {/* Upload Progress */}
                  {uploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      {uploading.map((item, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary">
                            {item.file.name}
                          </Typography>
                          {item.error ? (
                            <Alert severity="error" sx={{ mt: 1 }}>{item.error}</Alert>
                          ) : item.progress === 100 ? (
                            <Chip label="Complete" color="success" size="small" sx={{ mt: 1 }} />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <CircularProgress size={16} variant="determinate" value={item.progress} />
                              <Typography variant="caption">{Math.round(item.progress)}%</Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Variant Image</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this variant image? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
