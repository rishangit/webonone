import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { staffService } from '../../services/staff';
import { toast } from 'sonner';
import {
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
} from '../slices/staffSlice';

// Fetch all staff epic
export const fetchStaffEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchStaffRequest.type),
    switchMap((action) =>
      from(staffService.getStaff(action.payload || {})).pipe(
        map((response) => fetchStaffSuccess(response)),
        catchError((error) => of(fetchStaffFailure(error.message)))
      )
    )
  );

// Fetch single staff epic
export const fetchStaffMemberEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchStaffMemberRequest.type),
    switchMap((action) =>
      from(staffService.getStaffById(action.payload)).pipe(
        map((staff) => fetchStaffMemberSuccess(staff)),
        catchError((error) => of(fetchStaffMemberFailure(error.message)))
      )
    )
  );

// Create staff epic
export const createStaffEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createStaffRequest.type),
    switchMap((action) =>
      from(staffService.createStaff(action.payload.companyId, action.payload.data)).pipe(
        map((staff) => {
          toast.success('Staff created successfully!');
          return createStaffSuccess(staff);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create staff');
          return of(createStaffFailure(error.message));
        })
      )
    )
  );

// Update staff epic
export const updateStaffEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateStaffRequest.type),
    switchMap((action) =>
      from(staffService.updateStaff(action.payload.id, action.payload.data)).pipe(
        map((staff) => {
          toast.success('Staff updated successfully!');
          return updateStaffSuccess(staff);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update staff');
          return of(updateStaffFailure(error.message));
        })
      )
    )
  );

// Delete staff epic
export const deleteStaffEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteStaffRequest.type),
    switchMap((action) =>
      from(staffService.deleteStaff(action.payload)).pipe(
        map(() => {
          toast.success('Staff deleted successfully!');
          return deleteStaffSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete staff');
          return of(deleteStaffFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const staffEpics = [
  fetchStaffEpic,
  fetchStaffMemberEpic,
  createStaffEpic,
  updateStaffEpic,
  deleteStaffEpic,
];

