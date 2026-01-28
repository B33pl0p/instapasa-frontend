'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { OrderStatus } from '../../lib/types/order';

interface StatusConfirmationModalProps {
  open: boolean;
  currentStatus: OrderStatus;
  newStatus: OrderStatus;
  orderNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusDisplayMap: Record<OrderStatus, string> = {
  pending_details: 'Pending Details',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusConfirmationModal({
  open,
  currentStatus,
  newStatus,
  orderNumber,
  onConfirm,
  onCancel,
  isLoading = false,
}: StatusConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon sx={{ color: 'warning.main' }} />
        Confirm Status Change
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            You are about to update the status of order <strong>{orderNumber}</strong>
          </Alert>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Current Status
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                {statusDisplayMap[currentStatus]}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '1.5rem' }}>→</Typography>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                New Status
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                {statusDisplayMap[newStatus]}
              </Typography>
            </Box>
          </Box>

          <Alert severity="warning">
            This action cannot be easily undone. Please make sure this is correct before confirming.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={isLoading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color="success"
        >
          {isLoading ? 'Updating...' : 'Confirm Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
