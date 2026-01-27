import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag, CreateTagData, UpdateTagData } from '../../services/tags';
import { PaginationMeta } from '../../services/products';

interface TagsState {
  tags: Tag[];
  currentTag: Tag | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: TagsState = {
  tags: [],
  currentTag: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    // Fetch tags
    fetchTagsRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchTagsSuccess: (state, action: PayloadAction<{ tags: Tag[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.tags = action.payload.tags;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchTagsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single tag
    fetchTagRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTagSuccess: (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      state.currentTag = action.payload;
      state.error = null;
    },
    fetchTagFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create tag
    createTagRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTagSuccess: (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      state.tags.push(action.payload);
      state.error = null;
    },
    createTagFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update tag
    updateTagRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTagSuccess: (state, action: PayloadAction<Tag>) => {
      state.loading = false;
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
      if (state.currentTag && state.currentTag.id === action.payload.id) {
        state.currentTag = action.payload;
      }
      state.error = null;
    },
    updateTagFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete tag
    deleteTagRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTagSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
      if (state.currentTag && state.currentTag.id === action.payload) {
        state.currentTag = null;
      }
      state.error = null;
    },
    deleteTagFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current tag
    clearCurrentTag: (state) => {
      state.currentTag = null;
    },

    // Clear error
    clearTagsError: (state) => {
      state.error = null;
    },

    // Reset tags state
    resetTags: () => {
      return initialState;
    },
  },
});

export const {
  fetchTagsRequest,
  fetchTagsSuccess,
  fetchTagsFailure,
  fetchTagRequest,
  fetchTagSuccess,
  fetchTagFailure,
  createTagRequest,
  createTagSuccess,
  createTagFailure,
  updateTagRequest,
  updateTagSuccess,
  updateTagFailure,
  deleteTagRequest,
  deleteTagSuccess,
  deleteTagFailure,
  clearCurrentTag,
  clearTagsError,
  resetTags,
} = tagsSlice.actions;

export default tagsSlice.reducer;

