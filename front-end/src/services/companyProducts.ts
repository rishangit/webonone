const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface CompanyProduct {
  id: string;
  companyId: string;
  systemProductId: string; // Required - references system product
  // System product data (populated from join)
  name?: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  brand?: string;
  // Company-specific data (type, price, stock are now in variants)
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
  systemProductId: string; // Required - references system product
  // No duplicate fields: name, description, sku, imageUrl come from system product
  // type, price, stock are now in variants
  isAvailableForPurchase?: boolean;
  notes?: string;
  tagIds?: string[];
}

export interface UpdateCompanyProductData extends Partial<CreateCompanyProductData> {
  companyId?: never; // Cannot update companyId
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

class CompanyProductsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all company products
   */
  async getCompanyProducts(filters?: { 
    companyId?: string; 
    systemProductId?: string;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
  }): Promise<CompanyProduct[] | { products: CompanyProduct[]; pagination: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (filters?.companyId) {
      queryParams.append('companyId', filters.companyId);
    }
    if (filters?.systemProductId) {
      queryParams.append('systemProductId', filters.systemProductId);
    }
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

    const url = `${API_BASE_URL}/company-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('CompanyProductsService.getCompanyProducts - URL:', url);
    console.log('CompanyProductsService.getCompanyProducts - filters:', filters);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    console.log('CompanyProductsService.getCompanyProducts - response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('CompanyProductsService.getCompanyProducts - error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('CompanyProductsService.getCompanyProducts - response data:', data);
    
    // If pagination metadata exists, return both products and pagination
    if (data.pagination) {
      return {
        products: data.data || [],
        pagination: data.pagination
      };
    }
    
    // Otherwise, return just the products array for backward compatibility
    return data.data || [];
  }

  /**
   * Get company product by ID
   */
  async getCompanyProductById(productId: string): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
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

  /**
   * Create company product
   */
  async createCompanyProduct(productData: CreateCompanyProductData): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products`, {
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

  /**
   * Update company product
   */
  async updateCompanyProduct(productId: string, productData: UpdateCompanyProductData): Promise<CompanyProduct> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
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

  /**
   * Delete company product
   */
  async deleteCompanyProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-products/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyProductsService = new CompanyProductsService();
export type { CompanyProduct, CreateCompanyProductData, UpdateCompanyProductData, PaginationMeta };

