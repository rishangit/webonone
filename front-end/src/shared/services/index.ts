export { apiService } from "./api";
export { database } from "./database";
export {
  fileUploadService,
  type FileUploadData,
} from "./fileUploadService";
export { currenciesService } from "./currencies";
export type { Currency, CreateCurrencyData } from "./currencies";

/** Cross-feature service clients (re-exported from feature modules). */
export * from "./companies-public";
export * from "./sales-public";
export * from "./products-company-public";
export * from "./auth-public";
