import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { tagsService } from '../../services/tags';
import { toast } from 'sonner';
import {
  fetchTagsRequest,
  fetchTagsSuccess,
  fetchTagsFailure,
  fetchTagRequest,
  fetchTagSuccess,
  fetchTagFailure,
  createTagRequest,
  createTagSuccess,
  createTagFailure,
  updateTagRequest,
  updateTagSuccess,
  updateTagFailure,
  deleteTagRequest,
  deleteTagSuccess,
  deleteTagFailure,
} from '../slices/tagsSlice';

// Fetch tags epic
export const fetchTagsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchTagsRequest.type),
    switchMap((action) =>
      from(tagsService.getTags(action.payload || {})).pipe(
        map((response) => fetchTagsSuccess(response)),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to fetch tags';
          toast.error(errorMessage);
          return of(fetchTagsFailure(errorMessage));
        })
      )
    )
  );

// Fetch single tag epic
export const fetchTagEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchTagRequest.type),
    switchMap((action) =>
      from(tagsService.getTag(action.payload)).pipe(
        map((tag) => fetchTagSuccess(tag)),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to fetch tag';
          toast.error(errorMessage);
          return of(fetchTagFailure(errorMessage));
        })
      )
    )
  );

// Create tag epic
export const createTagEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createTagRequest.type),
    switchMap((action) =>
      from(tagsService.createTag(action.payload)).pipe(
        map((tag) => {
          toast.success('Tag created successfully');
          return createTagSuccess(tag);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to create tag';
          toast.error(errorMessage);
          return of(createTagFailure(errorMessage));
        })
      )
    )
  );

// Update tag epic
export const updateTagEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateTagRequest.type),
    switchMap((action) =>
      from(tagsService.updateTag(action.payload.id, action.payload.data)).pipe(
        map((tag) => {
          toast.success('Tag updated successfully');
          return updateTagSuccess(tag);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to update tag';
          toast.error(errorMessage);
          return of(updateTagFailure(errorMessage));
        })
      )
    )
  );

// Delete tag epic
export const deleteTagEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteTagRequest.type),
    switchMap((action) =>
      from(tagsService.deleteTag(action.payload)).pipe(
        map(() => {
          toast.success('Tag deleted successfully');
          return deleteTagSuccess(action.payload);
        }),
        catchError((error) => {
          const errorMessage = error.message || 'Failed to delete tag';
          toast.error(errorMessage);
          return of(deleteTagFailure(errorMessage));
        })
      )
    )
  );

