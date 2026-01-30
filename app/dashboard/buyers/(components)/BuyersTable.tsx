'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/navigation';
import type { Buyer } from '@/app/dashboard/lib/types/buyer';

interface BuyersTableProps {
  buyers: Buyer[];
  onBuyerClick: (buyerId: string) => void;
}

export default function BuyersTable({ buyers, onBuyerClick }: BuyersTableProps) {
  const router = useRouter();

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

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (buyers.length === 0) {
    return (
      <Paper sx={{ py: 8, textAlign: 'center', backgroundColor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No buyers found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your filters or search query
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700 }}>Buyer</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Orders</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Total Spent</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Last Order</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buyers.map((buyer) => (
            <TableRow
              key={buyer.buyer_id}
              hover
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
                transition: 'background-color 0.2s ease',
              }}
              onClick={() => onBuyerClick(buyer.buyer_id)}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    {buyer.buyer_username?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {buyer.buyer_username || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {buyer.customer_name || 'No name'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{buyer.phone || 'N/A'}</Typography>
              </TableCell>
              <TableCell align="right">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {buyer.total_orders}
                  </Typography>
                  {buyer.pending_orders > 0 && (
                    <Chip
                      label={`${buyer.pending_orders} pending`}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(buyer.total_spent)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: {formatCurrency(buyer.average_order_value)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={buyer.status.toUpperCase()}
                  size="small"
                  color={getStatusColor(buyer.status)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {formatRelativeDate(buyer.last_order_date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {buyer.days_since_last_order} days ago
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Profile">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyerClick(buyer.buyer_id);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
