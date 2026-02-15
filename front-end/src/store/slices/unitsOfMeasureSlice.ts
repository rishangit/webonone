import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnitsOfMeasure, CreateUnitsOfMeasureData, UpdateUnitsOfMeasureData, PaginationMeta } from '../../services/unitsOfMeasure';

interface UnitsOfMeasureState {
  unitsOfMeasure: UnitsOfMeasure[];
  currentUnitOfMeasure: UnitsOfMeasure | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: UnitsOfMeasureState = {
  unitsOfMeasure: [],
  currentUnitOfMeasure: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const unitsOfMeasureSlice = createSlice({
  name: 'unitsOfMeasure',
  initialState,
  reducers: {
    // Fetch units of measure
    fetchUnitsOfMeasureRequest: (state, action: PayloadAction<{
      isActive?: boolean;
      limit?: number;
      offset?: number;
      page?: number;
      search?: string;
    } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUnitsOfMeasureSuccess: (state, action: PayloadAction<{ units: UnitsOfMeasure[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.unitsOfMeasure = action.payload.units;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchUnitsOfMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single unit of measure
    fetchUnitOfMeasureRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUnitOfMeasureSuccess: (state, action: PayloadAction<UnitsOfMeasure>) => {
      state.loading = false;
      state.currentUnitOfMeasure = action.payload;
      state.error = null;
    },
    fetchUnitOfMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create unit of measure
    createUnitOfMeasureRequest: (state, action: PayloadAction<CreateUnitsOfMeasureData>) => {
      state.loading = true;
      state.error = null;
    },
    createUnitOfMeasureSuccess: (state, action: PayloadAction<UnitsOfMeasure>) => {
      state.loading = false;
      state.unitsOfMeasure.push(action.payload);
      state.error = null;
    },
    createUnitOfMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update unit of measure
    updateUnitOfMeasureRequest: (state, action: PayloadAction<{ id: string; data: UpdateUnitsOfMeasureData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateUnitOfMeasureSuccess: (state, action: PayloadAction<UnitsOfMeasure>) => {
      state.loading = false;
      const index = state.unitsOfMeasure.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.unitsOfMeasure[index] = action.payload;
      }
      if (state.currentUnitOfMeasure?.id === action.payload.id) {
        state.currentUnitOfMeasure = action.payload;
      }
      state.error = null;
    },
    updateUnitOfMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete unit of measure
    deleteUnitOfMeasureRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteUnitOfMeasureSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.unitsOfMeasure = state.unitsOfMeasure.filter(u => u.id !== action.payload);
      if (state.currentUnitOfMeasure?.id === action.payload) {
        state.currentUnitOfMeasure = null;
      }
      state.error = null;
    },
    deleteUnitOfMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current unit of measure
    clearCurrentUnitOfMeasure: (state) => {
      state.currentUnitOfMeasure = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetUnitsOfMeasure: () => {
      return initialState;
    },
  },
});

export const {
  fetchUnitsOfMeasureRequest,
  fetchUnitsOfMeasureSuccess,
  fetchUnitsOfMeasureFailure,
  fetchUnitOfMeasureRequest,
  fetchUnitOfMeasureSuccess,
  fetchUnitOfMeasureFailure,
  createUnitOfMeasureRequest,
  createUnitOfMeasureSuccess,
  createUnitOfMeasureFailure,
  updateUnitOfMeasureRequest,
  updateUnitOfMeasureSuccess,
  updateUnitOfMeasureFailure,
  deleteUnitOfMeasureRequest,
  deleteUnitOfMeasureSuccess,
  deleteUnitOfMeasureFailure,
  clearCurrentUnitOfMeasure,
  clearError,
  resetUnitsOfMeasure,
} = unitsOfMeasureSlice.actions;

export default unitsOfMeasureSlice.reducer;
