'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
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
      <DialogTitle className="flex items-center justify-between border-b">
        <span className="text-lg font-semibold">Upload Product Images</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="mt-6">
        {product && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Upload images for: <span className="font-medium text-gray-900">{product.name}</span>
            </p>
            {product.sku && (
              <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
            )}
          </div>
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
