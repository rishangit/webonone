import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { servicesService } from '../../services/services';
import { toast } from 'sonner';
import {
  fetchServicesRequest,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchServiceRequest,
  fetchServiceSuccess,
  fetchServiceFailure,
  createServiceRequest,
  createServiceSuccess,
  createServiceFailure,
  updateServiceRequest,
  updateServiceSuccess,
  updateServiceFailure,
  deleteServiceRequest,
  deleteServiceSuccess,
  deleteServiceFailure,
} from '../slices/servicesSlice';

// Fetch all services epic
export const fetchServicesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchServicesRequest.type),
    switchMap((action) => {
      console.log('[fetchServicesEpic] Fetching services for companyId:', action.payload.companyId, 'filters:', action.payload.filters);
      return from(servicesService.getServices(action.payload.companyId, action.payload.filters)).pipe(
        map((result) => {
          console.log('[fetchServicesEpic] Services received:', result);
          // Handle both paginated and non-paginated responses
          if (Array.isArray(result)) {
            console.log('[fetchServicesEpic] Services count:', result.length);
            return fetchServicesSuccess(result);
          } else {
            console.log('[fetchServicesEpic] Services count:', result.services?.length || 0, 'pagination:', result.pagination);
            return fetchServicesSuccess(result);
          }
        }),
        catchError((error) => {
          console.error('[fetchServicesEpic] Error fetching services:', error);
          return of(fetchServicesFailure(error.message));
        })
      );
    })
  );

// Fetch single service epic
export const fetchServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchServiceRequest.type),
    switchMap((action) =>
      from(servicesService.getServiceById(action.payload)).pipe(
        map((service) => fetchServiceSuccess(service)),
        catchError((error) => of(fetchServiceFailure(error.message)))
      )
    )
  );

// Create service epic
export const createServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createServiceRequest.type),
    switchMap((action) =>
      from(servicesService.createService(action.payload.companyId, action.payload.data)).pipe(
        map((service) => {
          toast.success('Service created successfully!');
          return createServiceSuccess(service);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create service');
          return of(createServiceFailure(error.message));
        })
      )
    )
  );

// Update service epic
export const updateServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateServiceRequest.type),
    switchMap((action) =>
      from(servicesService.updateService(action.payload.id, action.payload.data)).pipe(
        map((service) => {
          toast.success('Service updated successfully!');
          return updateServiceSuccess(service);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update service');
          return of(updateServiceFailure(error.message));
        })
      )
    )
  );

// Delete service epic
export const deleteServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteServiceRequest.type),
    switchMap((action) =>
      from(servicesService.deleteService(action.payload)).pipe(
        map(() => {
          toast.success('Service deleted successfully!');
          return deleteServiceSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete service');
          return of(deleteServiceFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const servicesEpics = [
  fetchServicesEpic,
  fetchServiceEpic,
  createServiceEpic,
  updateServiceEpic,
  deleteServiceEpic,
];





