import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, CreateProductData, UpdateProductData, PaginationMeta } from '../../services/products';

interface SystemProductsState {
  systemProducts: Product[];
  currentSystemProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: SystemProductsState = {
  systemProducts: [],
  currentSystemProduct: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const systemProductsSlice = createSlice({
  name: 'systemProducts',
  initialState,
  reducers: {
    // Fetch system products
    fetchSystemProductsRequest: (state, action: PayloadAction<{
      isActive?: boolean;
      categoryId?: number;
      subcategoryId?: number;
      limit?: number;
      offset?: number;
      page?: number;
      search?: string;
      isVerified?: boolean;
      tagIds?: string[];
    } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemProductsSuccess: (state, action: PayloadAction<{ products: Product[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.systemProducts = action.payload.products;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchSystemProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single system product
    fetchSystemProductRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.currentSystemProduct = action.payload;
      state.error = null;
    },
    fetchSystemProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create system product
    createSystemProductRequest: (state, action: PayloadAction<CreateProductData>) => {
      state.loading = true;
      state.error = null;
    },
    createSystemProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.systemProducts.push(action.payload);
      state.error = null;
    },
    createSystemProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update system product
    updateSystemProductRequest: (state, action: PayloadAction<{ id: string; data: UpdateProductData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSystemProductSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      const index = state.systemProducts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.systemProducts[index] = action.payload;
      }
      if (state.currentSystemProduct?.id === action.payload.id) {
        state.currentSystemProduct = action.payload;
      }
      state.error = null;
    },
    updateSystemProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete system product
    deleteSystemProductRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSystemProductSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.systemProducts = state.systemProducts.filter(p => p.id !== action.payload);
      if (state.currentSystemProduct?.id === action.payload) {
        state.currentSystemProduct = null;
      }
      state.error = null;
    },
    deleteSystemProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current system product
    clearCurrentSystemProduct: (state) => {
      state.currentSystemProduct = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetSystemProducts: () => {
      return initialState;
    },
  },
});

export const {
  fetchSystemProductsRequest,
  fetchSystemProductsSuccess,
  fetchSystemProductsFailure,
  fetchSystemProductRequest,
  fetchSystemProductSuccess,
  fetchSystemProductFailure,
  createSystemProductRequest,
  createSystemProductSuccess,
  createSystemProductFailure,
  updateSystemProductRequest,
  updateSystemProductSuccess,
  updateSystemProductFailure,
  deleteSystemProductRequest,
  deleteSystemProductSuccess,
  deleteSystemProductFailure,
  clearCurrentSystemProduct,
  clearError,
  resetSystemProducts,
} = systemProductsSlice.actions;

export default systemProductsSlice.reducer;

