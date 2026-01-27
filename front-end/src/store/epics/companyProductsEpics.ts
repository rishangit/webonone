import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { companyProductsService } from '../../services/companyProducts';
import { toast } from 'sonner';
import {
  fetchCompanyProductsRequest,
  fetchCompanyProductsSuccess,
  fetchCompanyProductsFailure,
  fetchCompanyProductRequest,
  fetchCompanyProductSuccess,
  fetchCompanyProductFailure,
  createCompanyProductRequest,
  createCompanyProductSuccess,
  createCompanyProductFailure,
  updateCompanyProductRequest,
  updateCompanyProductSuccess,
  updateCompanyProductFailure,
  deleteCompanyProductRequest,
  deleteCompanyProductSuccess,
  deleteCompanyProductFailure,
} from '../slices/companyProductsSlice';

// Fetch company products epic
export const fetchCompanyProductsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompanyProductsRequest.type),
    switchMap((action) => {
      // Handle both action.payload and action.payload.payload (in case it's wrapped)
      const payload = action.payload || {};
      const filters = payload.filters || {};
      const companyId = payload.companyId || filters.companyId;
      const systemProductId = payload.systemProductId || filters.systemProductId;
      
      // Combine all filters
      const allFilters = {
        companyId,
        systemProductId,
        ...filters
      };
      
      console.log('FetchCompanyProductsEpic - action received:', action);
      console.log('FetchCompanyProductsEpic - allFilters:', allFilters);
      
      if (!allFilters || (!allFilters.companyId && !allFilters.systemProductId)) {
        console.warn('FetchCompanyProductsEpic - No filters provided, fetching all company products');
      }
      
      return from(companyProductsService.getCompanyProducts(allFilters)).pipe(
        map((result) => {
          console.log('FetchCompanyProductsEpic - received result:', result);
          // Handle both paginated and non-paginated responses
          if (Array.isArray(result)) {
            console.log('FetchCompanyProductsEpic - products count:', result.length);
            return fetchCompanyProductsSuccess(result);
          } else {
            console.log('FetchCompanyProductsEpic - products count:', result.products?.length || 0, 'pagination:', result.pagination);
            return fetchCompanyProductsSuccess(result);
          }
        }),
        catchError((error) => {
          console.error('FetchCompanyProductsEpic - error:', error);
          toast.error(`Failed to fetch company products: ${error.message}`);
          return of(fetchCompanyProductsFailure(error.message));
        })
      );
    })
  );

// Fetch single company product epic
export const fetchCompanyProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompanyProductRequest.type),
    switchMap((action) =>
      from(companyProductsService.getCompanyProductById(action.payload)).pipe(
        map((product) => fetchCompanyProductSuccess(product)),
        catchError((error) => of(fetchCompanyProductFailure(error.message)))
      )
    )
  );

// Create company product epic
export const createCompanyProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createCompanyProductRequest.type),
    switchMap((action) =>
      from(companyProductsService.createCompanyProduct(action.payload)).pipe(
        map((product) => {
          toast.success('Product added to company successfully!');
          return createCompanyProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to add product to company');
          return of(createCompanyProductFailure(error.message));
        })
      )
    )
  );

// Update company product epic
export const updateCompanyProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateCompanyProductRequest.type),
    switchMap((action) =>
      from(companyProductsService.updateCompanyProduct(action.payload.id, action.payload.data)).pipe(
        map((product) => {
          toast.success('Company product updated successfully!');
          return updateCompanyProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update company product');
          return of(updateCompanyProductFailure(error.message));
        })
      )
    )
  );

// Delete company product epic
export const deleteCompanyProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteCompanyProductRequest.type),
    switchMap((action) =>
      from(companyProductsService.deleteCompanyProduct(action.payload)).pipe(
        map(() => {
          toast.success('Company product deleted successfully!');
          return deleteCompanyProductSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete company product');
          return of(deleteCompanyProductFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const companyProductsEpics = [
  fetchCompanyProductsEpic,
  fetchCompanyProductEpic,
  createCompanyProductEpic,
  updateCompanyProductEpic,
  deleteCompanyProductEpic,
];

