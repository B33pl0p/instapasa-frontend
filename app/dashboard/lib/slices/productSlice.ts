import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '@/app/dashboard/lib/services/productService';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
} from '@/app/dashboard/lib/types/product';

export interface ProductState {
  items: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  selectedItems: string[];
}

const initialState: ProductState = {
  items: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  filters: {},
  loading: false,
  error: null,
  selectedItems: [],
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    {
      page,
      pageSize,
      filters,
    }: {
      page: number;
      pageSize: number;
      filters?: ProductFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      const skip = (page - 1) * pageSize;
      const data = await productService.listProducts(skip, pageSize, filters);
      return data;
    } catch (error: unknown) {
      const err = error as Record<string, Record<string, Record<string, string>>>;
      return rejectWithValue((err?.response?.data?.detail as string) || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: CreateProductRequest, { rejectWithValue }) => {
    try {
      return await productService.createProduct(data);
    } catch (error: unknown) {
      const err = error as Record<string, Record<string, Record<string, string>>>;
      return rejectWithValue((err?.response?.data?.detail as string) || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    { productId, data }: { productId: string; data: UpdateProductRequest },
    { rejectWithValue }
  ) => {
    try {
      return await productService.updateProduct(productId, data);
    } catch (error: unknown) {
      const err = error as Record<string, Record<string, Record<string, string>>>;
      return rejectWithValue((err?.response?.data?.detail as string) || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error: unknown) {
      const err = error as Record<string, Record<string, Record<string, string>>>;
      return rejectWithValue((err?.response?.data?.detail as string) || 'Failed to delete product');
    }
  }
);

export const deleteMultipleProducts = createAsyncThunk(
  'products/deleteMultipleProducts',
  async (productIds: string[], { rejectWithValue }) => {
    try {
      await productService.deleteMultipleProducts(productIds);
      return productIds;
    } catch (error: unknown) {
      const err = error as Record<string, Record<string, Record<string, string>>>;
      return rejectWithValue((err?.response?.data?.detail as string) || 'Failed to delete products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    toggleSelectItem: (state, action: PayloadAction<string>) => {
      const index = state.selectedItems.indexOf(action.payload);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(action.payload);
      }
    },
    selectAllItems: (state) => {
      state.selectedItems = state.items.map((item) => item.id);
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index > -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.totalCount -= 1;
        state.selectedItems = state.selectedItems.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteMultipleProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMultipleProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => !action.payload.includes(item.id)
        );
        state.totalCount -= action.payload.length;
        state.selectedItems = [];
      })
      .addCase(deleteMultipleProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentPage,
  setFilters,
  toggleSelectItem,
  selectAllItems,
  clearSelection,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;
