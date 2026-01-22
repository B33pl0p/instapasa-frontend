import apiClient from '../apiClient';
import { Order, OrderStatus } from '../types/order';

// Quick Orders endpoints
export const listOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/dashboard/quick-orders', { params });
  return response.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await apiClient.get(`/dashboard/quick-orders/${orderId}`);
  return response.data;
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order> => {
  const response = await apiClient.get(`/dashboard/orders/order-number/${orderNumber}`);
  return response.data;
};

export const updateOrderDetails = async (
  orderId: string,
  details: {
    customer_name?: string;
    shipping_address?: string;
    phone?: string;
  }
): Promise<Order> => {
  const response = await apiClient.put(`/dashboard/quick-orders/${orderId}/details`, null, {
    params: details,
  });
  return response.data;
};

// Order Management endpoints
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const response = await apiClient.put(`/dashboard/orders/${orderId}/status`, { status });
  return response.data;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const response = await apiClient.post(`/dashboard/orders/${orderId}/cancel`);
  return response.data;
};
