import { categoryService as databaseCategoryService } from "@/shared/services/database";
import type { IndustryCategory } from "../types";

export const categoriesService = {
  getAll: (): Promise<IndustryCategory[]> =>
    databaseCategoryService.getAll() as Promise<IndustryCategory[]>,
  getById: (id: string) =>
    databaseCategoryService.getById(id) as Promise<IndustryCategory | null>,
};
