import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Currency } from '../../services/currencies';

interface CurrenciesState {
  currencies: Currency[]; // All currencies (cached)
  currenciesById: Record<string, Currency>; // Currency cache by ID for quick lookup
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: CurrenciesState = {
  currencies: [],
  currenciesById: {},
  loading: false,
  error: null,
  lastFetch: null,
};

const currenciesSlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {
    // Fetch all currencies
    fetchCurrenciesRequest: (state, action: PayloadAction<{ isActive?: boolean } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCurrenciesSuccess: (state, action: PayloadAction<Currency[]>) => {
      state.loading = false;
      state.currencies = action.payload;
      // Build currenciesById map for quick lookup
      state.currenciesById = action.payload.reduce((acc, currency) => {
        acc[currency.id] = currency;
        return acc;
      }, {} as Record<string, Currency>);
      state.error = null;
      state.lastFetch = Date.now();
    },
    fetchCurrenciesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single currency by ID
    fetchCurrencyRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCurrencySuccess: (state, action: PayloadAction<Currency>) => {
      state.loading = false;
      // Add to currencies array if not already present
      const existingIndex = state.currencies.findIndex(c => c.id === action.payload.id);
      if (existingIndex === -1) {
        state.currencies.push(action.payload);
      } else {
        state.currencies[existingIndex] = action.payload;
      }
      // Update currenciesById cache
      state.currenciesById[action.payload.id] = action.payload;
      state.error = null;
    },
    fetchCurrencyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetCurrencies: () => {
      return initialState;
    },
  },
});

export const {
  fetchCurrenciesRequest,
  fetchCurrenciesSuccess,
  fetchCurrenciesFailure,
  fetchCurrencyRequest,
  fetchCurrencySuccess,
  fetchCurrencyFailure,
  clearError,
  resetCurrencies,
} = currenciesSlice.actions;

export default currenciesSlice.reducer;
