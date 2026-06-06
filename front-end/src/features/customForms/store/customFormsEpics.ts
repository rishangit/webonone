/* eslint-disable @typescript-eslint/no-explicit-any -- redux-observable action typing matches other feature epics */
import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { toast } from 'sonner';
import { companyCustomFormsService } from '../services/companyCustomForms';
import { companyCustomFormSubmissionsService } from '../services/companyCustomFormSubmissions';
import {
  fetchCustomFormsRequest,
  fetchCustomFormsSuccess,
  fetchCustomFormsFailure,
  fetchCustomFormRequest,
  fetchCustomFormSuccess,
  fetchCustomFormFailure,
  createCustomFormRequest,
  createCustomFormSuccess,
  createCustomFormFailure,
  updateCustomFormRequest,
  updateCustomFormSuccess,
  updateCustomFormFailure,
  duplicateCustomFormRequest,
  duplicateCustomFormSuccess,
  duplicateCustomFormFailure,
  deleteCustomFormRequest,
  deleteCustomFormSuccess,
  deleteCustomFormFailure,
  fetchSubmissionsRequest,
  fetchSubmissionsSuccess,
  fetchSubmissionsFailure,
} from './customFormsSlice';

export const fetchCustomFormsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCustomFormsRequest.type),
    switchMap((action) =>
      from(
        companyCustomFormsService.getForms(action.payload.companyId, action.payload.activeOnly)
      ).pipe(
        map((forms) => fetchCustomFormsSuccess(forms)),
        catchError((error: Error) => of(fetchCustomFormsFailure(error.message)))
      )
    )
  );

export const fetchCustomFormEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCustomFormRequest.type),
    switchMap((action) =>
      from(companyCustomFormsService.getFormById(action.payload)).pipe(
        map((form) => fetchCustomFormSuccess(form)),
        catchError((error: Error) => of(fetchCustomFormFailure(error.message)))
      )
    )
  );

export const createCustomFormEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createCustomFormRequest.type),
    switchMap((action) =>
      from(companyCustomFormsService.createForm(action.payload)).pipe(
        map((form) => {
          toast.success('Form created successfully');
          return createCustomFormSuccess(form);
        }),
        catchError((error: Error) => {
          toast.error(error.message || 'Failed to create form');
          return of(createCustomFormFailure(error.message));
        })
      )
    )
  );

export const updateCustomFormEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateCustomFormRequest.type),
    switchMap((action) =>
      from(companyCustomFormsService.updateForm(action.payload.id, action.payload.data)).pipe(
        map((form) => {
          toast.success('Form saved successfully');
          return updateCustomFormSuccess(form);
        }),
        catchError((error: Error) => {
          toast.error(error.message || 'Failed to save form');
          return of(updateCustomFormFailure(error.message));
        })
      )
    )
  );

export const duplicateCustomFormEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(duplicateCustomFormRequest.type),
    switchMap((action) =>
      from(companyCustomFormsService.duplicateForm(action.payload)).pipe(
        map((form) => {
          toast.success('Form duplicated successfully');
          return duplicateCustomFormSuccess(form);
        }),
        catchError((error: Error) => {
          toast.error(error.message || 'Failed to duplicate form');
          return of(duplicateCustomFormFailure(error.message));
        })
      )
    )
  );

export const deleteCustomFormEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteCustomFormRequest.type),
    switchMap((action) =>
      from(companyCustomFormsService.deleteForm(action.payload)).pipe(
        map(() => {
          toast.success('Form deleted successfully');
          return deleteCustomFormSuccess(action.payload);
        }),
        catchError((error: Error) => {
          toast.error(error.message || 'Failed to delete form');
          return of(deleteCustomFormFailure(error.message));
        })
      )
    )
  );

export const fetchSubmissionsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSubmissionsRequest.type),
    switchMap((action) =>
      from(companyCustomFormSubmissionsService.getByAppointment(action.payload.appointmentId)).pipe(
        map((submissions) => fetchSubmissionsSuccess(submissions)),
        catchError((error: Error) => of(fetchSubmissionsFailure(error.message)))
      )
    )
  );

export const customFormsEpics = [
  fetchCustomFormsEpic,
  fetchCustomFormEpic,
  createCustomFormEpic,
  updateCustomFormEpic,
  duplicateCustomFormEpic,
  deleteCustomFormEpic,
  fetchSubmissionsEpic,
];
