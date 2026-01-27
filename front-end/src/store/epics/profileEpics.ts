import { Observable, of } from 'rxjs';
import { ofType } from 'redux-observable';
import { switchMap, catchError, map, tap, mergeMap } from 'rxjs/operators';
import { RootAction } from '../index';
import { RootState } from '../index';
import { profileService } from '../../services/profile';
import { User } from '../../types/user';
import {
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
} from '../slices/profileSlice';
import { updateProfile as updateAuthProfile } from '../slices/authSlice';
import { toast } from 'sonner';

// Load profile epic
export const loadProfileEpic = (action$: Observable<RootAction>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(loadProfileRequest.type),
    switchMap((action: any) =>
      profileService.getProfile(action.payload).pipe(
        map((profile) => loadProfileSuccess(profile)),
        catchError((error) => {
          console.error('Load profile error:', error);
          return of(loadProfileFailure(error.message || 'Failed to load profile'));
        })
      )
    )
  );

// Update profile epic
export const updateProfileEpic = (action$: Observable<RootAction>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(updateProfileRequest.type),
    switchMap((action: any) => {
      const currentUser = state$.value.auth.user;
      if (!currentUser?.id) {
        const currentProfile = state$.value.profile.currentProfile;
        if (!currentProfile?.id) {
          return of(updateProfileFailure('No profile to update'));
        }
        return profileService.updateProfile(currentProfile.id, action.payload).pipe(
          map((updatedProfile) => {
            toast.success('Profile updated successfully!');
            return updateProfileSuccess(updatedProfile);
          }),
          catchError((error) => {
            console.error('Update profile error:', error);
            toast.error(error.message || 'Failed to update profile');
            return of(updateProfileFailure(error.message || 'Failed to update profile'));
          })
        );
      }
      
      return profileService.updateCurrentProfile(action.payload).pipe(
        mergeMap((updatedProfile) => {
          toast.success('Profile updated successfully!');
          // Debug: Log updated profile
          if (process.env.NODE_ENV === 'development') {
            console.log('Profile updated, new avatar URL:', updatedProfile.avatar);
          }
          // Update both profile state and auth user state
          // Pass the full updated profile to updateAuthProfile
          return [
            updateProfileSuccess(updatedProfile),
            updateAuthProfile(updatedProfile as Partial<User>)
          ];
        }),
        catchError((error) => {
          console.error('Update profile error:', error);
          toast.error(error.message || 'Failed to update profile');
          return of(updateProfileFailure(error.message || 'Failed to update profile'));
        })
      );
    })
  );

// Delete profile epic
export const deleteProfileEpic = (action$: Observable<RootAction>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(deleteProfileRequest.type),
    switchMap(() => {
      const currentProfile = state$.value.profile.currentProfile;
      if (!currentProfile?.id) {
        return of(deleteProfileFailure('No profile to delete'));
      }
      
      return profileService.deleteProfile(currentProfile.id).pipe(
        map(() => {
          toast.success('Profile deleted successfully!');
          return deleteProfileSuccess();
        }),
        catchError((error) => {
          console.error('Delete profile error:', error);
          toast.error(error.message || 'Failed to delete profile');
          return of(deleteProfileFailure(error.message || 'Failed to delete profile'));
        })
      );
    })
  );

// Upload avatar epic
export const uploadAvatarEpic = (action$: Observable<RootAction>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(uploadAvatarRequest.type),
    switchMap((action: any) => {
      const currentProfile = state$.value.profile.currentProfile;
      if (!currentProfile?.id) {
        return of(uploadAvatarFailure('No profile to update'));
      }
      
      return profileService.uploadAvatar(currentProfile.id, action.payload).pipe(
        tap((progress) => {
          // Emit progress updates
          if (progress < 100) {
            // This would need to be handled differently in a real implementation
            // as we can't dispatch actions from within tap
          }
        }),
        map((avatarUrl) => {
          toast.success('Avatar uploaded successfully!');
          return uploadAvatarSuccess(avatarUrl);
        }),
        catchError((error) => {
          console.error('Upload avatar error:', error);
          toast.error(error.message || 'Failed to upload avatar');
          return of(uploadAvatarFailure(error.message || 'Failed to upload avatar'));
        })
      );
    })
  );

// Change password epic
export const changePasswordEpic = (action$: Observable<RootAction>, state$: Observable<RootState>) =>
  action$.pipe(
    ofType(changePasswordRequest.type),
    switchMap((action: any) => {
      const currentProfile = state$.value.profile.currentProfile;
      if (!currentProfile?.id) {
        return of(changePasswordFailure('No profile to update'));
      }
      
      return profileService.changePassword(currentProfile.id, action.payload).pipe(
        map(() => {
          toast.success('Password changed successfully!');
          return changePasswordSuccess();
        }),
        catchError((error) => {
          console.error('Change password error:', error);
          toast.error(error.message || 'Failed to change password');
          return of(changePasswordFailure(error.message || 'Failed to change password'));
        })
      );
    })
  );

// Export all epics
export const profileEpics = [
  loadProfileEpic,
  updateProfileEpic,
  deleteProfileEpic,
  uploadAvatarEpic,
  changePasswordEpic,
];
