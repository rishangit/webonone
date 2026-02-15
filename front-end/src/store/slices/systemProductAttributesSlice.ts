import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemProductAttribute, CreateSystemProductAttributeData, UpdateSystemProductAttributeData, PaginationMeta } from '../../services/systemProductAttributes';

interface SystemProductAttributesState {
  systemProductAttributes: SystemProductAttribute[];
  currentSystemProductAttribute: SystemProductAttribute | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: SystemProductAttributesState = {
  systemProductAttributes: [],
  currentSystemProductAttribute: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const systemProductAttributesSlice = createSlice({
  name: 'systemProductAttributes',
  initialState,
  reducers: {
    // Fetch system product attributes
    fetchSystemProductAttributesRequest: (state, action: PayloadAction<{
      isActive?: boolean;
      valueDataType?: string;
      limit?: number;
      offset?: number;
      page?: number;
      search?: string;
    } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemProductAttributesSuccess: (state, action: PayloadAction<{ attributes: SystemProductAttribute[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.systemProductAttributes = action.payload.attributes;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchSystemProductAttributesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single system product attribute
    fetchSystemProductAttributeRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemProductAttributeSuccess: (state, action: PayloadAction<SystemProductAttribute>) => {
      state.loading = false;
      state.currentSystemProductAttribute = action.payload;
      state.error = null;
    },
    fetchSystemProductAttributeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create system product attribute
    createSystemProductAttributeRequest: (state, action: PayloadAction<CreateSystemProductAttributeData>) => {
      state.loading = true;
      state.error = null;
    },
    createSystemProductAttributeSuccess: (state, action: PayloadAction<SystemProductAttribute>) => {
      state.loading = false;
      state.systemProductAttributes.push(action.payload);
      state.error = null;
    },
    createSystemProductAttributeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update system product attribute
    updateSystemProductAttributeRequest: (state, action: PayloadAction<{ id: string; data: UpdateSystemProductAttributeData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSystemProductAttributeSuccess: (state, action: PayloadAction<SystemProductAttribute>) => {
      state.loading = false;
      const index = state.systemProductAttributes.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.systemProductAttributes[index] = action.payload;
      }
      if (state.currentSystemProductAttribute?.id === action.payload.id) {
        state.currentSystemProductAttribute = action.payload;
      }
      state.error = null;
    },
    updateSystemProductAttributeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete system product attribute
    deleteSystemProductAttributeRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSystemProductAttributeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.systemProductAttributes = state.systemProductAttributes.filter(a => a.id !== action.payload);
      if (state.currentSystemProductAttribute?.id === action.payload) {
        state.currentSystemProductAttribute = null;
      }
      state.error = null;
    },
    deleteSystemProductAttributeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current system product attribute
    clearCurrentSystemProductAttribute: (state) => {
      state.currentSystemProductAttribute = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetSystemProductAttributes: () => {
      return initialState;
    },
  },
});

export const {
  fetchSystemProductAttributesRequest,
  fetchSystemProductAttributesSuccess,
  fetchSystemProductAttributesFailure,
  fetchSystemProductAttributeRequest,
  fetchSystemProductAttributeSuccess,
  fetchSystemProductAttributeFailure,
  createSystemProductAttributeRequest,
  createSystemProductAttributeSuccess,
  createSystemProductAttributeFailure,
  updateSystemProductAttributeRequest,
  updateSystemProductAttributeSuccess,
  updateSystemProductAttributeFailure,
  deleteSystemProductAttributeRequest,
  deleteSystemProductAttributeSuccess,
  deleteSystemProductAttributeFailure,
  clearCurrentSystemProductAttribute,
  clearError,
  resetSystemProductAttributes,
} = systemProductAttributesSlice.actions;

export default systemProductAttributesSlice.reducer;
