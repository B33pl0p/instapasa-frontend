'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { productService } from '@/app/dashboard/lib/services/productService';

interface ImageUploaderProps {
  productId: string;
  onUploadComplete: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  onUploadComplete,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      console.log('Starting upload for product:', productId);

      // Step 1: Get presigned URL with content type
      const presignedData = await productService.getPresignedUrl(
        productId,
        selectedFile.type
      );
      console.log('Got presigned URL:', {
        hasPresignedUrl: !!presignedData.presigned_url,
        hasImageUrl: !!presignedData.image_url,
        hasS3Key: !!presignedData.s3_key,
      });

      // Step 2: Upload to S3 with matching content type
      await productService.uploadToS3(
        presignedData.presigned_url,
        selectedFile,
        selectedFile.type,
        (p) => setProgress(p)
      );
      console.log('S3 upload complete');

      // Step 3: Confirm upload completion with backend
      await productService.confirmImageUpload(
        productId,
        presignedData.image_url,
        presignedData.s3_key
      );
      console.log('Upload confirmed with backend');

      setProgress(100);
      setSelectedFile(null);
      onUploadComplete();

      // Reset after 1 second
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
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
            Select Image
          </Button>
        </label>

        {selectedFile && (
          <>
            <Typography variant="body2" color="textSecondary">
              {selectedFile.name}
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            {uploading && (
              <>
                <LinearProgress variant="determinate" value={progress} sx={{ width: '100%' }} />
                <Typography variant="caption" color="textSecondary">
                  {progress}%
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
