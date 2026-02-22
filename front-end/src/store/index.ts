import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { authSlice } from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import usersReducer from './slices/usersSlice';
import companiesReducer from './slices/companiesSlice';
import productsReducer from './slices/productsSlice';
import systemProductsReducer from './slices/systemProductsSlice';
import systemProductAttributesReducer from './slices/systemProductAttributesSlice';
import unitsOfMeasureReducer from './slices/unitsOfMeasureSlice';
import companyProductsReducer from './slices/companyProductsSlice';
import companyProductVariantsReducer from './slices/companyProductVariantsSlice';
import tagsReducer from './slices/tagsSlice';
import spacesReducer from './slices/spacesSlice';
import servicesReducer from './slices/servicesSlice';
import staffReducer from './slices/staffSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import appointmentHistoryReducer from './slices/appointmentHistorySlice';
import companyWebThemesReducer from './slices/companyWebThemesSlice';
import currenciesReducer from './slices/currenciesSlice';
import backlogReducer from './slices/backlogSlice';
import { rootEpic } from './epics/rootEpic';

// Create epic middleware
const epicMiddleware = createEpicMiddleware();

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    profile: profileReducer,
    users: usersReducer,
    companies: companiesReducer,
    products: productsReducer,
    systemProducts: systemProductsReducer,
    systemProductAttributes: systemProductAttributesReducer,
    unitsOfMeasure: unitsOfMeasureReducer,
    companyProducts: companyProductsReducer,
    companyProductVariants: companyProductVariantsReducer,
    tags: tagsReducer,
    spaces: spacesReducer,
    services: servicesReducer,
    staff: staffReducer,
    appointments: appointmentsReducer,
    appointmentHistory: appointmentHistoryReducer,
    companyWebThemes: companyWebThemesReducer,
    currencies: currenciesReducer,
    backlog: backlogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['auth/signUpRequest', 'auth/signUpSuccess', 'auth/signUpFailure'],
      },
    }).concat(epicMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run epic middleware
epicMiddleware.run(rootEpic);

// Add debugging middleware
const originalDispatch = store.dispatch;
store.dispatch = (action) => {
  console.log('Redux action dispatched:', action);
  return originalDispatch(action);
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
