'use client';

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Product } from '@/app/dashboard/lib/types/product';
import { uploadProductImage } from '@/app/dashboard/lib/services/productService';

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
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !product) return;

    try {
      setUploading(true);
      await uploadProductImage(product.id, selectedFile);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between border-b">
        <span className="text-lg font-semibold">Quick Upload Image</span>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="mt-6">
        {product && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Upload image for: <span className="font-medium text-gray-900">{product.name}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* File Input */}
          <label
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all hover:border-blue-500 hover:bg-blue-50
              ${selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <CloudUploadIcon className="text-gray-400 w-12 h-12 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {selectedFile ? selectedFile.name : 'Click to select image'}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </label>

          {/* Preview */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
