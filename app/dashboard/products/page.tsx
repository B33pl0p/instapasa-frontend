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
    <div className="p-6">
      {/* Active User Display */}
      {(email || business_name) && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
          <h2 className="text-lg font-semibold text-gray-900">
            {business_name || email}
          </h2>
          {business_name && email && (
            <p className="text-sm text-gray-600">{email}</p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/products/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AddIcon fontSize="small" />
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex justify-between items-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => dispatch(clearError())}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <ProductFilterComponent filters={filters} onFilterChange={handleFilterChange} />

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex justify-between items-center">
          <p className="text-blue-800">{selectedItems.length} item(s) selected</p>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <DeleteIcon fontSize="small" />
            Delete ({selectedItems.length})
          </button>
        </div>
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
        <div className="fixed bottom-4 right-4 min-w-[300px] p-4 bg-white border-l-4 rounded-lg shadow-lg z-50"
          style={{
            borderLeftColor: showNotification.type === 'success' ? '#10b981' : '#ef4444'
          }}
        >
          <div className="flex justify-between items-center">
            <p className={showNotification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {showNotification.message}
            </p>
            <button
              onClick={() => setShowNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
