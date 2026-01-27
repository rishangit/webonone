import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanyProduct, CreateCompanyProductData, UpdateCompanyProductData, PaginationMeta } from '../../services/companyProducts';

interface CompanyProductsState {
  companyProducts: CompanyProduct[];
  currentCompanyProduct: CompanyProduct | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: CompanyProductsState = {
  companyProducts: [],
  currentCompanyProduct: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const companyProductsSlice = createSlice({
  name: 'companyProducts',
  initialState,
  reducers: {
    // Fetch company products
    fetchCompanyProductsRequest: (state, action: PayloadAction<{ companyId?: string; systemProductId?: string; filters?: any } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyProductsSuccess: (state, action: PayloadAction<{ products: CompanyProduct[]; pagination?: PaginationMeta } | CompanyProduct[]>) => {
      state.loading = false;
      // Handle both paginated and non-paginated responses
      if (Array.isArray(action.payload)) {
        state.companyProducts = action.payload;
        state.pagination = null;
      } else {
        state.companyProducts = action.payload.products;
        state.pagination = action.payload.pagination || null;
      }
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchCompanyProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single company product
    fetchCompanyProductRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyProductSuccess: (state, action: PayloadAction<CompanyProduct>) => {
      state.loading = false;
      state.currentCompanyProduct = action.payload;
      state.error = null;
    },
    fetchCompanyProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create company product
    createCompanyProductRequest: (state, action: PayloadAction<CreateCompanyProductData>) => {
      state.loading = true;
      state.error = null;
    },
    createCompanyProductSuccess: (state, action: PayloadAction<CompanyProduct>) => {
      state.loading = false;
      state.companyProducts.push(action.payload);
      state.error = null;
    },
    createCompanyProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update company product
    updateCompanyProductRequest: (state, action: PayloadAction<{ id: string; data: UpdateCompanyProductData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateCompanyProductSuccess: (state, action: PayloadAction<CompanyProduct>) => {
      state.loading = false;
      const index = state.companyProducts.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.companyProducts[index] = action.payload;
      }
      if (state.currentCompanyProduct && state.currentCompanyProduct.id === action.payload.id) {
        state.currentCompanyProduct = action.payload;
      }
      state.error = null;
    },
    updateCompanyProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete company product
    deleteCompanyProductRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteCompanyProductSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.companyProducts = state.companyProducts.filter(product => product.id !== action.payload);
      if (state.currentCompanyProduct && state.currentCompanyProduct.id === action.payload) {
        state.currentCompanyProduct = null;
      }
      state.error = null;
    },
    deleteCompanyProductFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current company product
    clearCurrentCompanyProduct: (state) => {
      state.currentCompanyProduct = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetCompanyProducts: () => {
      return initialState;
    },
  },
});

export const {
  fetchCompanyProductsRequest,
  fetchCompanyProductsSuccess,
  fetchCompanyProductsFailure,
  fetchCompanyProductRequest,
  fetchCompanyProductSuccess,
  fetchCompanyProductFailure,
  createCompanyProductRequest,
  createCompanyProductSuccess,
  createCompanyProductFailure,
  updateCompanyProductRequest,
  updateCompanyProductSuccess,
  updateCompanyProductFailure,
  deleteCompanyProductRequest,
  deleteCompanyProductSuccess,
  deleteCompanyProductFailure,
  clearCurrentCompanyProduct,
  clearError,
  resetCompanyProducts,
} = companyProductsSlice.actions;

export default companyProductsSlice.reducer;

