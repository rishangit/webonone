import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

export interface ProfileState {
  currentProfile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  lastUpdated: string | null;
  avatarUploadProgress: number;
  isAvatarUploading: boolean;
}

const initialState: ProfileState = {
  currentProfile: null,
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  lastUpdated: null,
  avatarUploadProgress: 0,
  isAvatarUploading: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Profile loading actions
    loadProfileRequest: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    loadProfileSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.currentProfile = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    loadProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Profile update actions
    updateProfileRequest: (state, action: PayloadAction<Partial<User>>) => {
      state.isUpdating = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.isUpdating = false;
      state.currentProfile = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
      
      // Update localStorage with the updated user data
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Failed to update user in localStorage:', error);
      }
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // Profile deletion actions
    deleteProfileRequest: (state) => {
      state.isDeleting = true;
      state.error = null;
    },
    deleteProfileSuccess: (state) => {
      state.isDeleting = false;
      state.currentProfile = null;
      state.error = null;
      state.lastUpdated = null;
    },
    deleteProfileFailure: (state, action: PayloadAction<string>) => {
      state.isDeleting = false;
      state.error = action.payload;
    },

    // Avatar upload actions
    uploadAvatarRequest: (state) => {
      state.isAvatarUploading = true;
      state.avatarUploadProgress = 0;
      state.error = null;
    },
    uploadAvatarProgress: (state, action: PayloadAction<number>) => {
      state.avatarUploadProgress = action.payload;
    },
    uploadAvatarSuccess: (state, action: PayloadAction<string>) => {
      state.isAvatarUploading = false;
      state.avatarUploadProgress = 100;
      if (state.currentProfile) {
        state.currentProfile.avatar = action.payload;
      }
      state.error = null;
    },
    uploadAvatarFailure: (state, action: PayloadAction<string>) => {
      state.isAvatarUploading = false;
      state.avatarUploadProgress = 0;
      state.error = action.payload;
    },

    // Password change actions
    changePasswordRequest: (state) => {
      state.isUpdating = true;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.isUpdating = false;
      state.error = null;
    },
    changePasswordFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    // Clear error
    clearProfileError: (state) => {
      state.error = null;
    },

    // Reset profile state
    resetProfile: (state) => {
      state.currentProfile = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.error = null;
      state.lastUpdated = null;
      state.avatarUploadProgress = 0;
      state.isAvatarUploading = false;
    },
  },
});

export const {
  loadProfileRequest,
  loadProfileSuccess,
  loadProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  deleteProfileRequest,
  deleteProfileSuccess,
  deleteProfileFailure,
  uploadAvatarRequest,
  uploadAvatarProgress,
  uploadAvatarSuccess,
  uploadAvatarFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  clearProfileError,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
