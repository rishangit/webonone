import { combineEpics } from 'redux-observable';
import {
  signUpEpic,
  loginEpic,
  logoutEpic,
  refreshUserEpic,
  completeLoginWithRoleEpic
} from './authEpics';
import { profileEpics } from './profileEpics';
import { usersEpics } from './usersEpics';
import { companiesEpics } from './companiesEpics';
import { productsEpics } from './productsEpics';
import { systemProductsEpics } from './systemProductsEpics';
import { systemProductAttributesEpics } from './systemProductAttributesEpics';
import { unitsOfMeasureEpics } from './unitsOfMeasureEpics';
import { companyProductsEpics } from './companyProductsEpics';
import { companyProductVariantsEpics } from './companyProductVariantsEpics';
import {
  fetchTagsEpic,
  fetchTagEpic,
  createTagEpic,
  updateTagEpic,
  deleteTagEpic
} from './tagsEpics';
import { spacesEpics } from './spacesEpics';
import { servicesEpics } from './servicesEpics';
import { staffEpics } from './staffEpics';
import { appointmentsEpics } from './appointmentsEpics';
import { companyWebThemesEpics } from './companyWebThemesEpics';
import {
  fetchAppointmentHistoryEpic,
  fetchUserAppointmentHistoryEpic
} from './appointmentHistoryEpics';
import { currenciesEpics } from './currenciesEpics';
import {
  fetchBacklogItemsEpic,
  fetchBacklogItemEpic,
  createBacklogItemEpic,
  updateBacklogItemEpic,
  deleteBacklogItemEpic
} from './backlogEpics';

export const rootEpic = combineEpics(
  signUpEpic,
  loginEpic,
  completeLoginWithRoleEpic,
  logoutEpic,
  refreshUserEpic,
  ...profileEpics,
  ...usersEpics,
  ...companiesEpics,
  ...productsEpics,
  ...systemProductsEpics,
  ...systemProductAttributesEpics,
  ...unitsOfMeasureEpics,
  ...companyProductsEpics,
  ...companyProductVariantsEpics,
  fetchTagsEpic,
  fetchTagEpic,
  createTagEpic,
  updateTagEpic,
  deleteTagEpic,
  ...spacesEpics,
  ...servicesEpics,
  ...staffEpics,
  ...appointmentsEpics,
  fetchAppointmentHistoryEpic,
  fetchUserAppointmentHistoryEpic,
  ...companyWebThemesEpics,
  ...currenciesEpics,
  fetchBacklogItemsEpic,
  fetchBacklogItemEpic,
  createBacklogItemEpic,
  updateBacklogItemEpic,
  deleteBacklogItemEpic
);
