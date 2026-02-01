'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/dashboard/lib/store';
import {
  fetchBuyerStats,
  fetchBuyers,
  fetchBuyerProfile,
  setStatusFilter,
  setSearchQuery,
  setOffset,
  clearCurrentBuyer,
} from '@/app/dashboard/lib/slices/buyerSlice';
import BuyerStatsCards from './(components)/BuyerStatsCards';
import BuyersTable from './(components)/BuyersTable';
import BuyerProfileModal from './(components)/BuyerProfileModal';
import type { BuyerStatusFilter } from '@/app/dashboard/lib/types/buyer';

export default function BuyersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    stats,
    buyers,
    currentBuyer,
    total,
    offset,
    limit,
    statusFilter,
    searchQuery,
    loading,
    statsLoading,
    profileLoading,
    error,
  } = useSelector((state: RootState) => state.buyers);

  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    dispatch(fetchBuyerStats());
  }, [dispatch]);

  // Fetch buyers when filters change
  useEffect(() => {
    dispatch(
      fetchBuyers({
        offset,
        limit,
        status: statusFilter,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, offset, limit, statusFilter, searchQuery]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      dispatch(setSearchQuery(value));
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleFilterClick = (filter: BuyerStatusFilter) => {
    dispatch(setStatusFilter(filter));
  };

  const handleBuyerClick = async (buyerId: string) => {
    await dispatch(fetchBuyerProfile(buyerId));
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    dispatch(clearCurrentBuyer());
  };

  const handleRefresh = () => {
    dispatch(fetchBuyerStats());
    dispatch(
      fetchBuyers({
        offset,
        limit,
        status: statusFilter,
        search: searchQuery || undefined,
      })
    );
  };

  const handlePageChange = (_: any, page: number) => {
    dispatch(setOffset((page - 1) * limit));
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Buyers
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                View and manage your customers
              </Typography>
              {total > 0 && (
                <Chip
                  label={`${total} ${total === 1 ? 'buyer' : 'buyers'}`}
                  size="small"
                  sx={{ height: 20, fontSize: '11px' }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || statsLoading}
          >
            Refresh
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 3 }}>
          <BuyerStatsCards stats={stats} loading={statsLoading} onFilterClick={handleFilterClick} />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => {}}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search by name, username, or phone..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
        </Stack>

        {/* Status Filters */}
        <Box sx={{ mb: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleFilterClick('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'frequent' ? 'contained' : 'outlined'}
              color={statusFilter === 'frequent' ? 'warning' : 'inherit'}
              onClick={() => handleFilterClick('frequent')}
            >
              Frequent (5+)
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'contained' : 'outlined'}
              color={statusFilter === 'new' ? 'success' : 'inherit'}
              onClick={() => handleFilterClick('new')}
            >
              New
            </Button>
            <Button
              variant={statusFilter === 'at_risk' ? 'contained' : 'outlined'}
              color={statusFilter === 'at_risk' ? 'error' : 'inherit'}
              onClick={() => handleFilterClick('at_risk')}
            >
              At Risk
            </Button>
            <Button
              variant={statusFilter === 'regular' ? 'contained' : 'outlined'}
              onClick={() => handleFilterClick('regular')}
            >
              Regular
            </Button>
          </ButtonGroup>
        </Box>

        {/* Loading State */}
        {loading ? (
          <Paper sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: 'textSecondary' }}>
              Loading buyers...
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Buyers Table */}
            <Box sx={{ mb: 3 }}>
              <BuyersTable buyers={buyers} onBuyerClick={handleBuyerClick} />
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Buyer Profile Modal */}
        <BuyerProfileModal
          buyer={currentBuyer}
          open={modalOpen}
          onClose={handleModalClose}
          loading={profileLoading}
        />
      </Container>
    </Box>
  );
}
