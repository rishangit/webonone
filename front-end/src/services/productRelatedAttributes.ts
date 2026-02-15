import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface ProductRelatedAttribute {
  id: string;
  productId: string;
  attributeId: string;
  isVariantDefining: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields from product_attributes
  attributeName?: string;
  attributeDescription?: string | null;
  valueDataType?: 'text' | 'number' | 'boolean' | 'date' | 'json';
  unitOfMeasure?: string | null;
}

export interface CreateProductRelatedAttributeData {
  productId: string;
  attributeId: string;
  isVariantDefining?: boolean;
}

export interface UpdateProductRelatedAttributeData {
  isVariantDefining?: boolean;
}

class ProductRelatedAttributesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all product-related attributes for a specific product
  async getAttributesByProductId(productId: string): Promise<ProductRelatedAttribute[]> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes/product/${productId}`, {
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

  // Get variant-defining attributes for a specific product
  async getVariantDefiningAttributesByProductId(productId: string): Promise<ProductRelatedAttribute[]> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes/product/${productId}/variant-defining`, {
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

  // Get product-related attribute by ID
  async getAttribute(id: string): Promise<ProductRelatedAttribute> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes/${id}`, {
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

  // Create product-related attribute
  async createAttribute(attributeData: CreateProductRelatedAttributeData): Promise<ProductRelatedAttribute> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes`, {
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

  // Update product-related attribute
  async updateAttribute(id: string, attributeData: UpdateProductRelatedAttributeData): Promise<ProductRelatedAttribute> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes/${id}`, {
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

  // Delete product-related attribute
  async deleteAttribute(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-related-attributes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const productRelatedAttributesService = new ProductRelatedAttributesService();
