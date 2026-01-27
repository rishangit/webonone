import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { usersService } from '../../services/users';
import {
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
} from '../slices/usersSlice';

// Fetch all users epic (with pagination, search, filters)
export const fetchUsersEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUsersRequest.type),
    switchMap((action) => {
      const filters = action.payload || {};
      // If companyId is provided, use company-specific endpoint
      // Otherwise use the general users endpoint (for system admin)
      const serviceCall = filters.companyId
        ? usersService.getUsersByCompany(String(filters.companyId), filters)
        : usersService.getAllUsers(filters);
      
      return from(serviceCall).pipe(
        map((response) => fetchUsersSuccess(response)),
        catchError((error) => of(fetchUsersFailure(error.message)))
      );
    })
  );

// Fetch single user epic (following Category pattern)
export const fetchUserEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUserRequest.type),
    switchMap((action) =>
      from(usersService.getUserById(action.payload)).pipe(
        map((user) => fetchUserSuccess(user)),
        catchError((error) => of(fetchUserFailure(error.message)))
      )
    )
  );

// Update user epic
export const updateUserEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateUserRequest.type),
    switchMap((action) => {
      // For now, we'll need to check if there's an update endpoint
      // If not, we can use the profile update endpoint
      // This is a placeholder - you may need to adjust based on your API
      return of(updateUserFailure('Update user endpoint not implemented yet'));
    })
  );

// Delete user epic
export const deleteUserEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteUserRequest.type),
    switchMap((action) => {
      // For now, we'll need to check if there's a delete endpoint
      // This is a placeholder - you may need to adjust based on your API
      return of(deleteUserFailure('Delete user endpoint not implemented yet'));
    })
  );

// Export all epics
export const usersEpics = [
  fetchUsersEpic,
  fetchUserEpic,
  updateUserEpic,
  deleteUserEpic,
];

