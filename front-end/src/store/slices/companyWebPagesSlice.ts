import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanyWebPage, CreateWebPageData, UpdateWebPageData } from '../../services/companyWebPages';

interface CompanyWebPagesState {
  webPages: CompanyWebPage[];
  currentWebPage: CompanyWebPage | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: CompanyWebPagesState = {
  webPages: [],
  currentWebPage: null,
  loading: false,
  error: null,
  lastFetch: null,
};

const companyWebPagesSlice = createSlice({
  name: 'companyWebPages',
  initialState,
  reducers: {
    // Fetch webpages
    fetchWebPagesRequest: (state, action: PayloadAction<{ companyId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchWebPagesSuccess: (state, action: PayloadAction<CompanyWebPage[]>) => {
      state.loading = false;
      state.webPages = action.payload;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchWebPagesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single webpage
    fetchWebPageRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchWebPageSuccess: (state, action: PayloadAction<CompanyWebPage>) => {
      state.loading = false;
      state.currentWebPage = action.payload;
      state.error = null;
    },
    fetchWebPageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create webpage
    createWebPageRequest: (state, action: PayloadAction<CreateWebPageData>) => {
      state.loading = true;
      state.error = null;
    },
    createWebPageSuccess: (state, action: PayloadAction<CompanyWebPage>) => {
      state.loading = false;
      state.webPages.push(action.payload);
      state.error = null;
    },
    createWebPageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update webpage
    updateWebPageRequest: (state, action: PayloadAction<{ id: string; data: UpdateWebPageData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateWebPageSuccess: (state, action: PayloadAction<CompanyWebPage>) => {
      state.loading = false;
      const index = state.webPages.findIndex(page => page.id === action.payload.id);
      if (index !== -1) {
        state.webPages[index] = action.payload;
      }
      if (state.currentWebPage?.id === action.payload.id) {
        state.currentWebPage = action.payload;
      }
      state.error = null;
    },
    updateWebPageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete webpage
    deleteWebPageRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteWebPageSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.webPages = state.webPages.filter(page => page.id !== action.payload);
      if (state.currentWebPage?.id === action.payload) {
        state.currentWebPage = null;
      }
      state.error = null;
    },
    deleteWebPageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current webpage
    clearCurrentWebPage: (state) => {
      state.currentWebPage = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetWebPages: () => {
      return initialState;
    },
  },
});

export const {
  fetchWebPagesRequest,
  fetchWebPagesSuccess,
  fetchWebPagesFailure,
  fetchWebPageRequest,
  fetchWebPageSuccess,
  fetchWebPageFailure,
  createWebPageRequest,
  createWebPageSuccess,
  createWebPageFailure,
  updateWebPageRequest,
  updateWebPageSuccess,
  updateWebPageFailure,
  deleteWebPageRequest,
  deleteWebPageSuccess,
  deleteWebPageFailure,
  clearCurrentWebPage,
  clearError,
  resetWebPages,
} = companyWebPagesSlice.actions;

export default companyWebPagesSlice.reducer;
