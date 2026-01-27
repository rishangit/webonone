import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { PaginationMeta } from '../../services/products';

export interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  stats: {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
  } | null;
  lastFetch: number | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
  lastFetch: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Fetch all users
    fetchUsersRequest: (state, action: PayloadAction<{
      limit?: number;
      offset?: number;
      page?: number;
      search?: string;
      role?: string | number;
      companyId?: number;
      isActive?: boolean;
    } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<{ users: User[]; pagination: PaginationMeta; stats?: { usersByRole?: Record<string, number> } }>) => {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
      if (action.payload.stats?.usersByRole) {
        state.stats = {
          totalUsers: action.payload.pagination.total,
          activeUsers: action.payload.users.filter(u => u.isActive).length,
          usersByRole: action.payload.stats.usersByRole
        };
      }
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single user
    fetchUserRequest: (state, action: PayloadAction<string | number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.currentUser = action.payload;
      // Update or add user in users array
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      } else {
        // Add user to array if it doesn't exist (for caching)
        state.users.push(action.payload);
      }
      state.error = null;
    },
    fetchUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update user
    updateUserRequest: (state, action: PayloadAction<{ id: string | number; data: Partial<User> }>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      // Update in users array
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Update current user if it matches
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.error = null;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete user
    deleteUserRequest: (state, action: PayloadAction<string | number>) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<string | number>) => {
      state.loading = false;
      state.users = state.users.filter(u => u.id !== action.payload);
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null;
      }
      state.error = null;
    },
    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current user
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetUsers: () => {
      return initialState;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
  clearCurrentUser,
  clearError,
  resetUsers,
} = usersSlice.actions;

export default usersSlice.reducer;

