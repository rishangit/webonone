import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap, filter } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { Epic } from 'redux-observable';
import { RootState } from '../index';
import { companiesService } from '../../services/companies';
import {
  fetchCompaniesRequest,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  fetchCompanyRequest,
  fetchCompanySuccess,
  fetchCompanyFailure,
  fetchUserCompanyRequest,
  fetchUserCompanySuccess,
  fetchUserCompanyFailure,
  createCompanyRequest,
  createCompanySuccess,
  createCompanyFailure,
  updateCompanyRequest,
  updateCompanySuccess,
  updateCompanyFailure,
  deleteCompanyRequest,
  deleteCompanySuccess,
  deleteCompanyFailure,
  approveCompanyRequest,
  approveCompanySuccess,
  approveCompanyFailure,
  rejectCompanyRequest,
  rejectCompanySuccess,
  rejectCompanyFailure,
  clearUserCompany,
} from '../slices/companiesSlice';
import { loginSuccess, refreshUserSuccess, completeLoginWithRole, logout } from '../slices/authSlice';
import { toast } from 'sonner';

// Fetch all companies epic (following Category pattern - no toast notifications)
export const fetchCompaniesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompaniesRequest.type),
    switchMap((action) =>
      from(companiesService.getAllCompanies(action.payload || {})).pipe(
        map((response) => fetchCompaniesSuccess(response)),
        catchError((error) => of(fetchCompaniesFailure(error.message)))
      )
    )
  );

// Fetch single company epic
export const fetchCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.getCompanyById(action.payload)).pipe(
        map((company) => fetchCompanySuccess(company)),
        catchError((error) => of(fetchCompanyFailure(error.message)))
      )
    )
  );

// Fetch user's company epic (logged-in user's company)
export const fetchUserCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUserCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.getCompanyById(action.payload)).pipe(
        map((company) => fetchUserCompanySuccess(company)),
        catchError((error) => of(fetchUserCompanyFailure(error.message)))
      )
    )
  );

// Auto-fetch user's company when user logs in or refreshes
export const autoFetchUserCompanyEpic: Epic<any, any, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(loginSuccess.type, refreshUserSuccess.type, completeLoginWithRole.type),
    switchMap((action) => {
      const user = action.payload?.user || action.payload;
      const companyId = user?.companyId;
      
      // Only fetch if user has a companyId
      if (companyId) {
        // Check if we already have this company cached
        const currentState = state$.value;
        const userCompany = currentState?.companies?.userCompany;
        
        // Only fetch if we don't have it cached or if it's a different company
        if (!userCompany || userCompany.id !== companyId) {
          return from(companiesService.getCompanyById(companyId)).pipe(
            map((company) => fetchUserCompanySuccess(company)),
            catchError((error) => {
              // Silently fail - don't show error toast for auto-fetch
              return of(fetchUserCompanyFailure(error.message));
            })
          );
        }
      }
      
      return of({ type: 'NO_OP' }); // No operation needed
    })
  );

// Clear user company on logout
export const clearUserCompanyOnLogoutEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(logout.type),
    map(() => clearUserCompany())
  );

// Create company epic
export const createCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.createCompany(action.payload)).pipe(
        map((company) => {
          toast.success('Company registration submitted successfully!');
          return createCompanySuccess(company);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to register company');
          return of(createCompanyFailure(error.message));
        })
      )
    )
  );

// Update company epic
export const updateCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.updateCompany(action.payload.id, action.payload.data)).pipe(
        map((company) => {
          toast.success('Company updated successfully!');
          return updateCompanySuccess(company);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update company');
          return of(updateCompanyFailure(error.message));
        })
      )
    )
  );

// Delete company epic
export const deleteCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.deleteCompany(action.payload)).pipe(
        map(() => {
          toast.success('Company deleted successfully!');
          return deleteCompanySuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete company');
          return of(deleteCompanyFailure(error.message));
        })
      )
    )
  );

// Approve company epic
export const approveCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(approveCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.approveCompany(action.payload)).pipe(
        map((company) => {
          toast.success('Company approved successfully!');
          return approveCompanySuccess(company);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to approve company');
          return of(approveCompanyFailure(error.message));
        })
      )
    )
  );

// Reject company epic
export const rejectCompanyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(rejectCompanyRequest.type),
    switchMap((action) =>
      from(companiesService.rejectCompany(action.payload.id, action.payload.reason)).pipe(
        map((company) => {
          toast.success('Company rejected successfully!');
          return rejectCompanySuccess(company);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to reject company');
          return of(rejectCompanyFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const companiesEpics = [
  fetchCompaniesEpic,
  fetchCompanyEpic,
  fetchUserCompanyEpic,
  autoFetchUserCompanyEpic,
  clearUserCompanyOnLogoutEpic,
  createCompanyEpic,
  updateCompanyEpic,
  deleteCompanyEpic,
  approveCompanyEpic,
  rejectCompanyEpic,
];

