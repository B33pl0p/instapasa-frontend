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
    <div className="p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory
            {totalCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {totalCount} {totalCount === 1 ? 'product' : 'products'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/products/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AddIcon fontSize="small" />
          Add Product
        </button>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          📦 All Products
        </button>
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'active'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          ✅ Active Only
        </button>
        <button
          onClick={() => setViewMode('low-stock')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === 'low-stock'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          ⚠️ Low Stock
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
