import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { appointmentsService } from '../../services/appointments';
import { toast } from 'sonner';
import {
  fetchAppointmentsRequest,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchAppointmentRequest,
  fetchAppointmentSuccess,
  fetchAppointmentFailure,
  createAppointmentRequest,
  createAppointmentSuccess,
  createAppointmentFailure,
  updateAppointmentRequest,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  deleteAppointmentRequest,
  deleteAppointmentSuccess,
  deleteAppointmentFailure,
  updateAppointmentStatusRequest,
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
} from '../slices/appointmentsSlice';

// Fetch all appointments epic
export const fetchAppointmentsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchAppointmentsRequest.type),
    switchMap((action) => {
      const filters = action.payload.filters || {};
      return from(appointmentsService.getAppointments(action.payload.companyId, filters)).pipe(
        map((result) => {
          return fetchAppointmentsSuccess({
            appointments: result.appointments,
            pagination: result.pagination
          });
        }),
        catchError((error) => {
          return of(fetchAppointmentsFailure(error.message));
        })
      );
    })
  );

// Fetch single appointment epic
export const fetchAppointmentEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchAppointmentRequest.type),
    switchMap((action) =>
      from(appointmentsService.getAppointmentById(action.payload)).pipe(
        map((appointment) => fetchAppointmentSuccess(appointment)),
        catchError((error) => of(fetchAppointmentFailure(error.message)))
      )
    )
  );

// Create appointment epic
export const createAppointmentEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createAppointmentRequest.type),
    switchMap((action) =>
      from(appointmentsService.createAppointment(action.payload)).pipe(
        map((appointment) => {
          toast.success('Appointment created successfully!');
          return createAppointmentSuccess(appointment);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create appointment');
          return of(createAppointmentFailure(error.message));
        })
      )
    )
  );

// Update appointment epic
export const updateAppointmentEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateAppointmentRequest.type),
    switchMap((action) =>
      from(appointmentsService.updateAppointment(action.payload.id, action.payload.data)).pipe(
        map((appointment) => {
          toast.success('Appointment updated successfully!');
          return updateAppointmentSuccess(appointment);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update appointment');
          return of(updateAppointmentFailure(error.message));
        })
      )
    )
  );

// Delete appointment epic
export const deleteAppointmentEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteAppointmentRequest.type),
    switchMap((action) =>
      from(appointmentsService.deleteAppointment(action.payload)).pipe(
        map(() => {
          toast.success('Appointment deleted successfully!');
          return deleteAppointmentSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete appointment');
          return of(deleteAppointmentFailure(error.message));
        })
      )
    )
  );

// Update appointment status epic
export const updateAppointmentStatusEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateAppointmentStatusRequest.type),
    switchMap((action) =>
      from(appointmentsService.updateAppointmentStatus(
        action.payload.id, 
        action.payload.status,
        action.payload.completionData
      )).pipe(
        map((appointment) => {
          toast.success('Appointment status updated successfully!');
          return updateAppointmentStatusSuccess(appointment);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update appointment status');
          return of(updateAppointmentStatusFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const appointmentsEpics = [
  fetchAppointmentsEpic,
  fetchAppointmentEpic,
  createAppointmentEpic,
  updateAppointmentEpic,
  deleteAppointmentEpic,
  updateAppointmentStatusEpic,
];



