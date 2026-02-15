import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { unitsOfMeasureService } from '../../services/unitsOfMeasure';
import { toast } from 'sonner';
import {
  fetchUnitsOfMeasureRequest,
  fetchUnitsOfMeasureSuccess,
  fetchUnitsOfMeasureFailure,
  fetchUnitOfMeasureRequest,
  fetchUnitOfMeasureSuccess,
  fetchUnitOfMeasureFailure,
  createUnitOfMeasureRequest,
  createUnitOfMeasureSuccess,
  createUnitOfMeasureFailure,
  updateUnitOfMeasureRequest,
  updateUnitOfMeasureSuccess,
  updateUnitOfMeasureFailure,
  deleteUnitOfMeasureRequest,
  deleteUnitOfMeasureSuccess,
  deleteUnitOfMeasureFailure,
} from '../slices/unitsOfMeasureSlice';

// Fetch units of measure epic
export const fetchUnitsOfMeasureEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUnitsOfMeasureRequest.type),
    switchMap((action) =>
      from(unitsOfMeasureService.getUnits(action.payload)).pipe(
        map((result) => fetchUnitsOfMeasureSuccess(result)),
        catchError((error) => of(fetchUnitsOfMeasureFailure(error.message)))
      )
    )
  );

// Fetch single unit of measure epic
export const fetchUnitOfMeasureEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUnitOfMeasureRequest.type),
    switchMap((action) =>
      from(unitsOfMeasureService.getUnit(action.payload)).pipe(
        map((unit) => fetchUnitOfMeasureSuccess(unit)),
        catchError((error) => of(fetchUnitOfMeasureFailure(error.message)))
      )
    )
  );

// Create unit of measure epic
export const createUnitOfMeasureEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createUnitOfMeasureRequest.type),
    switchMap((action) =>
      from(unitsOfMeasureService.createUnit(action.payload)).pipe(
        map((unit) => {
          toast.success('Unit of measure created successfully!');
          return createUnitOfMeasureSuccess(unit);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create unit of measure');
          return of(createUnitOfMeasureFailure(error.message));
        })
      )
    )
  );

// Update unit of measure epic
export const updateUnitOfMeasureEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateUnitOfMeasureRequest.type),
    switchMap((action) =>
      from(unitsOfMeasureService.updateUnit(action.payload.id, action.payload.data)).pipe(
        map((unit) => {
          toast.success('Unit of measure updated successfully!');
          return updateUnitOfMeasureSuccess(unit);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update unit of measure');
          return of(updateUnitOfMeasureFailure(error.message));
        })
      )
    )
  );

// Delete unit of measure epic
export const deleteUnitOfMeasureEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteUnitOfMeasureRequest.type),
    switchMap((action) =>
      from(unitsOfMeasureService.deleteUnit(action.payload)).pipe(
        map(() => {
          toast.success('Unit of measure deleted successfully!');
          return deleteUnitOfMeasureSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete unit of measure');
          return of(deleteUnitOfMeasureFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const unitsOfMeasureEpics = [
  fetchUnitsOfMeasureEpic,
  fetchUnitOfMeasureEpic,
  createUnitOfMeasureEpic,
  updateUnitOfMeasureEpic,
  deleteUnitOfMeasureEpic,
];
