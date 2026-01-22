'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import {
  fetchOrderById,
  updateOrderDetails,
  updateOrderStatus,
  cancelOrder,
  clearCurrentOrder,
  fetchOrders,
} from '../../lib/slices/orderSlice';
import { OrderStatus } from '../../lib/types/order';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending_details: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const { currentOrder, loading, statusFilter } = useAppSelector((state) => state.orders);

  const [customerName, setCustomerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (currentOrder) {
      setCustomerName(currentOrder.customer_name || '');
      setShippingAddress(currentOrder.shipping_address || '');
      setPhone(currentOrder.phone || '');
    }
  }, [currentOrder]);

  const handleSaveDetails = async () => {
    if (!currentOrder) return;

    setIsSavingDetails(true);
    try {
      await dispatch(
        updateOrderDetails({
          orderId: currentOrder.id,
          details: {
            customer_name: customerName || undefined,
            shipping_address: shippingAddress || undefined,
            phone: phone || undefined,
          },
        })
      ).unwrap();
      // Refetch orders to update the list
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
    } catch (error) {
      console.error('Failed to update order details:', error);
      alert('Failed to update order details. Please try again.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;

    setIsUpdatingStatus(true);
    try {
      await dispatch(
        updateOrderStatus({
          orderId: currentOrder.id,
          status: newStatus,
        })
      ).unwrap();
      // Refetch orders to update the list
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    if (!confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await dispatch(cancelOrder(currentOrder.id)).unwrap();
      // Refetch orders to update the list
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getNextStatusButton = () => {
    if (!currentOrder) return null;

    const { status } = currentOrder;

    if (status === 'delivered' || status === 'cancelled') {
      return null;
    }

    const statusMap: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
      pending_details: null,
      confirmed: { next: 'processing', label: 'Mark as Processing' },
      processing: { next: 'shipped', label: 'Mark as Shipped' },
      shipped: { next: 'delivered', label: 'Mark as Delivered' },
      delivered: null,
      cancelled: null,
    };

    const nextStatus = statusMap[status];
    if (!nextStatus) return null;

    return (
      <button
        onClick={() => handleStatusUpdate(nextStatus.next)}
        disabled={isUpdatingStatus}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdatingStatus ? 'Updating...' : nextStatus.label}
      </button>
    );
  };

  if (loading || !currentOrder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600">{currentOrder.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                statusColors[currentOrder.status]
              }`}
            >
              {currentOrder.status.replace('_', ' ').toUpperCase()}
            </span>
            <p className="text-sm text-gray-500">
              Created: {new Date(currentOrder.created_at).toLocaleString()}
            </p>
          </div>

          {/* Customer Details Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            {currentOrder.status === 'pending_details' ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    📝 Please contact the customer and fill in their details below.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter shipping address"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <button
                  onClick={handleSaveDetails}
                  disabled={isSavingDetails || (!customerName && !shippingAddress && !phone)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingDetails ? 'Saving...' : 'Save Customer Details'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Status will auto-change to &quot;Confirmed&quot; when all fields are filled
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>{' '}
                  <span className="text-sm text-gray-900">
                    {currentOrder.customer_name || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Address:</span>{' '}
                  <span className="text-sm text-gray-900">
                    {currentOrder.shipping_address || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>{' '}
                  <span className="text-sm text-gray-900">
                    {currentOrder.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 border-b pb-3 last:border-b-0">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity} × Rs. {item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rs. {(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  Rs. {currentOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {currentOrder.status !== 'cancelled' && currentOrder.status !== 'delivered' && (
              <button
                onClick={handleCancelOrder}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Order
              </button>
            )}
            {getNextStatusButton()}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
