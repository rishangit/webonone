import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Product {
  id: string;
  brand?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number;
  tags: string[] | Tag[]; // Support both string array (legacy) and Tag objects
  createdDate: string;
  lastModified: string;
}

export interface CreateProductData {
  brand?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  tags?: string[];
  tagIds?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

class ProductsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all products (with pagination, search, filters, and tags)
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
    
    if (filters?.limit !== undefined) {
      queryParams.append('limit', String(filters.limit));
    }
    if (filters?.offset !== undefined) {
      queryParams.append('offset', String(filters.offset));
    }
    if (filters?.page !== undefined) {
      queryParams.append('page', String(filters.page));
    }
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', String(filters.isActive));
    }
    if (filters?.isVerified !== undefined) {
      queryParams.append('isVerified', String(filters.isVerified));
    }
    if (filters?.tagIds && filters.tagIds.length > 0) {
      filters.tagIds.forEach(tagId => queryParams.append('tagIds', tagId));
    }

    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
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

  // Get product by ID
  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Create product
  async createProduct(productData: CreateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
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

  // Update product
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
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

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const productsService = new ProductsService();

