import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Staff, CreateStaffData, UpdateStaffData } from '../../services/staff';
import { PaginationMeta } from '../../services/products';

interface StaffState {
  staff: Staff[];
  currentStaff: Staff | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagination: PaginationMeta | null;
}

const initialState: StaffState = {
  staff: [],
  currentStaff: null,
  loading: false,
  error: null,
  lastFetch: null,
  pagination: null,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Fetch staff
    fetchStaffRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess: (state, action: PayloadAction<{ staff: Staff[]; pagination: PaginationMeta }>) => {
      state.loading = false;
      state.staff = action.payload.staff;
      state.pagination = action.payload.pagination;
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single staff
    fetchStaffMemberRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffMemberSuccess: (state, action: PayloadAction<Staff>) => {
      state.loading = false;
      state.currentStaff = action.payload;
      state.error = null;
    },
    fetchStaffMemberFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create staff
    createStaffRequest: (state, action: PayloadAction<{ companyId: string; data: CreateStaffData }>) => {
      state.loading = true;
      state.error = null;
    },
    createStaffSuccess: (state, action: PayloadAction<Staff>) => {
      state.loading = false;
      state.staff.push(action.payload);
      state.error = null;
    },
    createStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update staff
    updateStaffRequest: (state, action: PayloadAction<{ id: string; data: UpdateStaffData }>) => {
      state.loading = true;
      state.error = null;
    },
    updateStaffSuccess: (state, action: PayloadAction<Staff>) => {
      state.loading = false;
      const index = state.staff.findIndex(staff => staff.id === action.payload.id);
      if (index !== -1) {
        state.staff[index] = action.payload;
      }
      if (state.currentStaff?.id === action.payload.id) {
        state.currentStaff = action.payload;
      }
      state.error = null;
    },
    updateStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete staff
    deleteStaffRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteStaffSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.staff = state.staff.filter(staff => staff.id !== action.payload);
      if (state.currentStaff?.id === action.payload) {
        state.currentStaff = null;
      }
      state.error = null;
    },
    deleteStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current staff
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetStaff: () => {
      return initialState;
    },
  },
});

export const {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  fetchStaffMemberRequest,
  fetchStaffMemberSuccess,
  fetchStaffMemberFailure,
  createStaffRequest,
  createStaffSuccess,
  createStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
  clearCurrentStaff,
  clearError,
  resetStaff,
} = staffSlice.actions;

export default staffSlice.reducer;

