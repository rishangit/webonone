import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface SystemProductAttribute {
  id: string;
  name: string;
  description?: string | null;
  valueDataType: 'text' | 'number' | 'boolean' | 'date' | 'json';
  unitOfMeasure?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemProductAttributeData {
  name: string;
  description?: string | null;
  valueDataType?: 'text' | 'number' | 'boolean' | 'date' | 'json';
  unitOfMeasure?: string | null;
  isActive?: boolean;
}

export interface UpdateSystemProductAttributeData extends Partial<CreateSystemProductAttributeData> {}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

class SystemProductAttributesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all system product attributes (with pagination, search, filters)
  async getAttributes(filters?: {
    productId?: string;
    isActive?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
  }): Promise<{ attributes: SystemProductAttribute[]; pagination: PaginationMeta }> {
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
    if (filters?.productId) {
      queryParams.append('productId', filters.productId);
    }
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', String(filters.isActive));
    }
    if (filters?.type) {
      queryParams.append('type', filters.type);
    }

    const url = `${API_BASE_URL}/system-product-attributes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
      attributes: data.data,
      pagination: data.pagination,
    };
  }

  // Get system product attribute by ID
  async getAttribute(id: string): Promise<SystemProductAttribute> {
    const response = await fetch(`${API_BASE_URL}/system-product-attributes/${id}`, {
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

  // Get all attributes for a specific product
  async getAttributesByProductId(productId: string, filters?: { isActive?: boolean }): Promise<SystemProductAttribute[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('productId', productId);
    
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', String(filters.isActive));
    }

    const url = `${API_BASE_URL}/system-product-attributes/product/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
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

  // Create system product attribute
  async createAttribute(attributeData: CreateSystemProductAttributeData): Promise<SystemProductAttribute> {
    const response = await fetch(`${API_BASE_URL}/system-product-attributes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attributeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update system product attribute
  async updateAttribute(id: string, attributeData: UpdateSystemProductAttributeData): Promise<SystemProductAttribute> {
    const response = await fetch(`${API_BASE_URL}/system-product-attributes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attributeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete system product attribute
  async deleteAttribute(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/system-product-attributes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const systemProductAttributesService = new SystemProductAttributesService();
