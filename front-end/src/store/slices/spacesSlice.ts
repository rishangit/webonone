import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Space, CreateSpaceData, UpdateSpaceData } from '../../services/spaces';
import { PaginationMeta } from '../../services/products';

interface SpacesState {
  spaces: Space[];
  currentSpace: Space | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: SpacesState = {
  spaces: [],
  currentSpace: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    // Fetch spaces
    fetchSpacesRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSpacesSuccess: (state, action: PayloadAction<{ spaces: Space[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.spaces = action.payload.spaces;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchSpacesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single space
    fetchSpaceRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSpaceSuccess: (state, action: PayloadAction<Space>) => {
      state.loading = false;
      state.currentSpace = action.payload;
      state.error = null;
    },
    fetchSpaceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create space
    createSpaceRequest: (state, action: PayloadAction<{ companyId: string; data: CreateSpaceData }>) => {
      state.loading = true;
      state.error = null;
    },
    createSpaceSuccess: (state, action: PayloadAction<Space>) => {
      state.loading = false;
      state.spaces.push(action.payload);
      state.error = null;
    },
    createSpaceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update space
    updateSpaceRequest: (state, action: PayloadAction<{ id: string; data: UpdateSpaceData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSpaceSuccess: (state, action: PayloadAction<Space>) => {
      state.loading = false;
      const index = state.spaces.findIndex(space => space.id === action.payload.id);
      if (index !== -1) {
        state.spaces[index] = action.payload;
      }
      if (state.currentSpace?.id === action.payload.id) {
        state.currentSpace = action.payload;
      }
      state.error = null;
    },
    updateSpaceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete space
    deleteSpaceRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSpaceSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.spaces = state.spaces.filter(space => space.id !== action.payload);
      if (state.currentSpace?.id === action.payload) {
        state.currentSpace = null;
      }
      state.error = null;
    },
    deleteSpaceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current space
    clearCurrentSpace: (state) => {
      state.currentSpace = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetSpaces: () => {
      return initialState;
    },
  },
});

export const {
  fetchSpacesRequest,
  fetchSpacesSuccess,
  fetchSpacesFailure,
  fetchSpaceRequest,
  fetchSpaceSuccess,
  fetchSpaceFailure,
  createSpaceRequest,
  createSpaceSuccess,
  createSpaceFailure,
  updateSpaceRequest,
  updateSpaceSuccess,
  updateSpaceFailure,
  deleteSpaceRequest,
  deleteSpaceSuccess,
  deleteSpaceFailure,
  clearCurrentSpace,
  clearError,
  resetSpaces,
} = spacesSlice.actions;

export default spacesSlice.reducer;

