import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CompanyProductVariant {
  id: string;
  companyProductId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  type: 'sell' | 'service' | 'both';
  isDefault: boolean;
  isActive: boolean;
  activeStockId?: string | null;
  minStock?: number;
  maxStock?: number;
  activeStock?: {
    costPrice: number;
    sellPrice?: number | null;
    quantity: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyProductVariantData {
  companyProductId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  type?: 'sell' | 'service' | 'both';
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateCompanyProductVariantData extends Partial<CreateCompanyProductVariantData> {
  companyProductId?: never; // Cannot update companyProductId
}

interface CompanyProductVariantsState {
  variants: CompanyProductVariant[];
  currentVariant: CompanyProductVariant | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: CompanyProductVariantsState = {
  variants: [],
  currentVariant: null,
  loading: false,
  error: null,
  lastFetch: null,
};

const companyProductVariantsSlice = createSlice({
  name: 'companyProductVariants',
  initialState,
  reducers: {
    // Fetch variants for a company product
    fetchCompanyProductVariantsRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyProductVariantsSuccess: (state, action: PayloadAction<CompanyProductVariant[]>) => {
      state.loading = false;
      state.variants = action.payload;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchCompanyProductVariantsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single variant
    fetchCompanyProductVariantRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyProductVariantSuccess: (state, action: PayloadAction<CompanyProductVariant>) => {
      state.loading = false;
      state.currentVariant = action.payload;
      state.error = null;
    },
    fetchCompanyProductVariantFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create variant
    createCompanyProductVariantRequest: (state, action: PayloadAction<CreateCompanyProductVariantData>) => {
      state.loading = true;
      state.error = null;
    },
    createCompanyProductVariantSuccess: (state, action: PayloadAction<CompanyProductVariant>) => {
      state.loading = false;
      state.variants.push(action.payload);
      state.error = null;
    },
    createCompanyProductVariantFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create multiple variants (bulk)
    createCompanyProductVariantsRequest: (state, action: PayloadAction<{ companyProductId: string; variants: CreateCompanyProductVariantData[] }>) => {
      state.loading = true;
      state.error = null;
    },
    createCompanyProductVariantsSuccess: (state, action: PayloadAction<CompanyProductVariant[]>) => {
      state.loading = false;
      state.variants.push(...action.payload);
      state.error = null;
    },
    createCompanyProductVariantsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update variant
    updateCompanyProductVariantRequest: (state, action: PayloadAction<{ id: string; data: UpdateCompanyProductVariantData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateCompanyProductVariantSuccess: (state, action: PayloadAction<CompanyProductVariant>) => {
      state.loading = false;
      const index = state.variants.findIndex(variant => variant.id === action.payload.id);
      if (index !== -1) {
        state.variants[index] = action.payload;
      }
      if (state.currentVariant && state.currentVariant.id === action.payload.id) {
        state.currentVariant = action.payload;
      }
      state.error = null;
    },
    updateCompanyProductVariantFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete variant
    deleteCompanyProductVariantRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteCompanyProductVariantSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.variants = state.variants.filter(variant => variant.id !== action.payload);
      if (state.currentVariant && state.currentVariant.id === action.payload) {
        state.currentVariant = null;
      }
      state.error = null;
    },
    deleteCompanyProductVariantFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current variant
    clearCurrentCompanyProductVariant: (state) => {
      state.currentVariant = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetCompanyProductVariants: () => {
      return initialState;
    },
  },
});

export const {
  fetchCompanyProductVariantsRequest,
  fetchCompanyProductVariantsSuccess,
  fetchCompanyProductVariantsFailure,
  fetchCompanyProductVariantRequest,
  fetchCompanyProductVariantSuccess,
  fetchCompanyProductVariantFailure,
  createCompanyProductVariantRequest,
  createCompanyProductVariantSuccess,
  createCompanyProductVariantFailure,
  createCompanyProductVariantsRequest,
  createCompanyProductVariantsSuccess,
  createCompanyProductVariantsFailure,
  updateCompanyProductVariantRequest,
  updateCompanyProductVariantSuccess,
  updateCompanyProductVariantFailure,
  deleteCompanyProductVariantRequest,
  deleteCompanyProductVariantSuccess,
  deleteCompanyProductVariantFailure,
  clearCurrentCompanyProductVariant,
  clearError,
  resetCompanyProductVariants,
} = companyProductVariantsSlice.actions;

export default companyProductVariantsSlice.reducer;

