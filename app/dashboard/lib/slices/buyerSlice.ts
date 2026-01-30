import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { buyerService } from '../services/buyerService';
import type {
  BuyerStats,
  Buyer,
  BuyerProfile,
  BuyerStatusFilter,
} from '../types/buyer';

interface BuyerState {
  stats: BuyerStats | null;
  buyers: Buyer[];
  currentBuyer: BuyerProfile | null;
  total: number;
  offset: number;
  limit: number;
  statusFilter: BuyerStatusFilter;
  searchQuery: string;
  loading: boolean;
  statsLoading: boolean;
  profileLoading: boolean;
  error: string | null;
}

const initialState: BuyerState = {
  stats: null,
  buyers: [],
  currentBuyer: null,
  total: 0,
  offset: 0,
  limit: 50,
  statusFilter: 'all',
  searchQuery: '',
  loading: false,
  statsLoading: false,
  profileLoading: false,
  error: null,
};

// Async thunks
export const fetchBuyerStats = createAsyncThunk(
  'buyers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await buyerService.getStats();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch buyer statistics');
    }
  }
);

export const fetchBuyers = createAsyncThunk(
  'buyers/fetchBuyers',
  async (
    params: { offset?: number; limit?: number; status?: BuyerStatusFilter; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { offset = 0, limit = 50, status = 'all', search } = params;
      return await buyerService.listBuyers(offset, limit, status, search);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch buyers');
    }
  }
);

export const fetchBuyerProfile = createAsyncThunk(
  'buyers/fetchProfile',
  async (buyerId: string, { rejectWithValue }) => {
    try {
      return await buyerService.getBuyerProfile(buyerId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch buyer profile');
    }
  }
);

export const updateBuyerTags = createAsyncThunk(
  'buyers/updateTags',
  async ({ buyerId, tags }: { buyerId: string; tags: string[] }, { rejectWithValue }) => {
    try {
      const result = await buyerService.updateTags(buyerId, tags);
      return { buyerId, tags: result.tags };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update tags');
    }
  }
);

export const updateBuyerNotes = createAsyncThunk(
  'buyers/updateNotes',
  async ({ buyerId, notes }: { buyerId: string; notes: string }, { rejectWithValue }) => {
    try {
      const result = await buyerService.updateNotes(buyerId, notes);
      return { buyerId, notes: result.notes };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update notes');
    }
  }
);

const buyerSlice = createSlice({
  name: 'buyers',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<BuyerStatusFilter>) => {
      state.statusFilter = action.payload;
      state.offset = 0;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.offset = 0;
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
    },
    clearCurrentBuyer: (state) => {
      state.currentBuyer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchBuyerStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchBuyerStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchBuyerStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      // Fetch buyers
      .addCase(fetchBuyers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuyers.fulfilled, (state, action) => {
        state.loading = false;
        state.buyers = action.payload.buyers;
        state.total = action.payload.total;
        state.offset = action.payload.offset;
        state.limit = action.payload.limit;
      })
      .addCase(fetchBuyers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch buyer profile
      .addCase(fetchBuyerProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchBuyerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentBuyer = action.payload;
      })
      .addCase(fetchBuyerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      })
      // Update tags
      .addCase(updateBuyerTags.fulfilled, (state, action) => {
        if (state.currentBuyer?.buyer_id === action.payload.buyerId) {
          state.currentBuyer.tags = action.payload.tags;
        }
        // Update in the list as well
        const buyerIndex = state.buyers.findIndex(b => b.buyer_id === action.payload.buyerId);
        if (buyerIndex !== -1) {
          state.buyers[buyerIndex].tags = action.payload.tags;
        }
      })
      // Update notes
      .addCase(updateBuyerNotes.fulfilled, (state, action) => {
        if (state.currentBuyer?.buyer_id === action.payload.buyerId) {
          state.currentBuyer.notes = action.payload.notes;
        }
      });
  },
});

export const {
  setStatusFilter,
  setSearchQuery,
  setOffset,
  clearCurrentBuyer,
  clearError,
} = buyerSlice.actions;

export default buyerSlice.reducer;
