import { config } from "@/config/environment";
import type { Product, CreateProductData, UpdateProductData } from "@/features/products/types/product.types";
import type { PaginationMeta } from "@/shared/types/pagination";

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyProduct {
  id: string;
  companyId: string;
  systemProductId: string;
  name?: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  isAvailableForPurchase: boolean;
  notes?: string;
  tags?: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    isActive: boolean;
    usageCount: number;
    createdDate: string;
    lastModified: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyProductData {
  companyId: string;
  systemProductId: string;
  isAvailableForPurchase?: boolean;
  notes?: string;
  tagIds?: string[];
}

export interface UpdateCompanyProductData extends Partial<CreateCompanyProductData> {
  companyId?: never;
}

class ProductsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getProducts(filters?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    isVerified?: boolean;
    tagIds?: string[];
  }): Promise<{ products: Product[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();

    if (filters?.limit !== undefined) queryParams.append("limit", String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append("offset", String(filters.offset));
    if (filters?.page !== undefined) queryParams.append("page", String(filters.page));
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.isActive !== undefined) queryParams.append("isActive", String(filters.isActive));
    if (filters?.isVerified !== undefined) queryParams.append("isVerified", String(filters.isVerified));
    if (filters?.tagIds && filters.tagIds.length > 0) {
      filters.tagIds.forEach((tagId) => queryParams.append("tagIds", tagId));
    }

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      products: data.data,
      pagination: data.pagination,
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

class CompanyProductsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getCompanyProducts(filters?: {
    companyId?: string;
    systemProductId?: string;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
  }): Promise<CompanyProduct[] | { products: CompanyProduct[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (filters?.companyId) queryParams.append("companyId", filters.companyId);
    if (filters?.systemProductId) queryParams.append("systemProductId", filters.systemProductId);
    if (filters?.limit !== undefined) queryParams.append("limit", String(filters.limit));
    if (filters?.offset !== undefined) queryParams.append("offset", String(filters.offset));
    if (filters?.page !== undefined) queryParams.append("page", String(filters.page));
    if (filters?.search) queryParams.append("search", filters.search);

    const url = `${API_BASE_URL}/company-products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.pagination) {
      return {
        products: data.data || [],
        pagination: data.pagination,
      };
    }
    return data.data || [];
  }

  async getCompanyProductById(productId: string): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async createCompanyProduct(productData: CreateCompanyProductData): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async updateCompanyProduct(productId: string, productData: UpdateCompanyProductData): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async deleteCompanyProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const productsService = new ProductsService();
export const companyProductsService = new CompanyProductsService();
