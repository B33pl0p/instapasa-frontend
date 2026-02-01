'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  ButtonGroup,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import type { AppDispatch, RootState } from '@/app/dashboard/lib/store';
import {
  fetchProducts,
  deleteProduct,
  deleteMultipleProducts,
  setCurrentPage,
  setFilters,
  toggleSelectItem,
  selectAllItems,
  clearSelection,
  clearError,
  setItems,
} from '@/app/dashboard/lib/slices/productSlice';
import { ModernProductTable } from './(components)/ModernProductTable';
import { QuickUploadModal } from './(components)/QuickUploadModal';
import { ProductFilterComponent } from './(components)/ProductFilters';
import { ProductPagination } from './(components)/ProductPagination';
import { ConfirmDialog } from './(components)/ConfirmDialog';
import { Product } from '@/app/dashboard/lib/types/product';
import { productService } from '@/app/dashboard/lib/services/productService';

export default function ProductPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    items,
    totalCount,
    currentPage,
    pageSize,
    filters,
    loading,
    error,
    selectedItems,
  } = useSelector((state: RootState) => state.products);

  const { email, business_name } = useSelector((state: RootState) => state.customer);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [quickUploadOpen, setQuickUploadOpen] = useState(false);
  const [quickUploadProduct, setQuickUploadProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'low-stock'>('all');

  // Fetch products on mount and when filters/page/viewMode changes
  useEffect(() => {
    const fetchData = async () => {
      if (viewMode === 'active') {
        // Apply filters to active products
        const activeFilters = { ...filters, is_active: true };
        void dispatch(
          fetchProducts({ page: currentPage, pageSize, filters: activeFilters })
        );
      } else if (viewMode === 'low-stock') {
        try {
          const products = await productService.getLowStockProducts(
            (currentPage - 1) * pageSize,
            pageSize
          );
          dispatch(setItems({ items: products, total: products.length }));
        } catch (error) {
          console.error('Failed to fetch low stock products:', error);
        }
      } else {
        // Normal fetch with filters
        void dispatch(
          fetchProducts({ page: currentPage, pageSize, filters })
        );
      }
    };

    void fetchData();
  }, [dispatch, currentPage, pageSize, filters, viewMode]);

  // Reset page and clear selections when view mode changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
    dispatch(clearSelection());
  }, [viewMode, dispatch]);

  const handleDeleteProduct = (id: string) => {
    setDeleteItemId(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await dispatch(deleteProduct(deleteItemId)).unwrap();
      setShowNotification({
        type: 'success',
        message: 'Product deleted successfully',
      });
      setConfirmDelete(false);
      setDeleteItemId(null);
    } catch {
      setShowNotification({
        type: 'error',
        message: 'Failed to delete product',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setDeleteItemId(null);
    setConfirmDelete(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await dispatch(deleteMultipleProducts(selectedItems)).unwrap();
      setShowNotification({
        type: 'success',
        message: `${selectedItems.length} product(s) deleted successfully`,
      });
      dispatch(clearSelection());
      setConfirmDelete(false);
    } catch {
      setShowNotification({
        type: 'error',
        message: 'Failed to delete products',
      });
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
    dispatch(clearSelection());
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleQuickUpload = (id: string) => {
    const product = items.find((p) => p.id === id);
    if (product) {
      setQuickUploadProduct(product);
      setQuickUploadOpen(true);
    }
  };

  const handleQuickUploadSuccess = async () => {
    // Refetch based on current view mode
    if (viewMode === 'active') {
      const activeFilters = { ...filters, is_active: true };
      await dispatch(fetchProducts({ page: currentPage, pageSize, filters: activeFilters }));
    } else if (viewMode === 'low-stock') {
      try {
        const products = await productService.getLowStockProducts(
          (currentPage - 1) * pageSize,
          pageSize
        );
        dispatch(setItems({ items: products, total: products.length }));
      } catch (error) {
        console.error('Failed to fetch low stock products:', error);
      }
    } else {
      await dispatch(fetchProducts({ page: currentPage, pageSize, filters }));
    }
    setShowNotification({
      type: 'success',
      message: 'Image uploaded successfully',
    });
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Products
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Manage your product catalog
              </Typography>
              {totalCount > 0 && (
                <Chip
                  label={`${totalCount} ${totalCount === 1 ? 'product' : 'products'}`}
                  size="small"
                  sx={{ height: 20, fontSize: '11px' }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/products/create')}
          >
            Add Product
          </Button>
        </Box>

        {/* Filter View Buttons */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button
            variant={viewMode === 'all' ? 'contained' : 'outlined'}
            color={viewMode === 'all' ? 'primary' : 'inherit'}
            onClick={() => setViewMode('all')}
            size="small"
          >
            All Products
          </Button>
          <Button
            variant={viewMode === 'active' ? 'contained' : 'outlined'}
            color={viewMode === 'active' ? 'success' : 'inherit'}
            onClick={() => setViewMode('active')}
            size="small"
          >
            Active
          </Button>
          <Button
            variant={viewMode === 'low-stock' ? 'contained' : 'outlined'}
            color={viewMode === 'low-stock' ? 'warning' : 'inherit'}
            onClick={() => setViewMode('low-stock')}
            size="small"
          >
            Low Stock
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearError())}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Success Notification */}
        {showNotification && (
          <Alert
            severity={showNotification.type}
            onClose={() => setShowNotification(null)}
            sx={{ mb: 2 }}
          >
            {showNotification.message}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ mb: 2 }}>
          <ProductFilterComponent filters={filters} onFilterChange={handleFilterChange} />
        </Box>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <Card sx={{ mb: 2, backgroundColor: 'rgba(0, 149, 246, 0.08)' }}>
            <CardContent sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1.5,
              '&:last-child': { pb: 1.5 }
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedItems.length} selected
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Product Table */}
        <Box sx={{ mb: 2 }}>
          <ModernProductTable
            products={items}
            selectedItems={selectedItems}
            onSelectItem={(id) => dispatch(toggleSelectItem(id))}
            onSelectAll={() => dispatch(selectAllItems())}
            onEdit={(id) => router.push(`/dashboard/products/${id}`)}
            onDelete={handleDeleteProduct}
            onQuickUpload={handleQuickUpload}
            loading={loading}
          />
        </Box>

        {/* Pagination */}
        <Box sx={{ mb: 3 }}>
          <ProductPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </Box>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={confirmDelete}
          title="Confirm Delete"
          message={
            deleteItemId
              ? 'Are you sure you want to delete this product?'
              : `Are you sure you want to delete ${selectedItems.length} product(s)?`
          }
          confirmText="Delete"
          onConfirm={deleteItemId ? handleConfirmDelete : handleConfirmBulkDelete}
          onCancel={() => {
            setConfirmDelete(false);
            setDeleteItemId(null);
          }}
          loading={loading}
        />

        {/* Quick Upload Modal */}
        <QuickUploadModal
          open={quickUploadOpen}
          onClose={() => {
            setQuickUploadOpen(false);
            setQuickUploadProduct(null);
          }}
          product={quickUploadProduct}
          onSuccess={handleQuickUploadSuccess}
        />

        {/* Notification Toast */}
        {showNotification && (
          <Alert
            severity={showNotification.type}
            onClose={() => setShowNotification(null)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              minWidth: 300,
              zIndex: 1000,
            }}
          >
            {showNotification.message}
          </Alert>
        )}
      </Container>
    </Box>
  );
}
