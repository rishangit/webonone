import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { currenciesService } from '../../services/currencies';
import {
  fetchCurrenciesRequest,
  fetchCurrenciesSuccess,
  fetchCurrenciesFailure,
  fetchCurrencyRequest,
  fetchCurrencySuccess,
  fetchCurrencyFailure,
} from '../slices/currenciesSlice';

// Fetch all currencies epic
export const fetchCurrenciesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCurrenciesRequest.type),
    switchMap((action) => {
      const isActive = action.payload?.isActive;
      return from(currenciesService.getCurrencies(isActive)).pipe(
        map((currencies) => fetchCurrenciesSuccess(currencies)),
        catchError((error) => of(fetchCurrenciesFailure(error.message)))
      );
    })
  );

// Fetch single currency by ID epic
export const fetchCurrencyEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchCurrencyRequest.type),
    switchMap((action) =>
      from(currenciesService.getCurrency(action.payload)).pipe(
        map((currency) => fetchCurrencySuccess(currency)),
        catchError((error) => of(fetchCurrencyFailure(error.message)))
      )
    )
  );

// Export all epics
export const currenciesEpics = [
  fetchCurrenciesEpic,
  fetchCurrencyEpic,
];
