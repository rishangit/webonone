import { configureStore } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import { authSlice, profileReducer } from "@/features/auth/store";
import { usersReducer } from "@/features/users/store";
import { companiesReducer } from "@/features/companies/store";
import {
  productsReducer,
  systemProductsReducer,
  systemProductAttributesReducer,
  unitsOfMeasureReducer,
  companyProductsReducer,
  companyProductVariantsReducer,
} from "@/features/products/store";
import { tagsReducer } from "@/features/tags/store";
import { spacesReducer } from "@/features/spaces/store";
import { servicesReducer } from "@/features/services/store";
import { staffReducer } from "@/features/staff/store";
import { appointmentsReducer, appointmentHistoryReducer } from "@/features/appointments/store";
import {
  companyWebThemesReducer,
  companyWebPagesReducer,
} from "@/features/website/store";
import { currenciesReducer } from "@/features/sales/store";
import { backlogReducer } from "@/features/backlog/store";
import { rootEpic } from "./epics/rootEpic";

const epicMiddleware = createEpicMiddleware<any, any, any>();

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
    companyWebPages: companyWebPagesReducer,
    currencies: currenciesReducer,
    backlog: backlogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ["auth/signUpRequest", "auth/signUpSuccess", "auth/signUpFailure"],
      },
    }).concat(epicMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

epicMiddleware.run(rootEpic);

const originalDispatch = store.dispatch;
store.dispatch = (action) => {
  console.log("Redux action dispatched:", action);
  return originalDispatch(action);
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
