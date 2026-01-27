import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { companyProductVariantsService } from '../../services/companyProductVariants';
import { toast } from 'sonner';
import {
  fetchCompanyProductVariantsRequest,
  fetchCompanyProductVariantsSuccess,
  fetchCompanyProductVariantsFailure,
  fetchCompanyProductVariantRequest,
  fetchCompanyProductVariantSuccess,
  fetchCompanyProductVariantFailure,
  createCompanyProductVariantRequest,
  createCompanyProductVariantSuccess,
  createCompanyProductVariantFailure,
  createCompanyProductVariantsRequest,
  createCompanyProductVariantsSuccess,
  createCompanyProductVariantsFailure,
  updateCompanyProductVariantRequest,
  updateCompanyProductVariantSuccess,
  updateCompanyProductVariantFailure,
  deleteCompanyProductVariantRequest,
  deleteCompanyProductVariantSuccess,
  deleteCompanyProductVariantFailure,
} from '../slices/companyProductVariantsSlice';

// Fetch variants for a company product epic
export const fetchCompanyProductVariantsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompanyProductVariantsRequest.type),
    switchMap((action) =>
      from(companyProductVariantsService.getVariantsByCompanyProductId(action.payload)).pipe(
        map((variants) => fetchCompanyProductVariantsSuccess(variants || [])),
        catchError((error) => {
          console.error('FetchCompanyProductVariantsEpic - error:', error);
          toast.error(`Failed to fetch variants: ${error.message}`);
          return of(fetchCompanyProductVariantsFailure(error.message));
        })
      )
    )
  );

// Fetch single variant epic
export const fetchCompanyProductVariantEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCompanyProductVariantRequest.type),
    switchMap((action) =>
      from(companyProductVariantsService.getVariantById(action.payload)).pipe(
        map((variant) => fetchCompanyProductVariantSuccess(variant)),
        catchError((error) => of(fetchCompanyProductVariantFailure(error.message)))
      )
    )
  );

// Create single variant epic
export const createCompanyProductVariantEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createCompanyProductVariantRequest.type),
    switchMap((action) =>
      from(companyProductVariantsService.createVariant(action.payload)).pipe(
        map((variant) => {
          toast.success('Variant created successfully!');
          return createCompanyProductVariantSuccess(variant);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create variant');
          return of(createCompanyProductVariantFailure(error.message));
        })
      )
    )
  );

// Create multiple variants epic (bulk)
export const createCompanyProductVariantsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createCompanyProductVariantsRequest.type),
    switchMap((action) => {
      console.log('🔥 CreateCompanyProductVariantsEpic triggered');
      console.log('📦 Action payload:', action.payload);
      console.log('📦 Company Product ID:', action.payload.companyProductId);
      console.log('📦 Variants count:', action.payload.variants?.length || 0);
      
      return from(companyProductVariantsService.createVariants(action.payload.companyProductId, action.payload.variants)).pipe(
        map((variants) => {
          console.log('✅ Variants created successfully:', variants.length);
          toast.success(`${variants.length} variant(s) created successfully!`);
          return createCompanyProductVariantsSuccess(variants);
        }),
        catchError((error) => {
          console.error('❌ Error in CreateCompanyProductVariantsEpic:', error);
          toast.error(error.message || 'Failed to create variants');
          return of(createCompanyProductVariantsFailure(error.message));
        })
      );
    })
  );

// Update variant epic
export const updateCompanyProductVariantEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateCompanyProductVariantRequest.type),
    switchMap((action) =>
      from(companyProductVariantsService.updateVariant(action.payload.id, action.payload.data)).pipe(
        map((variant) => {
          toast.success('Variant updated successfully!');
          return updateCompanyProductVariantSuccess(variant);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update variant');
          return of(updateCompanyProductVariantFailure(error.message));
        })
      )
    )
  );

// Delete variant epic
export const deleteCompanyProductVariantEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteCompanyProductVariantRequest.type),
    switchMap((action) =>
      from(companyProductVariantsService.deleteVariant(action.payload)).pipe(
        map(() => {
          toast.success('Variant deleted successfully!');
          return deleteCompanyProductVariantSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete variant');
          return of(deleteCompanyProductVariantFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const companyProductVariantsEpics = [
  fetchCompanyProductVariantsEpic,
  fetchCompanyProductVariantEpic,
  createCompanyProductVariantEpic,
  createCompanyProductVariantsEpic,
  updateCompanyProductVariantEpic,
  deleteCompanyProductVariantEpic,
];

