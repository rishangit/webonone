import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CreateSystemServiceData,
  FetchSystemServicesFilters,
  SystemService,
  UpdateSystemServiceData,
} from "@/features/services/services/systemServices";
import type { PaginationMeta } from "@/features/services/services";

interface SystemServicesState {
  services: SystemService[];
  currentService: SystemService | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}

const initialState: SystemServicesState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  pagination: null,
};

const systemServicesSlice = createSlice({
  name: "systemServices",
  initialState,
  reducers: {
    fetchSystemServicesRequest: (state, _action: PayloadAction<FetchSystemServicesFilters | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemServicesSuccess: (
      state,
      action: PayloadAction<{ services: SystemService[]; pagination: PaginationMeta }>
    ) => {
      state.loading = false;
      state.services = action.payload.services;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchSystemServicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSystemServiceRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSystemServiceSuccess: (state, action: PayloadAction<SystemService>) => {
      state.loading = false;
      state.currentService = action.payload;
      state.error = null;
    },
    fetchSystemServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createSystemServiceRequest: (state, _action: PayloadAction<CreateSystemServiceData>) => {
      state.loading = true;
      state.error = null;
    },
    createSystemServiceSuccess: (state, action: PayloadAction<SystemService>) => {
      state.loading = false;
      state.services.unshift(action.payload);
      state.error = null;
    },
    createSystemServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSystemServiceRequest: (state, _action: PayloadAction<{ id: string; data: UpdateSystemServiceData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSystemServiceSuccess: (state, action: PayloadAction<SystemService>) => {
      state.loading = false;
      state.error = null;
      const idx = state.services.findIndex((service) => service.id === action.payload.id);
      if (idx !== -1) {
        state.services[idx] = action.payload;
      }
      if (state.currentService?.id === action.payload.id) {
        state.currentService = action.payload;
      }
    },
    updateSystemServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSystemServiceRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSystemServiceSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = null;
      state.services = state.services.filter((service) => service.id !== action.payload);
      if (state.currentService?.id === action.payload) {
        state.currentService = null;
      }
    },
    deleteSystemServiceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearSystemServicesError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSystemServicesRequest,
  fetchSystemServicesSuccess,
  fetchSystemServicesFailure,
  fetchSystemServiceRequest,
  fetchSystemServiceSuccess,
  fetchSystemServiceFailure,
  createSystemServiceRequest,
  createSystemServiceSuccess,
  createSystemServiceFailure,
  updateSystemServiceRequest,
  updateSystemServiceSuccess,
  updateSystemServiceFailure,
  deleteSystemServiceRequest,
  deleteSystemServiceSuccess,
  deleteSystemServiceFailure,
  clearSystemServicesError,
} = systemServicesSlice.actions;

export default systemServicesSlice.reducer;
