'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Product } from '@/app/dashboard/lib/types/product';
import { ImageUploader } from './ImageUploader';

interface QuickUploadModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export const QuickUploadModal: React.FC<QuickUploadModalProps> = ({
  open,
  onClose,
  product,
  onSuccess,
}) => {
  const handleUploadComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Upload Product Images
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {product && (
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="body2">
              Upload images for: <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>{product.name}</Typography>
            </Typography>
            {product.sku && (
              <Typography variant="caption" color="textSecondary">
                SKU: {product.sku}
              </Typography>
            )}
          </Stack>
        )}

        <Box sx={{ mt: 2 }}>
          {product && (
            <ImageUploader
              productId={product.id}
              onUploadComplete={handleUploadComplete}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
