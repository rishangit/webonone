import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { systemProductAttributesService } from '../../services/systemProductAttributes';
import { toast } from 'sonner';
import {
  fetchSystemProductAttributesRequest,
  fetchSystemProductAttributesSuccess,
  fetchSystemProductAttributesFailure,
  fetchSystemProductAttributeRequest,
  fetchSystemProductAttributeSuccess,
  fetchSystemProductAttributeFailure,
  createSystemProductAttributeRequest,
  createSystemProductAttributeSuccess,
  createSystemProductAttributeFailure,
  updateSystemProductAttributeRequest,
  updateSystemProductAttributeSuccess,
  updateSystemProductAttributeFailure,
  deleteSystemProductAttributeRequest,
  deleteSystemProductAttributeSuccess,
  deleteSystemProductAttributeFailure,
} from '../slices/systemProductAttributesSlice';

// Fetch system product attributes epic
export const fetchSystemProductAttributesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemProductAttributesRequest.type),
    switchMap((action) =>
      from(systemProductAttributesService.getAttributes(action.payload)).pipe(
        map((result) => fetchSystemProductAttributesSuccess(result)),
        catchError((error) => of(fetchSystemProductAttributesFailure(error.message)))
      )
    )
  );

// Fetch single system product attribute epic
export const fetchSystemProductAttributeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemProductAttributeRequest.type),
    switchMap((action) =>
      from(systemProductAttributesService.getAttribute(action.payload)).pipe(
        map((attribute) => fetchSystemProductAttributeSuccess(attribute)),
        catchError((error) => of(fetchSystemProductAttributeFailure(error.message)))
      )
    )
  );

// Create system product attribute epic
export const createSystemProductAttributeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createSystemProductAttributeRequest.type),
    switchMap((action) =>
      from(systemProductAttributesService.createAttribute(action.payload)).pipe(
        map((attribute) => {
          toast.success('System product attribute created successfully!');
          return createSystemProductAttributeSuccess(attribute);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create system product attribute');
          return of(createSystemProductAttributeFailure(error.message));
        })
      )
    )
  );

// Update system product attribute epic
export const updateSystemProductAttributeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateSystemProductAttributeRequest.type),
    switchMap((action) =>
      from(systemProductAttributesService.updateAttribute(action.payload.id, action.payload.data)).pipe(
        map((attribute) => {
          toast.success('System product attribute updated successfully!');
          return updateSystemProductAttributeSuccess(attribute);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update system product attribute');
          return of(updateSystemProductAttributeFailure(error.message));
        })
      )
    )
  );

// Delete system product attribute epic
export const deleteSystemProductAttributeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteSystemProductAttributeRequest.type),
    switchMap((action) =>
      from(systemProductAttributesService.deleteAttribute(action.payload)).pipe(
        map(() => {
          toast.success('System product attribute deleted successfully!');
          return deleteSystemProductAttributeSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete system product attribute');
          return of(deleteSystemProductAttributeFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const systemProductAttributesEpics = [
  fetchSystemProductAttributesEpic,
  fetchSystemProductAttributeEpic,
  createSystemProductAttributeEpic,
  updateSystemProductAttributeEpic,
  deleteSystemProductAttributeEpic,
];
