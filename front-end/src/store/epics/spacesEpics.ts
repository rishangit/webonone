import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { spacesService } from '../../services/spaces';
import { toast } from 'sonner';
import {
  fetchSpacesRequest,
  fetchSpacesSuccess,
  fetchSpacesFailure,
  fetchSpaceRequest,
  fetchSpaceSuccess,
  fetchSpaceFailure,
  createSpaceRequest,
  createSpaceSuccess,
  createSpaceFailure,
  updateSpaceRequest,
  updateSpaceSuccess,
  updateSpaceFailure,
  deleteSpaceRequest,
  deleteSpaceSuccess,
  deleteSpaceFailure,
} from '../slices/spacesSlice';

// Fetch spaces epic
export const fetchSpacesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSpacesRequest.type),
    switchMap((action) =>
      from(spacesService.getSpaces(action.payload || {})).pipe(
        map((response) => fetchSpacesSuccess(response)),
        catchError((error) => of(fetchSpacesFailure(error.message)))
      )
    )
  );

// Fetch single space epic
export const fetchSpaceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSpaceRequest.type),
    switchMap((action) =>
      from(spacesService.getSpaceById(action.payload)).pipe(
        map((space) => fetchSpaceSuccess(space)),
        catchError((error) => of(fetchSpaceFailure(error.message)))
      )
    )
  );

// Create space epic
export const createSpaceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createSpaceRequest.type),
    switchMap((action) =>
      from(spacesService.createSpace(action.payload.companyId, action.payload.data)).pipe(
        map((space) => {
          toast.success('Space created successfully!');
          return createSpaceSuccess(space);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create space');
          return of(createSpaceFailure(error.message));
        })
      )
    )
  );

// Update space epic
export const updateSpaceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateSpaceRequest.type),
    switchMap((action) =>
      from(spacesService.updateSpace(action.payload.id, action.payload.data)).pipe(
        map((space) => {
          toast.success('Space updated successfully!');
          return updateSpaceSuccess(space);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update space');
          return of(updateSpaceFailure(error.message));
        })
      )
    )
  );

// Delete space epic
export const deleteSpaceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteSpaceRequest.type),
    switchMap((action) =>
      from(spacesService.deleteSpace(action.payload)).pipe(
        map(() => {
          toast.success('Space deleted successfully!');
          return deleteSpaceSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete space');
          return of(deleteSpaceFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const spacesEpics = [
  fetchSpacesEpic,
  fetchSpaceEpic,
  createSpaceEpic,
  updateSpaceEpic,
  deleteSpaceEpic,
];

