import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';

interface BusinessConfigState {
  payment_qr_codes: string[];
  business_description: string | null;
  support_email: string | null;
  support_phone: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: BusinessConfigState = {
  payment_qr_codes: [],
  business_description: null,
  support_email: null,
  support_phone: null,
  loading: false,
  error: null,
};

export const fetchBusinessConfig = createAsyncThunk(
  'businessConfig/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/dashboard/business-config');
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to fetch business config');
    }
  }
);

const businessConfigSlice = createSlice({
  name: 'businessConfig',
  initialState,
  reducers: {
    clearBusinessConfig: (state) => {
      state.payment_qr_codes = [];
      state.business_description = null;
      state.support_email = null;
      state.support_phone = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.payment_qr_codes = action.payload.payment_qr_codes || [];
        state.business_description = action.payload.business_description || null;
        state.support_email = action.payload.support_email || null;
        state.support_phone = action.payload.support_phone || null;
      })
      .addCase(fetchBusinessConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Don't fail silently - just leave it empty
        state.payment_qr_codes = [];
      });
  },
});

export const { clearBusinessConfig } = businessConfigSlice.actions;
export default businessConfigSlice.reducer;
