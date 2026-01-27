import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { companyWebThemesService } from '../../services/companyWebThemes';
import { toast } from 'sonner';
import {
  fetchThemesRequest,
  fetchThemesSuccess,
  fetchThemesFailure,
  fetchThemeRequest,
  fetchThemeSuccess,
  fetchThemeFailure,
  createThemeRequest,
  createThemeSuccess,
  createThemeFailure,
  updateThemeRequest,
  updateThemeSuccess,
  updateThemeFailure,
  deleteThemeRequest,
  deleteThemeSuccess,
  deleteThemeFailure,
} from '../slices/companyWebThemesSlice';

// Fetch all themes epic
export const fetchThemesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchThemesRequest.type),
    switchMap((action) =>
      from(companyWebThemesService.getThemes(action.payload.companyId)).pipe(
        map((themes) => fetchThemesSuccess(themes)),
        catchError((error) => of(fetchThemesFailure(error.message)))
      )
    )
  );

// Fetch single theme epic
export const fetchThemeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchThemeRequest.type),
    switchMap((action) =>
      from(companyWebThemesService.getThemeById(action.payload)).pipe(
        map((theme) => fetchThemeSuccess(theme)),
        catchError((error) => of(fetchThemeFailure(error.message)))
      )
    )
  );

// Create theme epic
export const createThemeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createThemeRequest.type),
    switchMap((action) =>
      from(companyWebThemesService.createTheme(action.payload)).pipe(
        map((theme) => {
          toast.success('Theme created successfully!');
          return createThemeSuccess(theme);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create theme');
          return of(createThemeFailure(error.message));
        })
      )
    )
  );

// Update theme epic
export const updateThemeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateThemeRequest.type),
    switchMap((action) =>
      from(companyWebThemesService.updateTheme(action.payload.id, action.payload.data)).pipe(
        map((theme) => {
          toast.success('Theme updated successfully!');
          return updateThemeSuccess(theme);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update theme');
          return of(updateThemeFailure(error.message));
        })
      )
    )
  );

// Delete theme epic
export const deleteThemeEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteThemeRequest.type),
    switchMap((action) =>
      from(companyWebThemesService.deleteTheme(action.payload)).pipe(
        map(() => {
          toast.success('Theme deleted successfully!');
          return deleteThemeSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete theme');
          return of(deleteThemeFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const companyWebThemesEpics = [
  fetchThemesEpic,
  fetchThemeEpic,
  createThemeEpic,
  updateThemeEpic,
  deleteThemeEpic,
];
