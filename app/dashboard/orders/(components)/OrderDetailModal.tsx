'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
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
import { useToast } from '../../lib/components/ToastContainer';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

const getStatusColor = (status: OrderStatus): 'warning' | 'info' | 'success' | 'error' => {
  const statusMap: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error'> = {
    pending_details: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
  };
  return statusMap[status];
};

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { showToast } = useToast();
  const { currentOrder, loading, statusFilter } = useAppSelector((state) => state.orders);
  const instagramConversations = useAppSelector((state) => state.instagramMessages.conversations);
  const messengerConversations = useAppSelector((state) => state.messengerMessages.conversations);

  const [customerName, setCustomerName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Validate phone number
  const validatePhone = (phoneValue: string): boolean => {
    const phoneDigits = phoneValue.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const isPhoneValid = (): boolean => {
    if (!phone.trim()) return true; // Phone is optional
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length >= 10;
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.trim()) {
      validatePhone(value);
    } else {
      setPhoneError('');
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current order data
    if (currentOrder) {
      setCustomerName(currentOrder.customer_name || '');
      setShippingAddress(currentOrder.shipping_address || '');
      setPhone(currentOrder.phone || '');
      setPhoneError('');
    }
    setIsEditingDetails(false);
  };

  const handleChatWithCustomer = () => {
    if (!currentOrder) return;

    const buyerId = currentOrder.buyer_id;
    if (!buyerId) {
      showToast('Buyer information not available for this order.', 'warning');
      return;
    }

    // Search in Instagram conversations first
    const instagramConv = instagramConversations.find(
      (conv) => conv.buyer_id === buyerId || conv.participants.some((p) => p.id === buyerId)
    );

    if (instagramConv) {
      router.push(`/dashboard/message/instagram?conversation=${instagramConv.conversation_id}`);
      onClose();
      return;
    }

    // Search in Messenger conversations
    const messengerConv = messengerConversations.find(
      (conv) => conv.buyer_id === buyerId || conv.participants.some((p) => p.id === buyerId)
    );

    if (messengerConv) {
      router.push(`/dashboard/message/messenger?conversation=${messengerConv.conversation_id}`);
      onClose();
      return;
    }

    // If conversation not found in loaded state
    showToast('Conversation not found. Please sync messages first from the Messages page.', 'info');
  };

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
      setPhoneError('');
    }
  }, [currentOrder]);

  const handleSaveDetails = async () => {
    if (!currentOrder) return;

    // Validate phone number if provided
    if (phone.trim() && !validatePhone(phone)) {
      showToast('Please enter a valid phone number with at least 10 digits', 'error');
      return;
    }

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
      showToast('Order details saved successfully', 'success');
      // Exit edit mode instead of closing modal
      setIsEditingDetails(false);
    } catch (error) {
      console.error('Failed to update order details:', error);
      showToast('Failed to update order details. Please try again.', 'error');
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
      showToast('Failed to update order status. Please try again.', 'error');
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
      showToast('Failed to cancel order. Please try again.', 'error');
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
      <Button
        onClick={() => handleStatusUpdate(nextStatus.next)}
        disabled={isUpdatingStatus}
        variant="contained"
        color="primary"
      >
        {isUpdatingStatus ? 'Updating...' : nextStatus.label}
      </Button>
    );
  };

  if (loading || !currentOrder) {
    return (
      <Dialog open={true}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, minWidth: 300 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="textSecondary">Loading order details...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Order Details
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {currentOrder.order_number}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Status Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={currentOrder.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(currentOrder.status)}
              variant="filled"
            />
            <Typography variant="caption" color="textSecondary">
              Created: {new Date(currentOrder.created_at).toLocaleString()}
            </Typography>
          </Box>

          {/* Customer Details Section */}
          <Card sx={{ backgroundColor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                  Customer Details
                </Typography>
                {currentOrder.buyer_id && (
                  <Button
                    onClick={handleChatWithCustomer}
                    startIcon={<MessageIcon />}
                    size="small"
                    variant="contained"
                    color="primary"
                  >
                    Chat with Customer
                  </Button>
                )}
              </Box>
              {currentOrder.status === 'pending_details' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="warning">
                    📝 Please contact the customer and fill in their details below.
                  </Alert>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Shipping Address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter shipping address"
                    multiline
                    rows={3}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    size="small"
                    error={!!phoneError}
                    helperText={phoneError || '(Minimum 10 digits required)'}
                    inputProps={{
                      maxLength: 20,
                    }}
                  />
                  <Button
                    onClick={handleSaveDetails}
                    disabled={
                      isSavingDetails ||
                      (!customerName && !shippingAddress && !phone) ||
                      !isPhoneValid()
                    }
                    variant="contained"
                    color="success"
                    fullWidth
                  >
                    {isSavingDetails ? 'Saving...' : 'Save Customer Details'}
                  </Button>
                  <Typography variant="caption" color="textSecondary" align="center">
                    Status will auto-change to &quot;Confirmed&quot; when all fields are filled
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {!isEditingDetails ? (
                    <>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                          Name:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {currentOrder.customer_name || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                          Address:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {currentOrder.shipping_address || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                          Phone:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {currentOrder.phone || 'Not provided'}
                        </Typography>
                      </Box>
                      <Button
                        onClick={() => setIsEditingDetails(true)}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Edit Details
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Shipping Address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter shipping address"
                        multiline
                        rows={3}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        label="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="Enter phone number"
                        size="small"
                        error={!!phoneError}
                        helperText={phoneError || '(Minimum 10 digits required)'}
                        inputProps={{
                          maxLength: 20,
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          onClick={handleSaveDetails}
                          disabled={
                            isSavingDetails ||
                            (!customerName && !shippingAddress && !phone) ||
                            !isPhoneValid()
                          }
                          variant="contained"
                          color="success"
                          fullWidth
                        >
                          {isSavingDetails ? 'Saving...' : 'Save Details'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={isSavingDetails}
                          variant="outlined"
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ backgroundColor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                Order Items
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentOrder.items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      pb: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    {item.image_url && (
                      <Box
                        component="img"
                        src={item.image_url}
                        alt={item.product_name}
                        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Quantity: {item.quantity} × Rs. {item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                      Rs. {(item.quantity * item.price).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Rs. {currentOrder.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1, p: 2 }}>
        {currentOrder.status !== 'cancelled' && currentOrder.status !== 'delivered' && (
          <Button
            onClick={handleCancelOrder}
            disabled={isUpdatingStatus}
            variant="contained"
            color="error"
          >
            Cancel Order
          </Button>
        )}
        {getNextStatusButton()}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
