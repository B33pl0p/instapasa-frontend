'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
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
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UndoIcon from '@mui/icons-material/Undo';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchOrders, setStatusFilter, updateOrderStatus } from '../lib/slices/orderSlice';
import { OrderStatus } from '../lib/types/order';
import OrderDetailModal from './(components)/OrderDetailModal';
import StatusConfirmationModal from './(components)/StatusConfirmationModal';
import { useToast } from '../lib/components/ToastContainer';

const statusTabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Pending Details', value: 'pending_details' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancellation Requested', value: 'cancellation_requested' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'All Orders', value: 'all' },
];

const statusColorMap: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
  pending_details: 'warning',
  confirmed: 'info',
  cancellation_requested: 'error',
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>(['pending_details']);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkActionAnchor, setBulkActionAnchor] = useState<null | HTMLElement>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  }>({
    open: false,
    orderId: '',
    orderNumber: '',
    currentStatus: 'confirmed',
    newStatus: 'processing',
  });

  useEffect(() => {
    // Fetch all orders initially
    dispatch(fetchOrders(undefined));
  }, [dispatch]);

  const handleStatusFilterChange = (status: OrderStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleBulkAction = (action: 'cancel' | 'confirm' | 'processing' | 'shipped' | 'delivered') => {
    setBulkActionAnchor(null);
    
    if (selectedOrders.length === 0) {
      showToast('No orders selected', 'warning');
      return;
    }

    const statusMap: Record<string, OrderStatus> = {
      cancel: 'cancelled',
      confirm: 'confirmed',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
    };

    const newStatus = statusMap[action];
    
    // Update all selected orders
    Promise.all(
      selectedOrders.map(orderId => 
        dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap()
      )
    )
      .then(() => {
        dispatch(fetchOrders(undefined));
        showToast(`${selectedOrders.length} order(s) updated to ${newStatus}`, 'success');
        setSelectedOrders([]);
      })
      .catch(() => {
        showToast('Failed to update some orders', 'error');
      });
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

  const handleQuickStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setConfirmationModal({
      open: true,
      orderId,
      orderNumber: order.order_number,
      currentStatus: order.status,
      newStatus,
    });
  };

  const handleConfirmStatusUpdate = async () => {
    const { orderId, newStatus } = confirmationModal;
    setUpdatingOrderId(orderId);
    setConfirmationModal({ ...confirmationModal, open: false });

    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast('Failed to update order status. Please try again.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelStatusUpdate = () => {
    setConfirmationModal({ ...confirmationModal, open: false });
  };

  const handleAllowCancellation = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      // Call cancel order API which will update status to cancelled
      await dispatch(updateOrderStatus({ orderId, status: 'cancelled' })).unwrap();
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
      showToast('Cancellation request approved. Order cancelled.', 'success');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showToast('Failed to cancel order. Please try again.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDenyCancellation = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      // Deny cancellation by confirming the order
      await dispatch(updateOrderStatus({ orderId, status: 'confirmed' })).unwrap();
      const status = statusFilter === 'all' ? undefined : statusFilter;
      await dispatch(fetchOrders(status));
      showToast('Cancellation request denied. Order confirmed.', 'success');
    } catch (error) {
      console.error('Failed to deny cancellation:', error);
      showToast('Failed to update order status. Please try again.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusMap: Record<OrderStatus, OrderStatus | null> = {
      pending_details: null,
      confirmed: 'processing',
      cancellation_requested: null, // Handled by allow/deny buttons
      processing: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusMap[currentStatus];
  };

  const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusMap: Record<OrderStatus, OrderStatus | null> = {
      pending_details: null,
      confirmed: null,
      cancellation_requested: null, // Handled by allow/deny buttons
      processing: 'confirmed',
      shipped: 'processing',
      delivered: 'shipped',
      cancelled: null,
    };
    return statusMap[currentStatus];
  };

  const filteredOrders = orders.filter(order => {
    // Filter by selected statuses
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(order.status)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.phone?.includes(query) ||
        order.buyer_instagram_username?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const allSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;
  const someSelected = selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Left Sidebar - Filters */}
      <Paper
        sx={{
          width: 280,
          flexShrink: 0,
          p: 3,
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Filters
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* Status Filters */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
          Order Status
        </Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {statusTabs.filter(tab => tab.value !== 'all').map((tab) => (
            <FormControlLabel
              key={tab.value}
              control={
                <Checkbox
                  size="small"
                  checked={selectedStatuses.includes(tab.value as OrderStatus)}
                  onChange={() => handleStatusFilterChange(tab.value as OrderStatus)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{tab.label}</Typography>
                  <Chip
                    size="small"
                    label={orders.filter(o => o.status === tab.value).length}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
            />
          ))}
        </Stack>

        {selectedStatuses.length > 0 && (
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => setSelectedStatuses([])}
          >
            Clear Filters
          </Button>
        )}
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Orders
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {filteredOrders.length} {selectedStatuses.length > 0 ? 'filtered' : 'total'} orders
            </Typography>
          </Box>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                {selectedOrders.length} selected
              </Typography>
              <Button
                variant="contained"
                endIcon={<MoreVertIcon />}
                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
              >
                Bulk Actions
              </Button>
              <Menu
                anchorEl={bulkActionAnchor}
                open={Boolean(bulkActionAnchor)}
                onClose={() => setBulkActionAnchor(null)}
              >
                <MenuItem onClick={() => handleBulkAction('confirm')}>Mark as Confirmed</MenuItem>
                <MenuItem onClick={() => handleBulkAction('processing')}>Mark as Processing</MenuItem>
                <MenuItem onClick={() => handleBulkAction('shipped')}>Mark as Shipped</MenuItem>
                <MenuItem onClick={() => handleBulkAction('delivered')}>Mark as Delivered</MenuItem>
                <Divider />
                <MenuItem onClick={() => handleBulkAction('cancel')} sx={{ color: 'error.main' }}>
                  Cancel Orders
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>

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
              {searchQuery
                ? 'No orders match your search.'
                : selectedStatuses.length > 0
                ? 'No orders with selected status filters.'
                : 'Orders will appear here once customers complete checkout.'}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
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
                  <TableRow
                    key={order.id}
                    selected={selectedOrders.includes(order.id)}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleViewOrder(order.id)}
                    >
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
                      <Stack direction="column" spacing={1}>
                        {order.items.map((item, index) => (
                          <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                            {item.image_url && (
                              <Box
                                sx={{
                                  position: 'relative',
                                  width: 50,
                                  height: 50,
                                  flexShrink: 0,
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  backgroundColor: 'action.hover',
                                }}
                              >
                                <Image
                                  src={item.image_url}
                                  alt={item.product_name}
                                  fill
                                  sizes="50px"
                                  style={{ objectFit: 'cover' }}
                                />
                              </Box>
                            )}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
                                {item.product_name}
                              </Typography>
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 0.25 }}>
                                  {Object.entries(item.attributes)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(' | ')}
                                </Typography>
                              )}
                              <Typography variant="caption" color="textSecondary">
                                Qty: {item.quantity}
                              </Typography>
                            </Box>
                          </Stack>
                        ))}
                      </Stack>
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
                        {order.status === 'cancellation_requested' ? (
                          <>
                            <Tooltip title="Allow cancellation">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={updatingOrderId === order.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAllowCancellation(order.id);
                                }}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                {updatingOrderId === order.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  'Allow'
                                )}
                              </Button>
                            </Tooltip>
                            <Tooltip title="Deny cancellation">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={updatingOrderId === order.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDenyCancellation(order.id);
                                }}
                                sx={{ minWidth: 'auto', px: 1 }}
                              >
                                {updatingOrderId === order.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  'Deny'
                                )}
                              </Button>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {getPreviousStatus(order.status) && (
                              <Tooltip title="Revert to previous status">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  disabled={updatingOrderId === order.id}
                                  onClick={() => handleQuickStatusUpdate(order.id, getPreviousStatus(order.status)!)}
                                  sx={{ minWidth: 'auto', p: 0.5 }}
                                >
                                  {updatingOrderId === order.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <UndoIcon fontSize="small" />
                                  )}
                                </Button>
                              </Tooltip>
                            )}
                            {getNextStatus(order.status) && (
                              <Tooltip title="Move to next status">
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
                              </Tooltip>
                            )}
                          </>
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

        {/* Status Confirmation Modal */}
        <StatusConfirmationModal
          open={confirmationModal.open}
          currentStatus={confirmationModal.currentStatus}
          newStatus={confirmationModal.newStatus}
          orderNumber={confirmationModal.orderNumber}
          onConfirm={handleConfirmStatusUpdate}
          onCancel={handleCancelStatusUpdate}
          isLoading={updatingOrderId === confirmationModal.orderId}
        />
      </Container>
    </Box>
  );
}
