import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface ProductRelatedAttributeValue {
  id: string;
  variantId: string;
  productRelatedAttributeId: string;
  attributeValue?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  productId?: string;
  attributeId?: string;
  attributeName?: string;
  attributeDescription?: string | null;
  valueDataType?: 'text' | 'number' | 'boolean' | 'date' | 'json';
  unitOfMeasure?: string | null;
}

export interface CreateProductRelatedAttributeValueData {
  variantId: string;
  productRelatedAttributeId: string;
  attributeValue?: string | null;
}

export interface UpdateProductRelatedAttributeValueData {
  attributeValue?: string | null;
}

export interface UpsertProductRelatedAttributeValueData {
  variantId: string;
  productRelatedAttributeId: string;
  attributeValue?: string | null;
}

class ProductRelatedAttributeValuesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all attribute values for a specific variant
  async getValuesByVariantId(variantId: string): Promise<ProductRelatedAttributeValue[]> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/variant/${variantId}`, {
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

  // Get attribute value by ID
  async getValue(id: string): Promise<ProductRelatedAttributeValue> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/${id}`, {
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

  // Create attribute value
  async createValue(valueData: CreateProductRelatedAttributeValueData): Promise<ProductRelatedAttributeValue> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(valueData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Upsert attribute value (create or update)
  async upsertValue(valueData: UpsertProductRelatedAttributeValueData): Promise<ProductRelatedAttributeValue> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/upsert`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(valueData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Bulk upsert attribute values for a variant
  async bulkUpsertValues(variantId: string, values: UpsertProductRelatedAttributeValueData[]): Promise<ProductRelatedAttributeValue[]> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/variant/${variantId}/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update attribute value
  async updateValue(id: string, valueData: UpdateProductRelatedAttributeValueData): Promise<ProductRelatedAttributeValue> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(valueData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete attribute value
  async deleteValue(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-related-attribute-values/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const productRelatedAttributeValuesService = new ProductRelatedAttributeValuesService();
