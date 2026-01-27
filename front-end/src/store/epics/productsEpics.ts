import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { productsService } from '../../services/products';
import { toast } from 'sonner';
import {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductRequest,
  fetchProductSuccess,
  fetchProductFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
} from '../slices/productsSlice';

// Fetch products epic
export const fetchProductsEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchProductsRequest.type),
    switchMap((action) =>
      from(productsService.getProducts(action.payload)).pipe(
        map((products) => fetchProductsSuccess(products)),
        catchError((error) => of(fetchProductsFailure(error.message)))
      )
    )
  );

// Fetch single product epic
export const fetchProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchProductRequest.type),
    switchMap((action) =>
      from(productsService.getProduct(action.payload)).pipe(
        map((product) => fetchProductSuccess(product)),
        catchError((error) => of(fetchProductFailure(error.message)))
      )
    )
  );

// Create product epic
export const createProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createProductRequest.type),
    switchMap((action) =>
      from(productsService.createProduct(action.payload)).pipe(
        map((product) => {
          toast.success('Product created successfully!');
          return createProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to create product');
          return of(createProductFailure(error.message));
        })
      )
    )
  );

// Update product epic
export const updateProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateProductRequest.type),
    switchMap((action) =>
      from(productsService.updateProduct(action.payload.id, action.payload.data)).pipe(
        map((product) => {
          toast.success('Product updated successfully!');
          return updateProductSuccess(product);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to update product');
          return of(updateProductFailure(error.message));
        })
      )
    )
  );

// Delete product epic
export const deleteProductEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteProductRequest.type),
    switchMap((action) =>
      from(productsService.deleteProduct(action.payload)).pipe(
        map(() => {
          toast.success('Product deleted successfully!');
          return deleteProductSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to delete product');
          return of(deleteProductFailure(error.message));
        })
      )
    )
  );

// Export all epics
export const productsEpics = [
  fetchProductsEpic,
  fetchProductEpic,
  createProductEpic,
  updateProductEpic,
  deleteProductEpic,
];



