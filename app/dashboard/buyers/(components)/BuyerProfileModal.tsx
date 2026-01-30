'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/app/dashboard/lib/store';
import { updateBuyerTags, updateBuyerNotes } from '@/app/dashboard/lib/slices/buyerSlice';
import { useToast } from '@/app/dashboard/lib/components/ToastContainer';
import type { BuyerProfile } from '@/app/dashboard/lib/types/buyer';

interface BuyerProfileModalProps {
  buyer: BuyerProfile | null;
  open: boolean;
  onClose: () => void;
  loading: boolean;
}

export default function BuyerProfileModal({ buyer, open, onClose, loading }: BuyerProfileModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (buyer) {
      setTags(buyer.tags || []);
      setNotes(buyer.notes || '');
    }
  }, [buyer]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      frequent: 'warning',
      new: 'success',
      at_risk: 'error',
      regular: 'default',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveTags = async () => {
    if (!buyer) return;
    try {
      await dispatch(updateBuyerTags({ buyerId: buyer.buyer_id, tags })).unwrap();
      showToast('Tags updated successfully', 'success');
      setEditingTags(false);
    } catch (error) {
      showToast('Failed to update tags', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!buyer) return;
    try {
      await dispatch(updateBuyerNotes({ buyerId: buyer.buyer_id, notes })).unwrap();
      showToast('Notes updated successfully', 'success');
      setEditingNotes(false);
    } catch (error) {
      showToast('Failed to update notes', 'error');
    }
  };

  const handleMessageBuyer = () => {
    if (buyer?.conversation_id) {
      router.push(`/dashboard/message/instagram?conversation=${buyer.conversation_id}`);
      onClose();
    }
  };

  const handleViewOrders = () => {
    if (buyer) {
      router.push(`/dashboard/orders?buyer=${encodeURIComponent(buyer.buyer_username || '')}`);
      onClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!buyer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {buyer.buyer_username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {buyer.buyer_username || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {buyer.customer_name || 'No name provided'}
              </Typography>
            </Box>
            <Chip 
              label={buyer.status.toUpperCase()} 
              color={getStatusColor(buyer.status)}
              variant="outlined"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {buyer.total_orders}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Orders
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(buyer.total_spent)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Spent
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatCurrency(buyer.average_order_value)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Avg Order
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {buyer.completed_orders}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Orders" />
          <Tab label="Contact" />
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            {/* Tags */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" fontWeight="medium">
                  Tags
                </Typography>
                <Button
                  size="small"
                  startIcon={editingTags ? <SaveIcon /> : <AddIcon />}
                  onClick={editingTags ? handleSaveTags : () => setEditingTags(true)}
                >
                  {editingTags ? 'Save' : 'Edit'}
                </Button>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={editingTags ? () => handleRemoveTag(tag) : undefined}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {editingTags && (
                  <TextField
                    size="small"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    sx={{ width: 150 }}
                  />
                )}
              </Stack>
            </Box>

            {/* Notes */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" fontWeight="medium">
                  Private Notes
                </Typography>
                <Button
                  size="small"
                  onClick={editingNotes ? handleSaveNotes : () => setEditingNotes(true)}
                  startIcon={<SaveIcon />}
                >
                  {editingNotes ? 'Save' : 'Edit'}
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!editingNotes}
                placeholder="Add private notes about this buyer..."
              />
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buyer.order_history.map((order) => (
                  <TableRow key={order.order_id} hover>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell align="right">{order.items_count}</TableCell>
                    <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{buyer.phone || 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Shipping Address
                </Typography>
                <Typography variant="body1">{buyer.shipping_address || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    First Order
                  </Typography>
                  <Typography variant="body1">{formatDate(buyer.first_order_date)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Order
                  </Typography>
                  <Typography variant="body1">{formatDate(buyer.last_order_date)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
          {buyer.conversation_id && (
            <Button
              variant="contained"
              startIcon={<ChatIcon />}
              onClick={handleMessageBuyer}
              size="large"
            >
              Message
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleViewOrders}
            size="large"
          >
            View All Orders
          </Button>
        </Box>
        <Button onClick={onClose} size="large">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
