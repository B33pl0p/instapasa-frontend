'use client';

import React, { useState } from 'react';
import { Product } from '@/app/dashboard/lib/types/product';
import Image from 'next/image';
import {
  IconButton,
  Tooltip,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Skeleton,
  Typography,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface ModernProductTableProps {
  products: Product[];
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onQuickUpload: (id: string) => void;
  loading: boolean;
}

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

export const ModernProductTable: React.FC<ModernProductTableProps> = ({
  products,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEdit,
  onDelete,
  onQuickUpload,
  loading,
}) => {
  if (loading) {
    return (
      <Paper>
        <TableContainer>
          <Table>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="rounded" width={24} height={24} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Skeleton variant="rectangular" width={64} height={64} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="80%" />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ color: 'text.secondary', mb: 2 }}>
          <ImageIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          No products found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Get started by creating your first product
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell padding="checkbox" width="5%">
              <Checkbox
                checked={selectedItems.length === products.length && products.length > 0}
                onChange={onSelectAll}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} width="30%">
              Product
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} width="15%">
              Category
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} width="12%">
              Price
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} width="12%">
              Stock
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} width="12%">
              Status
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }} width="14%">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const thumbnail = product.images?.[0];
            const categoryLabel = categoryIcons[product.category || 'general'] || 'Product';

            return (
              <TableRow
                key={product.id}
                hover
                onClick={() => onEdit(product.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.includes(product.id)}
                    onChange={() => onSelectItem(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box
                      sx={{
                        position: 'relative',
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <ImageIcon />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
                        {product.name}
                      </Typography>
                      {product.sku && (
                        <Typography variant="caption" color="textSecondary">
                          SKU: {product.sku}
                        </Typography>
                      )}
                      {product.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }} noWrap>
                          {product.description}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Chip
                      label={product.category}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.price ? `Rs. ${product.price.toFixed(2)}` : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {product.variants && product.variants.length > 0 ? (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: (product.total_stock || 0) > 10
                            ? 'success.main'
                            : (product.total_stock || 0) > 0
                            ? 'warning.main'
                            : 'error.main',
                        }}
                      >
                        {product.total_stock || 0}
                      </Typography>
                      <Chip
                        label={`${product.variants.length} variant${product.variants.length !== 1 ? 's' : ''}`}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: (product.stock || 0) > 10
                          ? 'success.main'
                          : (product.stock || 0) > 0
                          ? 'warning.main'
                          : 'error.main',
                      }}
                    >
                      {product.stock || 0}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Active' : 'Inactive'}
                    color={product.is_active ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="Quick Upload Image">
                      <IconButton
                        size="small"
                        onClick={() => onQuickUpload(product.id)}
                        color="primary"
                      >
                        <AddPhotoAlternateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(product.id)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(product.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
