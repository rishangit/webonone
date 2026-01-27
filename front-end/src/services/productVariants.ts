const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductVariantData {
  productId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateProductVariantData extends Partial<CreateProductVariantData> {
  id: string;
}

class ProductVariantsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all variants for a product
  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    const response = await fetch(`${API_BASE_URL}/product-variants/product/${productId}`, {
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

  // Get variant by ID
  async getVariant(id: string): Promise<ProductVariant> {
    const response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
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

  // Create variant
  async createVariant(variantData: CreateProductVariantData): Promise<ProductVariant> {
    const response = await fetch(`${API_BASE_URL}/product-variants`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(variantData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update variant
  async updateVariant(id: string, variantData: Partial<CreateProductVariantData>): Promise<ProductVariant> {
    const response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(variantData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete variant
  async deleteVariant(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-variants/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const productVariantsService = new ProductVariantsService();

