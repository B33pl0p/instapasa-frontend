'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
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
} from '@/app/dashboard/lib/slices/productSlice';
import { ProductTable } from './(components)/ProductTable';
import { ProductFilterComponent } from './(components)/ProductFilters';
import { ProductPagination } from './(components)/ProductPagination';
import { ConfirmDialog } from './(components)/ConfirmDialog';

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

  // Fetch products on mount and when filters/page changes
  useEffect(() => {
    void dispatch(
      fetchProducts({ page: currentPage, pageSize, filters })
    );
  }, [dispatch, currentPage, pageSize, filters]);

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
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Active User Display */}
      {(email || business_name) && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f4ff', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
          <Typography variant="body2" color="textSecondary">
            Logged in as:
          </Typography>
          <Typography variant="h6">
            {business_name || email}
          </Typography>
          {business_name && email && (
            <Typography variant="body2" color="textSecondary">
              {email}
            </Typography>
          )}
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/dashboard/products/create')}
        >
          Add Product
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <ProductFilterComponent filters={filters} onFilterChange={handleFilterChange} />

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Alert
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Delete ({selectedItems.length})
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {selectedItems.length} item(s) selected
        </Alert>
      )}

      {/* Product Table */}
      <ProductTable
        products={items}
        selectedItems={selectedItems}
        onSelectItem={(id) => dispatch(toggleSelectItem(id))}
        onSelectAll={() => dispatch(selectAllItems())}
        onEdit={(id) => router.push(`/dashboard/products/${id}`)}
        onDelete={handleDeleteProduct}
        onImages={(id) => router.push(`/dashboard/products/${id}/images`)}
        loading={loading}
      />

      {/* Pagination */}
      <ProductPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />

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

      {/* Notification Toast */}
      {showNotification && (
        <Alert
          severity={showNotification.type}
          onClose={() => setShowNotification(null)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            minWidth: 300,
          }}
        >
          {showNotification.message}
        </Alert>
      )}
    </Container>
  );
}
