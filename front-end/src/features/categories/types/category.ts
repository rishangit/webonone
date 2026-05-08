export interface IndustrySubcategory {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  companyCount?: number;
  createdDate?: string;
  lastModified?: string;
}

export interface IndustryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  companyCount?: number;
  createdDate?: string;
  lastModified?: string;
  subcategories?: IndustrySubcategory[];
}
