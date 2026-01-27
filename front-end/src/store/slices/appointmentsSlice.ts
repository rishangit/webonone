import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '../../services/appointments';
import { AppointmentStatus, AppointmentStatusType } from '../../types/appointmentStatus';
import { PaginationMeta } from '../../services/products';

interface AppointmentsState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Fetch appointments
    fetchAppointmentsRequest: (state, action: PayloadAction<{ companyId?: string; filters?: any }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action: PayloadAction<{ appointments: Appointment[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.appointments = action.payload.appointments;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchAppointmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single appointment
    fetchAppointmentRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      state.loading = false;
      state.currentAppointment = action.payload;
      state.error = null;
    },
    fetchAppointmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create appointment
    createAppointmentRequest: (state, action: PayloadAction<CreateAppointmentData>) => {
      state.loading = true;
      state.error = null;
    },
    createAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      state.loading = false;
      state.appointments.push(action.payload);
      state.error = null;
    },
    createAppointmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update appointment
    updateAppointmentRequest: (state, action: PayloadAction<{ id: string; data: UpdateAppointmentData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      state.loading = false;
      const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      if (state.currentAppointment?.id === action.payload.id) {
        state.currentAppointment = action.payload;
      }
      state.error = null;
    },
    updateAppointmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete appointment
    deleteAppointmentRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteAppointmentSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.appointments = state.appointments.filter(appointment => appointment.id !== action.payload);
      if (state.currentAppointment?.id === action.payload) {
        state.currentAppointment = null;
      }
      state.error = null;
    },
    deleteAppointmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update appointment status
    updateAppointmentStatusRequest: (state, action: PayloadAction<{ 
      id: string; 
      status: AppointmentStatusType;
      completionData?: {
        status: string;
        notes: string;
        billingItems: Array<{
          id: string;
          type: "product" | "service";
          name: string;
          description: string;
          quantity: number;
          unitPrice: number;
          discount: number;
          unit?: string;
        }>;
        totalAmount: number;
      };
    }>) => {
      state.loading = true;
      state.error = null;
    },
    updateAppointmentStatusSuccess: (state, action: PayloadAction<Appointment>) => {
      state.loading = false;
      const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      if (state.currentAppointment?.id === action.payload.id) {
        state.currentAppointment = action.payload;
      }
      state.error = null;
    },
    updateAppointmentStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current appointment
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetAppointments: () => {
      return initialState;
    },
  },
});

export const {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchAppointmentRequest,
  fetchAppointmentSuccess,
  fetchAppointmentFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  deleteAppointmentRequest,
  deleteAppointmentSuccess,
  deleteAppointmentFailure,
  updateAppointmentStatusRequest,
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
  clearCurrentAppointment,
  clearError,
  resetAppointments,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;



