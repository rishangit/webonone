import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { backlogService } from '../../services/backlog';
import { toast } from 'sonner';
import {
  fetchBacklogItemsRequest,
  fetchBacklogItemsSuccess,
  fetchBacklogItemsFailure,
  fetchBacklogItemRequest,
  fetchBacklogItemSuccess,
  fetchBacklogItemFailure,
  createBacklogItemRequest,
  createBacklogItemSuccess,
  createBacklogItemFailure,
  updateBacklogItemRequest,
  updateBacklogItemSuccess,
  updateBacklogItemFailure,
  deleteBacklogItemRequest,
  deleteBacklogItemSuccess,
  deleteBacklogItemFailure,
} from '../slices/backlogSlice';

// Fetch backlog items epic
export const fetchBacklogItemsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchBacklogItemsRequest.type),
    switchMap((action) =>
      from(backlogService.getBacklogItems(action.payload || {})).pipe(
        map((response) => fetchBacklogItemsSuccess(response)),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to fetch backlog items';
          toast.error(errorMessage);
          return of(fetchBacklogItemsFailure(errorMessage));
        })
      )
    )
  );

// Fetch single backlog item epic
export const fetchBacklogItemEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchBacklogItemRequest.type),
    switchMap((action) =>
      from(backlogService.getBacklogItem(action.payload)).pipe(
        map((item) => fetchBacklogItemSuccess(item)),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to fetch backlog item';
          toast.error(errorMessage);
          return of(fetchBacklogItemFailure(errorMessage));
        })
      )
    )
  );

// Create backlog item epic
export const createBacklogItemEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createBacklogItemRequest.type),
    switchMap((action) =>
      from(backlogService.createBacklogItem(action.payload)).pipe(
        map((item) => {
          toast.success('Backlog item created successfully');
          return createBacklogItemSuccess(item);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to create backlog item';
          toast.error(errorMessage);
          return of(createBacklogItemFailure(errorMessage));
        })
      )
    )
  );

// Update backlog item epic
export const updateBacklogItemEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateBacklogItemRequest.type),
    switchMap((action) =>
      from(backlogService.updateBacklogItem(action.payload.id, action.payload.data)).pipe(
        map((item) => {
          toast.success('Backlog item updated successfully');
          return updateBacklogItemSuccess(item);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to update backlog item';
          toast.error(errorMessage);
          return of(updateBacklogItemFailure(errorMessage));
        })
      )
    )
  );

// Delete backlog item epic
export const deleteBacklogItemEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteBacklogItemRequest.type),
    switchMap((action) =>
      from(backlogService.deleteBacklogItem(action.payload)).pipe(
        map(() => {
          toast.success('Backlog item deleted successfully');
          return deleteBacklogItemSuccess(action.payload);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to delete backlog item';
          toast.error(errorMessage);
          return of(deleteBacklogItemFailure(errorMessage));
        })
      )
    )
  );
