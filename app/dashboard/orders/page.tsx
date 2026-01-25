'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchOrders, setStatusFilter, updateOrderStatus } from '../lib/slices/orderSlice';
import { OrderStatus } from '../lib/types/order';
import OrderDetailModal from './(components)/OrderDetailModal';
import { useToast } from '../lib/components/ToastContainer';

const statusTabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending Details', value: 'pending_details' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusColorMap: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  pending_details: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();
  const { orders, loading, statusFilter } = useAppSelector((state) => state.orders);
  const instagramConversations = useAppSelector((state) => state.instagramMessages.conversations);
  const messengerConversations = useAppSelector((state) => state.messengerMessages.conversations);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const status = statusFilter === 'all' ? undefined : statusFilter;
    dispatch(fetchOrders(status));
  }, [dispatch, statusFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: OrderStatus | 'all') => {
    dispatch(setStatusFilter(newValue));
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleChatWithBuyer = (order: typeof orders[0]) => {
    const buyerId = order.buyer_id;
    if (!buyerId) {
      showToast('Buyer information not available for this order.', 'warning');
      return;
    }

    // Search in Instagram conversations
    const instagramConv = instagramConversations.find(
      (conv) => conv.buyer_id === buyerId || conv.participants.some((p) => p.id === buyerId)
    );

    if (instagramConv) {
      router.push(`/dashboard/message/instagram?conversation=${instagramConv.conversation_id}`);
      return;
    }

    // Search in Messenger conversations
    const messengerConv = messengerConversations.find(
      (conv) => conv.buyer_id === buyerId || conv.participants.some((p) => p.id === buyerId)
    );

    if (messengerConv) {
      router.push(`/dashboard/message/messenger?conversation=${messengerConv.conversation_id}`);
      return;
    }

    showToast('Conversation not found. Please sync messages first from the Messages page.', 'info');
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      // Refetch orders to update the list based on current filter
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update order status. Please try again.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusMap: Record<OrderStatus, OrderStatus | null> = {
      pending_details: null,
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusMap[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: OrderStatus): string | null => {
    const labelMap: Record<OrderStatus, string | null> = {
      pending_details: null,
      confirmed: 'Mark Processing',
      processing: 'Mark Shipped',
      shipped: 'Mark Delivered',
      delivered: null,
      cancelled: null,
    };
    return labelMap[currentStatus];
  };

  const filteredOrders = orders;
  const tabValue = statusTabs.map((t) => t.value).indexOf(statusFilter) !== -1 ? statusFilter : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Orders
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage and track your customer orders
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          {statusTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Orders Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: 'textSecondary' }}>
            Loading orders...
          </Typography>
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Paper sx={{ py: 8, textAlign: 'center', backgroundColor: 'background.paper' }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            No orders found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {statusFilter === 'all'
              ? 'Orders will appear here once customers complete checkout.'
              : `No orders with status "${statusFilter}".`}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    {order.customer_name || (
                      <Typography variant="caption" sx={{ color: 'textSecondary', fontStyle: 'italic' }}>
                        Not provided
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Rs. {order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.replace(/_/g, ' ')}
                      color={statusColorMap[order.status]}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {order.buyer_id && (
                        <Tooltip title="Chat with customer">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleChatWithBuyer(order)}
                          >
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {getNextStatus(order.status) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleQuickStatusUpdate(order.id, getNextStatus(order.status)!)}
                          sx={{ minWidth: 'auto' }}
                        >
                          {updatingOrderId === order.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={handleCloseModal} />
      )}
    </Container>
  );
}
