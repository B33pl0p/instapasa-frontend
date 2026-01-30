'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { productService } from '@/app/dashboard/lib/services/productService';

interface ImageUploaderProps {
  productId: string;
  onUploadComplete: () => void;
}

interface UploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

// Image compression utility
const compressImage = async (file: File, maxWidth = 1080, maxHeight = 1080, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
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
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not a valid image file`);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    setSelectedFiles(validFiles);
    setUploadStatuses(
      validFiles.map((file) => ({
        file,
        status: 'pending',
        progress: 0,
        originalSize: file.size,
      }))
    );
  };

  const uploadSingleFile = async (file: File, index: number): Promise<void> => {
    // Update status to uploading
    setUploadStatuses((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, status: 'uploading', progress: 0 } : item
      )
    );

    try {
      console.log('Starting upload for file:', file.name, 'Original size:', (file.size / 1024).toFixed(2), 'KB');

      // Compress image before upload (Instagram optimization)
      const compressedFile = await compressImage(file, 1080, 1080, 0.85);
      console.log('Compressed to:', (compressedFile.size / 1024).toFixed(2), 'KB');
      
      // Update with compressed size
      setUploadStatuses((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, compressedSize: compressedFile.size } : item
        )
      );

      // Step 1: Get presigned URL with content type
      const presignedData = await productService.getPresignedUrl(
        productId,
        compressedFile.type
      );

      // Step 2: Upload compressed file to S3
      await productService.uploadToS3(
        presignedData.presigned_url,
        compressedFile,
        compressedFile.type,
        (p) => {
          setUploadStatuses((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, progress: p } : item
            )
          );
        }
      );

      // Step 3: Confirm upload completion with backend
      await productService.confirmImageUpload(
        productId,
        presignedData.image_url,
        presignedData.s3_key
      );

      // Update status to success
      setUploadStatuses((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'success', progress: 100 } : item
        )
      );

      console.log('Upload complete for:', file.name);
    } catch (err) {
      console.error('Upload error for', file.name, ':', err);
      setUploadStatuses((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                status: 'error',
                error: (err as Error).message || 'Upload failed',
              }
            : item
        )
      );
    }
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadSingleFile(selectedFiles[i], i);
      }

      // Call onUploadComplete after all uploads are attempted
      // The parent component will refetch to see which images were successfully uploaded
      onUploadComplete();
    } catch (err) {
      console.error('Batch upload error:', err);
      setError('Some uploads failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = () => {
    // Reset the uploader
    setSelectedFiles([]);
    setUploadStatuses([]);
    setError(null);
  };

  const allUploadsComplete = uploadStatuses.length > 0 && uploadStatuses.every((s) => s.status === 'success' || s.status === 'error');
  const anySuccess = uploadStatuses.some((s) => s.status === 'success');

  const getStatusIcon = (status: UploadStatus['status']) => {
    if (status === 'success') return <CheckCircleIcon color="success" />;
    if (status === 'error') return <ErrorIcon color="error" />;
    return null;
  };

  const getStatusColor = (status: UploadStatus['status']) => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    if (status === 'uploading') return 'primary';
    return 'default';
  };

  return (
    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc' }} />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
          id="image-upload-input"
        />
        <label htmlFor="image-upload-input" style={{ width: '100%' }}>
          <Button
            variant="contained"
            component="span"
            disabled={uploading}
            fullWidth
          >
            Select Images
          </Button>
        </label>

        {selectedFiles.length > 0 && (
          <>
            <Typography variant="body2" color="textSecondary">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </Typography>

            <List sx={{ width: '100%', maxHeight: 300, overflowY: 'auto' }}>
              {uploadStatuses.map((status, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={status.file.name}
                    secondary={
                      <>
                        {status.originalSize && status.compressedSize && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            {(status.originalSize / 1024).toFixed(1)}KB → {(status.compressedSize / 1024).toFixed(1)}KB 
                            ({Math.round((1 - status.compressedSize / status.originalSize) * 100)}% smaller)
                          </Typography>
                        )}
                        {status.status === 'uploading' && (
                          <LinearProgress
                            variant="determinate"
                            value={status.progress}
                            sx={{ mt: 1, mb: 0.5 }}
                          />
                        )}
                        {status.error && (
                          <Typography variant="caption" color="error">
                            {status.error}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status.status === 'uploading' && (
                      <Typography variant="caption" color="textSecondary">
                        {status.progress}%
                      </Typography>
                    )}
                    {getStatusIcon(status.status) ? (
                      <Chip
                        label={status.status}
                        color={getStatusColor(status.status)}
                        size="small"
                        icon={getStatusIcon(status.status)!}
                      />
                    ) : (
                      <Chip
                        label={status.status}
                        color={getStatusColor(status.status)}
                        size="small"
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>

            {!allUploadsComplete && (
              <Button
                variant="contained"
                color="success"
                onClick={handleUploadAll}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            )}

            {allUploadsComplete && anySuccess && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleComplete}
                fullWidth
                sx={{ mt: 1 }}
              >
                Done
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
