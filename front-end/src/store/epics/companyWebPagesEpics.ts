import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { companyWebPagesService } from '@/services/companyWebPages';
import { toast } from 'sonner';
import {
  fetchWebPagesRequest,
  fetchWebPagesSuccess,
  fetchWebPagesFailure,
  fetchWebPageRequest,
  fetchWebPageSuccess,
  fetchWebPageFailure,
  createWebPageRequest,
  createWebPageSuccess,
  createWebPageFailure,
  updateWebPageRequest,
  updateWebPageSuccess,
  updateWebPageFailure,
  deleteWebPageRequest,
  deleteWebPageSuccess,
  deleteWebPageFailure,
} from '../slices/companyWebPagesSlice';

// Fetch all webpages epic
export const fetchWebPagesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchWebPagesRequest.type),
    switchMap((action) =>
      from(companyWebPagesService.getWebPages(action.payload.companyId)).pipe(
        map((webPages) => fetchWebPagesSuccess(webPages)),
        catchError((error) => of(fetchWebPagesFailure(error.message)))
      )
    )
  );

// Fetch single webpage epic
export const fetchWebPageEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchWebPageRequest.type),
    switchMap((action) =>
      from(companyWebPagesService.getWebPageById(action.payload)).pipe(
        map((webPage) => fetchWebPageSuccess(webPage)),
        catchError((error) => of(fetchWebPageFailure(error.message)))
      )
    )
  );

// Create webpage epic
export const createWebPageEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createWebPageRequest.type),
    switchMap((action) =>
      from(companyWebPagesService.createWebPage(action.payload)).pipe(
        map((webPage) => {
          toast.success('Webpage created successfully!');
          return createWebPageSuccess(webPage);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create webpage');
          return of(createWebPageFailure(error.message));
        })
      )
    )
  );

// Update webpage epic
export const updateWebPageEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateWebPageRequest.type),
    switchMap((action) =>
      from(companyWebPagesService.updateWebPage(action.payload.id, action.payload.data)).pipe(
        map((webPage) => {
          toast.success('Webpage updated successfully!');
          return updateWebPageSuccess(webPage);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update webpage');
          return of(updateWebPageFailure(error.message));
        })
      )
    )
  );

// Delete webpage epic
export const deleteWebPageEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteWebPageRequest.type),
    switchMap((action) =>
      from(companyWebPagesService.deleteWebPage(action.payload)).pipe(
        map(() => {
          toast.success('Webpage deleted successfully!');
          return deleteWebPageSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete webpage');
          return of(deleteWebPageFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const companyWebPagesEpics = [
  fetchWebPagesEpic,
  fetchWebPageEpic,
  createWebPageEpic,
  updateWebPageEpic,
  deleteWebPageEpic,
];
