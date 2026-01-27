import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { productsService } from '../../services/products';
import { toast } from 'sonner';
import {
  fetchSystemProductsRequest,
  fetchSystemProductsSuccess,
  fetchSystemProductsFailure,
  fetchSystemProductRequest,
  fetchSystemProductSuccess,
  fetchSystemProductFailure,
  createSystemProductRequest,
  createSystemProductSuccess,
  createSystemProductFailure,
  updateSystemProductRequest,
  updateSystemProductSuccess,
  updateSystemProductFailure,
  deleteSystemProductRequest,
  deleteSystemProductSuccess,
  deleteSystemProductFailure,
} from '../slices/systemProductsSlice';

// Fetch system products epic
export const fetchSystemProductsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemProductsRequest.type),
    switchMap((action) =>
      from(productsService.getProducts(action.payload)).pipe(
        map((result) => fetchSystemProductsSuccess(result)),
        catchError((error) => of(fetchSystemProductsFailure(error.message)))
      )
    )
  );

// Fetch single system product epic
export const fetchSystemProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemProductRequest.type),
    switchMap((action) =>
      from(productsService.getProduct(action.payload)).pipe(
        map((product) => fetchSystemProductSuccess(product)),
        catchError((error) => of(fetchSystemProductFailure(error.message)))
      )
    )
  );

// Create system product epic
export const createSystemProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createSystemProductRequest.type),
    switchMap((action) =>
      from(productsService.createProduct(action.payload)).pipe(
        map((product) => {
          toast.success('System product created successfully!');
          return createSystemProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create system product');
          return of(createSystemProductFailure(error.message));
        })
      )
    )
  );

// Update system product epic
export const updateSystemProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateSystemProductRequest.type),
    switchMap((action) =>
      from(productsService.updateProduct(action.payload.id, action.payload.data)).pipe(
        map((product) => {
          toast.success('System product updated successfully!');
          return updateSystemProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update system product');
          return of(updateSystemProductFailure(error.message));
        })
      )
    )
  );

// Delete system product epic
export const deleteSystemProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteSystemProductRequest.type),
    switchMap((action) =>
      from(productsService.deleteProduct(action.payload)).pipe(
        map(() => {
          toast.success('System product deleted successfully!');
          return deleteSystemProductSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete system product');
          return of(deleteSystemProductFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const systemProductsEpics = [
  fetchSystemProductsEpic,
  fetchSystemProductEpic,
  createSystemProductEpic,
  updateSystemProductEpic,
  deleteSystemProductEpic,
];

