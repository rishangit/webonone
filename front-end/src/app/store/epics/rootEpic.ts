import { combineEpics } from "redux-observable";
import {
  signUpEpic,
  loginEpic,
  logoutEpic,
  refreshUserEpic,
  completeLoginWithRoleEpic,
  profileEpics,
} from "@/features/auth/store";
import { usersEpics } from "@/features/users/store";
import { companiesEpics } from "@/features/companies/store";
import {
  productsEpics,
  systemProductsEpics,
  systemProductAttributesEpics,
  unitsOfMeasureEpics,
  companyProductsEpics,
  companyProductVariantsEpics,
} from "@/features/products/store";
import {
  fetchTagsEpic,
  fetchTagEpic,
  createTagEpic,
  updateTagEpic,
  deleteTagEpic,
} from "@/features/tags/store";
import { spacesEpics } from "@/features/spaces/store";
import { servicesEpics, systemServicesEpics } from "@/features/services/store";
import { staffEpics } from "@/features/staff/store";
import {
  appointmentsEpics,
  fetchAppointmentHistoryEpic,
  fetchUserAppointmentHistoryEpic,
} from "@/features/appointments/store";
import {
  companyWebThemesEpics,
  companyWebPagesEpics,
} from "@/features/website/store";
import { currenciesEpics } from "@/features/sales/store";
import {
  fetchBacklogItemsEpic,
  fetchBacklogItemEpic,
  createBacklogItemEpic,
  updateBacklogItemEpic,
  deleteBacklogItemEpic,
} from "@/features/backlog/store";

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
  ...systemServicesEpics,
  ...staffEpics,
  ...appointmentsEpics,
  fetchAppointmentHistoryEpic,
  fetchUserAppointmentHistoryEpic,
  ...companyWebThemesEpics,
  ...companyWebPagesEpics,
  ...currenciesEpics,
  fetchBacklogItemsEpic,
  fetchBacklogItemEpic,
  createBacklogItemEpic,
  updateBacklogItemEpic,
  deleteBacklogItemEpic,
);
