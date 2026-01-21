'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Box,
  Skeleton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { Product } from '@/app/dashboard/lib/types/product';

interface ProductTableProps {
  products?: Product[];
  selectedItems: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onImages: (id: string) => void;
  loading: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products = [],
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEdit,
  onDelete,
  onImages,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box>
        {isMobile ? (
          <Grid container spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Grid key={`skeleton-${i}`} size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer>
            <Table>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No products found
        </Typography>
      </Box>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid key={product.id} size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox
                    checked={selectedItems.includes(product.id)}
                    onChange={() => onSelectItem(product.id)}
                    size="small"
                  />
                  <Typography variant="h6" sx={{ ml: 1, flex: 1, wordBreak: 'break-word' }}>
                    {product.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  ${product.price ?? 'N/A'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    padding: '4px 8px',
                    backgroundColor: product.is_active ? '#e8f5e9' : '#ffebee',
                    borderRadius: '4px',
                    display: 'inline-block',
                    color: product.is_active ? '#2e7d32' : '#c62828',
                  }}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={() => onImages(product.id)} title="Images">
                  <ImageIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onEdit(product.id)} title="Edit">
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(product.id)} title="Delete" color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Desktop/Tablet Table View
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedItems.length > 0 && selectedItems.length < products.length
                }
                checked={selectedItems.length === products.length && products.length > 0}
                onChange={onSelectAll}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            {!isTablet && <TableCell align="right">Price</TableCell>}
            {!isTablet && <TableCell>Category</TableCell>}
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              sx={{
                '&:hover': { backgroundColor: '#f9f9f9' },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.includes(product.id)}
                  onChange={() => onSelectItem(product.id)}
                />
              </TableCell>
              <TableCell sx={{ maxWidth: isTablet ? '150px' : 'auto', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.name}
              </TableCell>
              {!isTablet && <TableCell align="right">Rs. {product.price ?? 'N/A'}</TableCell>}
              {!isTablet && <TableCell>{product.category ?? '-'}</TableCell>}
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    padding: '4px 8px',
                    backgroundColor: product.is_active ? '#e8f5e9' : '#ffebee',
                    borderRadius: '4px',
                    color: product.is_active ? '#2e7d32' : '#c62828',
                    display: 'inline-block',
                  }}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => onImages(product.id)}
                    title="Manage Images"
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(product.id)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(product.id)}
                    color="error"
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
