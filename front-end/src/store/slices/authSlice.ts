import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, SignUpFormData } from '../../types/user';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUpForm: SignUpFormData | null;
  signUpStep: 'form' | 'verification' | 'complete';
  requestId: string | null;
}

// Helper function to safely parse user from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('authToken') && !!getStoredUser(),
  signUpForm: null,
  signUpStep: 'form',
  requestId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Sign-up actions
    signUpRequest: (state, action: PayloadAction<SignUpFormData>) => {
      state.isLoading = true;
      state.error = null;
      state.signUpForm = action.payload;
      state.signUpStep = 'form';
      state.requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },
    signUpSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.signUpStep = 'complete';
    },
    signUpFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.signUpStep = 'form';
    },
    signUpReset: (state) => {
      state.isLoading = false;
      state.error = null;
      state.signUpForm = null;
      state.signUpStep = 'form';
    },
    
    // Login actions
    loginRequest: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout actions
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.signUpForm = null;
      state.signUpStep = 'form';
      state.requestId = null;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    
    // Refresh user data actions
    refreshUserRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshUserSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    refreshUserFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Profile actions
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    // Role selection actions
    roleSelectionRequired: (state, action: PayloadAction<{ user: User; roles: any[] }>) => {
      state.isLoading = false;
      state.error = null;
      // Store user and roles temporarily for role selection
      (state as any).pendingUser = action.payload.user;
      (state as any).pendingRoles = action.payload.roles;
    },
    
    completeLoginWithRole: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      // Clear pending data
      delete (state as any).pendingUser;
      delete (state as any).pendingRoles;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  signUpRequest,
  signUpSuccess,
  signUpFailure,
  signUpReset,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  refreshUserRequest,
  refreshUserSuccess,
  refreshUserFailure,
  roleSelectionRequired,
  completeLoginWithRole,
  updateProfile,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
