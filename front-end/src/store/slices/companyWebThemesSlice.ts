import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanyWebTheme, CreateThemeData, UpdateThemeData } from '../../services/companyWebThemes';

interface CompanyWebThemesState {
  themes: CompanyWebTheme[];
  currentTheme: CompanyWebTheme | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: CompanyWebThemesState = {
  themes: [],
  currentTheme: null,
  loading: false,
  error: null,
  lastFetch: null,
};

const companyWebThemesSlice = createSlice({
  name: 'companyWebThemes',
  initialState,
  reducers: {
    // Fetch themes
    fetchThemesRequest: (state, action: PayloadAction<{ companyId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchThemesSuccess: (state, action: PayloadAction<CompanyWebTheme[]>) => {
      state.loading = false;
      state.themes = action.payload;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchThemesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single theme
    fetchThemeRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchThemeSuccess: (state, action: PayloadAction<CompanyWebTheme>) => {
      state.loading = false;
      state.currentTheme = action.payload;
      state.error = null;
    },
    fetchThemeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create theme
    createThemeRequest: (state, action: PayloadAction<CreateThemeData>) => {
      state.loading = true;
      state.error = null;
    },
    createThemeSuccess: (state, action: PayloadAction<CompanyWebTheme>) => {
      state.loading = false;
      state.themes.push(action.payload);
      state.error = null;
    },
    createThemeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update theme
    updateThemeRequest: (state, action: PayloadAction<{ id: string; data: UpdateThemeData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateThemeSuccess: (state, action: PayloadAction<CompanyWebTheme>) => {
      state.loading = false;
      const index = state.themes.findIndex(theme => theme.id === action.payload.id);
      if (index !== -1) {
        state.themes[index] = action.payload;
      }
      if (state.currentTheme?.id === action.payload.id) {
        state.currentTheme = action.payload;
      }
      state.error = null;
    },
    updateThemeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete theme
    deleteThemeRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteThemeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.themes = state.themes.filter(theme => theme.id !== action.payload);
      if (state.currentTheme?.id === action.payload) {
        state.currentTheme = null;
      }
      state.error = null;
    },
    deleteThemeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current theme
    clearCurrentTheme: (state) => {
      state.currentTheme = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetThemes: () => {
      return initialState;
    },
  },
});

export const {
  fetchThemesRequest,
  fetchThemesSuccess,
  fetchThemesFailure,
  fetchThemeRequest,
  fetchThemeSuccess,
  fetchThemeFailure,
  createThemeRequest,
  createThemeSuccess,
  createThemeFailure,
  updateThemeRequest,
  updateThemeSuccess,
  updateThemeFailure,
  deleteThemeRequest,
  deleteThemeSuccess,
  deleteThemeFailure,
  clearCurrentTheme,
  clearError,
  resetThemes,
} = companyWebThemesSlice.actions;

export default companyWebThemesSlice.reducer;
