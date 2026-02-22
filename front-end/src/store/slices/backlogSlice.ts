import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BacklogItem, CreateBacklogItemData, UpdateBacklogItemData } from '../../services/backlog';
import { PaginationMeta } from '../../services/products';

interface BacklogState {
  items: BacklogItem[];
  currentItem: BacklogItem | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: BacklogState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const backlogSlice = createSlice({
  name: 'backlog',
  initialState,
  reducers: {
    // Fetch backlog items
    fetchBacklogItemsRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchBacklogItemsSuccess: (state, action: PayloadAction<{ items: BacklogItem[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchBacklogItemsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single backlog item
    fetchBacklogItemRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBacklogItemSuccess: (state, action: PayloadAction<BacklogItem>) => {
      state.loading = false;
      state.currentItem = action.payload;
      state.error = null;
    },
    fetchBacklogItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create backlog item
    createBacklogItemRequest: (state, action: PayloadAction<CreateBacklogItemData>) => {
      state.loading = true;
      state.error = null;
    },
    createBacklogItemSuccess: (state, action: PayloadAction<BacklogItem>) => {
      state.loading = false;
      state.items.unshift(action.payload);
      state.error = null;
    },
    createBacklogItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update backlog item
    updateBacklogItemRequest: (state, action: PayloadAction<{ id: string; data: UpdateBacklogItemData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateBacklogItemSuccess: (state, action: PayloadAction<BacklogItem>) => {
      state.loading = false;
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentItem && state.currentItem.id === action.payload.id) {
        state.currentItem = action.payload;
      }
      state.error = null;
    },
    updateBacklogItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete backlog item
    deleteBacklogItemRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteBacklogItemSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.currentItem && state.currentItem.id === action.payload) {
        state.currentItem = null;
      }
      state.error = null;
    },
    deleteBacklogItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearBacklogError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchBacklogItemsRequest,
  fetchBacklogItemsSuccess,
  fetchBacklogItemsFailure,
  fetchBacklogItemRequest,
  fetchBacklogItemSuccess,
  fetchBacklogItemFailure,
  createBacklogItemRequest,
  createBacklogItemSuccess,
  createBacklogItemFailure,
  updateBacklogItemRequest,
  updateBacklogItemSuccess,
  updateBacklogItemFailure,
  deleteBacklogItemRequest,
  deleteBacklogItemSuccess,
  deleteBacklogItemFailure,
  clearBacklogError,
} = backlogSlice.actions;

export default backlogSlice.reducer;
