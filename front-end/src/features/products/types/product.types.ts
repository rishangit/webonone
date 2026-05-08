export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number;
  tags: string[] | Tag[];
  createdDate: string;
  lastModified: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  tags?: string[];
  tagIds?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export type { PaginationMeta } from "@/shared/types/pagination";
