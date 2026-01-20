import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomerState {
  business_name: string | null;
  email: string | null;
  instagram_username: string | null;
  isLoaded: boolean;
}

const initialState: CustomerState = {
  business_name: null,
  email: null,
  instagram_username: null,
  isLoaded: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<{ business_name?: string; email?: string; instagram_username?: string }>) => {
      if (action.payload.business_name !== undefined) {
        state.business_name = action.payload.business_name;
      }
      if (action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
      if (action.payload.instagram_username !== undefined) {
        state.instagram_username = action.payload.instagram_username;
      }
      state.isLoaded = true;
    },
    clearCustomer: (state) => {
      state.business_name = null;
      state.email = null;
      state.instagram_username = null;
      state.isLoaded = false;
    },
  },
});

export const { setCustomer, clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;
