import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../types/order';
import * as orderService from '../services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  statusFilter: OrderStatus | 'all';
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  statusFilter: 'all',
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (status?: OrderStatus) => {
    return await orderService.listOrders(status);
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string) => {
    return await orderService.getOrderById(orderId);
  }
);

export const updateOrderDetails = createAsyncThunk(
  'orders/updateOrderDetails',
  async ({
    orderId,
    details,
  }: {
    orderId: string;
    details: { customer_name?: string; shipping_address?: string; phone?: string };
  }) => {
    return await orderService.updateOrderDetails(orderId, details);
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    return await orderService.updateOrderStatus(orderId, status);
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string) => {
    return await orderService.cancelOrder(orderId);
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<OrderStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order';
      })
      // Update order details
      .addCase(updateOrderDetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  },
});

export const { setStatusFilter, clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
