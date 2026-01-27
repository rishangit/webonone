import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../services/companies';
import { PaginationMeta } from '../../services/products';

interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  userCompany: Company | null; // Logged-in user's company (cached)
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  userCompany: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    // Fetch companies
    fetchCompaniesRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompaniesSuccess: (state, action: PayloadAction<{ companies: Company[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.companies = action.payload.companies;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single company
    fetchCompanyRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.currentCompany = action.payload;
      state.error = null;
    },

    // Fetch user's company (logged-in user's company)
    fetchUserCompanyRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.userCompany = action.payload;
      state.error = null;
    },
    fetchUserCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create company
    createCompanyRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      state.companies.push(action.payload);
      state.error = null;
    },
    createCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update company
    updateCompanyRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    updateCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      const index = state.companies.findIndex(comp => comp.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
      if (state.currentCompany?.id === action.payload.id) {
        state.currentCompany = action.payload;
      }
      if (state.userCompany?.id === action.payload.id) {
        state.userCompany = action.payload;
      }
      state.error = null;
    },
    updateCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete company
    deleteCompanyRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteCompanySuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.companies = state.companies.filter(comp => comp.id !== action.payload);
      if (state.currentCompany?.id === action.payload) {
        state.currentCompany = null;
      }
      state.error = null;
    },
    deleteCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Approve company
    approveCompanyRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    approveCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      const index = state.companies.findIndex(comp => comp.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
      if (state.currentCompany?.id === action.payload.id) {
        state.currentCompany = action.payload;
      }
      if (state.userCompany?.id === action.payload.id) {
        state.userCompany = action.payload;
      }
      state.error = null;
    },
    approveCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Reject company
    rejectCompanyRequest: (state, action: PayloadAction<{ id: string; reason?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    rejectCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.loading = false;
      const index = state.companies.findIndex(comp => comp.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
      if (state.currentCompany?.id === action.payload.id) {
        state.currentCompany = action.payload;
      }
      if (state.userCompany?.id === action.payload.id) {
        state.userCompany = action.payload;
      }
      state.error = null;
    },
    rejectCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current company
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
    },

    // Clear user company (on logout)
    clearUserCompany: (state) => {
      state.userCompany = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetCompanies: () => {
      return initialState;
    },
  },
});

export const {
  fetchCompaniesRequest,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  fetchCompanyRequest,
  fetchCompanySuccess,
  fetchCompanyFailure,
  fetchUserCompanyRequest,
  fetchUserCompanySuccess,
  fetchUserCompanyFailure,
  createCompanyRequest,
  createCompanySuccess,
  createCompanyFailure,
  updateCompanyRequest,
  updateCompanySuccess,
  updateCompanyFailure,
  deleteCompanyRequest,
  deleteCompanySuccess,
  deleteCompanyFailure,
  approveCompanyRequest,
  approveCompanySuccess,
  approveCompanyFailure,
  rejectCompanyRequest,
  rejectCompanySuccess,
  rejectCompanyFailure,
  clearCurrentCompany,
  clearUserCompany,
  clearError,
  resetCompanies,
} = companiesSlice.actions;

export default companiesSlice.reducer;

