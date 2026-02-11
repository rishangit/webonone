import { Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { switchMap, map, catchError, tap, filter, throttleTime, timeout } from 'rxjs/operators';
import { RootState } from '../index';
import { 
  signUpRequest, 
  signUpSuccess, 
  signUpFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  refreshUserRequest,
  refreshUserSuccess,
  refreshUserFailure,
  roleSelectionRequired,
  completeLoginWithRole
} from '../slices/authSlice';
import { authService } from '../../services/auth';

// Track ongoing requests to prevent duplicates
let ongoingSignUpRequest: string | null = null;
let lastProcessedRequestId: string | null = null;

// Sign-up epic
export const signUpEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(signUpRequest.type),
    throttleTime(1000), // Throttle to prevent rapid submissions
    filter((action: ReturnType<typeof signUpRequest>) => {
      // Check if there's already an ongoing request
      if (ongoingSignUpRequest) {
        return false;
      }
      
      // Check if this is a duplicate request based on email and timestamp
      const currentRequestId = action.payload.email + '_' + action.payload.firstName + '_' + action.payload.lastName;
      if (lastProcessedRequestId === currentRequestId) {
        return false;
      }
      
      lastProcessedRequestId = currentRequestId;
      return true;
    }),
    switchMap((action: ReturnType<typeof signUpRequest>) => {
      const signUpData = action.payload;
      const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      ongoingSignUpRequest = requestId;
      
      return from(authService.register(signUpData)).pipe(
        timeout(10000), // 10 second timeout
        map((response) => {
          // Store token and user data in localStorage
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          return signUpSuccess({
            user: response.user,
            token: response.token,
          });
        }),
        catchError((error) => {
          ongoingSignUpRequest = null; // Clear flag on error
          lastProcessedRequestId = null; // Clear processed request ID
          return of(signUpFailure(error.message || 'Sign-up failed'));
        }),
        tap(() => {
          // Clear the ongoing request flag
          ongoingSignUpRequest = null;
          lastProcessedRequestId = null;
        })
      );
    })
  );

// Login epic
export const loginEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(loginRequest.type),
    switchMap((action: ReturnType<typeof loginRequest>) => {
      const { email, password } = action.payload;
      
      return from(authService.login(email, password)).pipe(
        map((response: any) => {
          console.log('[Login Epic] Login response:', response);
          // Check if role selection is required
          if (response.requiresRoleSelection) {
            console.log('[Login Epic] Role selection required, roles:', response.roles);
            return roleSelectionRequired({
              user: response.user,
              roles: response.roles
            });
          }
          
          // Normal login - single role
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          return loginSuccess({
            user: response.user,
            token: response.token,
          });
        }),
        catchError((error) => {
          return of(loginFailure(error.message || 'Login failed'));
        })
      );
    })
  );

// Complete login with role epic
export const completeLoginWithRoleEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType('auth/completeLoginWithRoleRequest'),
    switchMap((action: any) => {
      const { email, roleId } = action.payload;
      
      return from(authService.completeLoginWithRole(email, roleId)).pipe(
        map((response) => {
          console.log('[CompleteLogin Epic] Login response:', response);
          console.log('[CompleteLogin Epic] Selected role:', response.selectedRole);
          console.log('[CompleteLogin Epic] User role:', response.user.role);
          
          // Ensure user object has the correct role from selectedRole
          const userWithRole = {
            ...response.user,
            role: response.selectedRole?.role ?? response.user.role,
            roleLevel: response.selectedRole?.role ?? response.user.role,
            companyId: response.selectedRole?.companyId ?? response.user.companyId
          };
          
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(userWithRole));
          
          return completeLoginWithRole({
            user: userWithRole,
            token: response.token,
          });
        }),
        catchError((error) => {
          console.error('[CompleteLogin Epic] Error:', error);
          return of(loginFailure(error.message || 'Login failed'));
        })
      );
    })
  );

// Refresh user data epic
export const refreshUserEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(refreshUserRequest.type),
    switchMap(() => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return of(refreshUserFailure('No authentication token found'));
      }
      
      return from(authService.getCurrentUser(token)).pipe(
        map((user) => {
          console.log('refreshUserEpic: Received user from API:', user);
          console.log('refreshUserEpic: user.companyId:', user.companyId);
          return refreshUserSuccess(user);
        }),
        catchError((error) => {
          console.error('refreshUserEpic: Error refreshing user:', error);
          return of(refreshUserFailure(error.message || 'Failed to refresh user data'));
        })
      );
    })
  );

// Logout epic
export const logoutEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(logout.type),
    tap(() => {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }),
    map(() => ({ type: 'LOGOUT_COMPLETED' })) // Don't dispatch logout again
  );

