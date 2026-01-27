import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppointmentHistoryItem } from '../../services/appointmentHistory';
import { PaginationMeta } from '../../services/companySales';

interface AppointmentHistoryState {
  history: AppointmentHistoryItem[];
  loading: boolean;
  error: string | null;
  currentUserHistory: AppointmentHistoryItem[];
  currentUserHistoryLoading: boolean;
  currentUserHistoryError: string | null;
  pagination: PaginationMeta | null;
}

const initialState: AppointmentHistoryState = {
  history: [],
  loading: false,
  error: null,
  currentUserHistory: [],
  currentUserHistoryLoading: false,
  currentUserHistoryError: null,
  pagination: null,
};

const appointmentHistorySlice = createSlice({
  name: 'appointmentHistory',
  initialState,
  reducers: {
    fetchAppointmentHistoryRequest: (state, action: PayloadAction<{
      page?: number;
      limit?: number;
      offset?: number;
      search?: string;
      userId?: string;
      companyId?: string;
      serviceId?: string;
      staffId?: string;
      dateFrom?: string;
      dateTo?: string;
      enrich?: boolean;
    }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentHistorySuccess: (state, action: PayloadAction<{ history: AppointmentHistoryItem[]; pagination?: PaginationMeta } | AppointmentHistoryItem[]>) => {
      state.loading = false;
      // Handle both paginated and non-paginated responses
      if (Array.isArray(action.payload)) {
        state.history = action.payload;
        state.pagination = null;
      } else {
        state.history = action.payload.history;
        state.pagination = action.payload.pagination || null;
      }
      state.error = null;
    },
    fetchAppointmentHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUserAppointmentHistoryRequest: (state, action: PayloadAction<{ userId: string; companyId?: string }>) => {
      state.currentUserHistoryLoading = true;
      state.currentUserHistoryError = null;
    },
    fetchUserAppointmentHistorySuccess: (state, action: PayloadAction<AppointmentHistoryItem[]>) => {
      state.currentUserHistoryLoading = false;
      state.currentUserHistory = action.payload;
      state.currentUserHistoryError = null;
    },
    fetchUserAppointmentHistoryFailure: (state, action: PayloadAction<string>) => {
      state.currentUserHistoryLoading = false;
      state.currentUserHistoryError = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.currentUserHistoryError = null;
    },
  },
});

export const {
  fetchAppointmentHistoryRequest,
  fetchAppointmentHistorySuccess,
  fetchAppointmentHistoryFailure,
  fetchUserAppointmentHistoryRequest,
  fetchUserAppointmentHistorySuccess,
  fetchUserAppointmentHistoryFailure,
  clearError,
} = appointmentHistorySlice.actions;

export default appointmentHistorySlice.reducer;

