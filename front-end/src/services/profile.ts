import { Observable, throwError, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../types/user';
import { apiService } from './api';
import { config } from '../config/environment';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    language?: string;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadResponse {
  url: string;
  progress?: number;
}

class ProfileService {
  private baseUrl = '/auth';

  /**
   * Get user profile by ID
   */
  getProfile(userId: string): Observable<User> {
    return from(apiService.get<any>(`${this.baseUrl}/profile/${userId}`)).pipe(
      map((response) => response.data || response),
      catchError((error) => {
        console.error('Get profile error:', error);
        return throwError(() => new Error(error.message || 'Failed to load profile'));
      })
    );
  }

  /**
   * Get current user profile
   */
  getCurrentProfile(): Observable<User> {
    return from(apiService.get<any>(`${this.baseUrl}/me`)).pipe(
      map((response) => response.data || response),
      catchError((error) => {
        console.error('Get current profile error:', error);
        return throwError(() => new Error(error.message || 'Failed to load current profile'));
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, updateData: ProfileUpdateData): Observable<User> {
    return from(apiService.put<any>(`${this.baseUrl}/profile/${userId}`, updateData)).pipe(
      map((response) => response.data || response),
      catchError((error) => {
        console.error('Update profile error:', error);
        return throwError(() => new Error(error.message || 'Failed to update profile'));
      })
    );
  }

  /**
   * Update current user profile
   */
  updateCurrentProfile(updateData: ProfileUpdateData): Observable<User> {
    return from(apiService.put<any>(`${this.baseUrl}/me`, updateData)).pipe(
      map((response) => response.data || response),
      catchError((error) => {
        console.error('Update current profile error:', error);
        return throwError(() => new Error(error.message || 'Failed to update profile'));
      })
    );
  }

  /**
   * Delete user profile
   */
  deleteProfile(userId: string): Observable<void> {
    return from(apiService.delete<any>(`${this.baseUrl}/profile/${userId}`)).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Delete profile error:', error);
        return throwError(() => new Error(error.message || 'Failed to delete profile'));
      })
    );
  }

  /**
   * Upload avatar with progress tracking
   */
  uploadAvatar(userId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    return new Observable<string>((observer) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          // Note: In a real implementation, you might want to emit progress events
          // This would require a different approach with RxJS subjects
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            observer.next(response.data.avatarUrl || response.avatarUrl);
            observer.complete();
          } catch (error) {
            observer.error(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            observer.error(new Error(errorResponse.message || 'Upload failed'));
          } catch {
            observer.error(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        observer.error(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        observer.error(new Error('Upload cancelled'));
      });

      xhr.open('POST', `${apiService.getBaseURL()}${this.baseUrl}/avatar`);
      xhr.setRequestHeader('Authorization', `Bearer ${apiService.getAuthToken()}`);
      xhr.send(formData);

      // Return cleanup function
      return () => {
        xhr.abort();
      };
    });
  }

  /**
   * Change user password
   */
  changePassword(userId: string, passwordData: PasswordChangeData): Observable<void> {
    return from(apiService.put<any>(`${this.baseUrl}/change-password`, passwordData)).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Change password error:', error);
        return throwError(() => new Error(error.message || 'Failed to change password'));
      })
    );
  }

  /**
   * Validate profile data
   */
  validateProfileData(data: ProfileUpdateData): Observable<boolean> {
    return of(true).pipe(
      map(() => {
        // Basic validation
        if (data.email && !this.isValidEmail(data.email)) {
          throw new Error('Invalid email format');
        }
        if (data.phone && !this.isValidPhone(data.phone)) {
          throw new Error('Invalid phone format');
        }
        if (data.firstName && data.firstName.trim().length < 1) {
          throw new Error('First name is required');
        }
        if (data.lastName && data.lastName.trim().length < 1) {
          throw new Error('Last name is required');
        }
        return true;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

export const profileService = new ProfileService();
