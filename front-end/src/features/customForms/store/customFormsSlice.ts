import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CompanyCustomForm,
  CreateCustomFormData,
  UpdateCustomFormData,
} from '../services/companyCustomForms';
import { CompanyCustomFormSubmission } from '../services/companyCustomFormSubmissions';

interface CustomFormsState {
  forms: CompanyCustomForm[];
  currentForm: CompanyCustomForm | null;
  submissions: CompanyCustomFormSubmission[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomFormsState = {
  forms: [],
  currentForm: null,
  submissions: [],
  loading: false,
  error: null,
};

const customFormsSlice = createSlice({
  name: 'customForms',
  initialState,
  reducers: {
    fetchCustomFormsRequest: (state, _action: PayloadAction<{ companyId: string; activeOnly?: boolean }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCustomFormsSuccess: (state, action: PayloadAction<CompanyCustomForm[]>) => {
      state.loading = false;
      state.forms = action.payload;
    },
    fetchCustomFormsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchCustomFormRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCustomFormSuccess: (state, action: PayloadAction<CompanyCustomForm>) => {
      state.loading = false;
      state.currentForm = action.payload;
    },
    fetchCustomFormFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createCustomFormRequest: (state, _action: PayloadAction<CreateCustomFormData>) => {
      state.loading = true;
      state.error = null;
    },
    createCustomFormSuccess: (state, action: PayloadAction<CompanyCustomForm>) => {
      state.loading = false;
      state.forms.push(action.payload);
    },
    createCustomFormFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateCustomFormRequest: (
      state,
      _action: PayloadAction<{ id: string; data: UpdateCustomFormData }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateCustomFormSuccess: (state, action: PayloadAction<CompanyCustomForm>) => {
      state.loading = false;
      const idx = state.forms.findIndex((f) => f.id === action.payload.id);
      if (idx !== -1) state.forms[idx] = action.payload;
      if (state.currentForm?.id === action.payload.id) {
        state.currentForm = action.payload;
      }
    },
    updateCustomFormFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    duplicateCustomFormRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    duplicateCustomFormSuccess: (state, action: PayloadAction<CompanyCustomForm>) => {
      state.loading = false;
      state.forms.unshift(action.payload);
    },
    duplicateCustomFormFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteCustomFormRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteCustomFormSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.forms = state.forms.filter((f) => f.id !== action.payload);
      if (state.currentForm?.id === action.payload) state.currentForm = null;
    },
    deleteCustomFormFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchSubmissionsRequest: (state, _action: PayloadAction<{ appointmentId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubmissionsSuccess: (state, action: PayloadAction<CompanyCustomFormSubmission[]>) => {
      state.loading = false;
      state.submissions = action.payload;
    },
    fetchSubmissionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearCustomFormsError: (state) => {
      state.error = null;
    },
    clearCurrentCustomForm: (state) => {
      state.currentForm = null;
    },
  },
});

export const {
  fetchCustomFormsRequest,
  fetchCustomFormsSuccess,
  fetchCustomFormsFailure,
  fetchCustomFormRequest,
  fetchCustomFormSuccess,
  fetchCustomFormFailure,
  createCustomFormRequest,
  createCustomFormSuccess,
  createCustomFormFailure,
  updateCustomFormRequest,
  updateCustomFormSuccess,
  updateCustomFormFailure,
  duplicateCustomFormRequest,
  duplicateCustomFormSuccess,
  duplicateCustomFormFailure,
  deleteCustomFormRequest,
  deleteCustomFormSuccess,
  deleteCustomFormFailure,
  fetchSubmissionsRequest,
  fetchSubmissionsSuccess,
  fetchSubmissionsFailure,
  clearCustomFormsError,
  clearCurrentCustomForm,
} = customFormsSlice.actions;

export const customFormsReducer = customFormsSlice.reducer;
