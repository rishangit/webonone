import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, CreateServiceData, UpdateServiceData } from '../../services/services';

import { PaginationMeta } from '../../services/services';

interface ServicesState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: ServicesState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Fetch services
    fetchServicesRequest: (state, action: PayloadAction<{ companyId: string; filters?: any }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action: PayloadAction<{ services: Service[]; pagination?: PaginationMeta } | Service[]>) => {
      state.loading = false;
      // Handle both paginated and non-paginated responses
      if (Array.isArray(action.payload)) {
        state.services = action.payload;
        state.pagination = null;
      } else {
        state.services = action.payload.services;
        state.pagination = action.payload.pagination || null;
      }
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchServicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single service
    fetchServiceRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchServiceSuccess: (state, action: PayloadAction<Service>) => {
      state.loading = false;
      state.currentService = action.payload;
      state.error = null;
    },
    fetchServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create service
    createServiceRequest: (state, action: PayloadAction<{ companyId: string; data: CreateServiceData }>) => {
      state.loading = true;
      state.error = null;
    },
    createServiceSuccess: (state, action: PayloadAction<Service>) => {
      state.loading = false;
      state.services.push(action.payload);
      state.error = null;
    },
    createServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update service
    updateServiceRequest: (state, action: PayloadAction<{ id: string; data: UpdateServiceData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateServiceSuccess: (state, action: PayloadAction<Service>) => {
      state.loading = false;
      const index = state.services.findIndex(service => service.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
      }
      if (state.currentService?.id === action.payload.id) {
        state.currentService = action.payload;
      }
      state.error = null;
    },
    updateServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete service
    deleteServiceRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteServiceSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.services = state.services.filter(service => service.id !== action.payload);
      if (state.currentService?.id === action.payload) {
        state.currentService = null;
      }
      state.error = null;
    },
    deleteServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current service
    clearCurrentService: (state) => {
      state.currentService = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetServices: () => {
      return initialState;
    },
  },
});

export const {
  fetchServicesRequest,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchServiceRequest,
  fetchServiceSuccess,
  fetchServiceFailure,
  createServiceRequest,
  createServiceSuccess,
  createServiceFailure,
  updateServiceRequest,
  updateServiceSuccess,
  updateServiceFailure,
  deleteServiceRequest,
  deleteServiceSuccess,
  deleteServiceFailure,
  clearCurrentService,
  clearError,
  resetServices,
} = servicesSlice.actions;

export default servicesSlice.reducer;















