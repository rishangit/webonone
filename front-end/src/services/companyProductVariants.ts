const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface CompanyProductVariant {
  id: string;
  companyProductId: string;
  systemProductVariantId?: string; // Reference to system product variant
  name: string;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  type: 'sell' | 'service' | 'both';
  isDefault: boolean;
  isActive: boolean;
  activeStockId?: string | null; // Reference to active stock entry
  minStock?: number;
  maxStock?: number;
  activeStock?: {
    costPrice: number;
    sellPrice?: number | null;
    quantity: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyProductVariantData {
  companyProductId: string;
  systemProductVariantId?: string; // Reference to system product variant (required for system products)
  name?: string; // Required for custom products only
  sku?: string; // Required for custom products only
  color?: string;
  size?: string;
  weight?: string;
  material?: string;
  type?: 'sell' | 'service' | 'both';
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateCompanyProductVariantData extends Partial<CreateCompanyProductVariantData> {
  companyProductId?: never;
  activeStockId?: string | null;
}

class CompanyProductVariantsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get variants by company product ID
   */
  async getVariantsByCompanyProductId(companyProductId: string): Promise<CompanyProductVariant[]> {
    const response = await fetch(`${API_BASE_URL}/company-product-variants?companyProductId=${companyProductId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get variant by ID
   */
  async getVariantById(variantId: string): Promise<CompanyProductVariant> {
    const response = await fetch(`${API_BASE_URL}/company-product-variants/${variantId}`, {
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
   * Create a single variant
   */
  async createVariant(variantData: CreateCompanyProductVariantData): Promise<CompanyProductVariant> {
    const response = await fetch(`${API_BASE_URL}/company-product-variants`, {
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

  /**
   * Create multiple variants (bulk)
   */
  async createVariants(companyProductId: string, variants: CreateCompanyProductVariantData[]): Promise<CompanyProductVariant[]> {
    console.log('🌐 Service: Creating variants via API');
    console.log('🌐 URL:', `${API_BASE_URL}/company-product-variants/bulk`);
    console.log('🌐 Company Product ID:', companyProductId);
    console.log('🌐 Variants count:', variants.length);
    console.log('🌐 Variants data:', JSON.stringify(variants, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/company-product-variants/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ companyProductId, variants }),
    });

    console.log('🌐 Response status:', response.status);
    console.log('🌐 Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Service: API error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Service: Variants created successfully:', data.data?.length || 0);
    return data.data || [];
  }

  /**
   * Update variant
   */
  async updateVariant(variantId: string, variantData: UpdateCompanyProductVariantData): Promise<CompanyProductVariant> {
    const response = await fetch(`${API_BASE_URL}/company-product-variants/${variantId}`, {
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

  /**
   * Delete variant
   */
  async deleteVariant(variantId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-product-variants/${variantId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyProductVariantsService = new CompanyProductVariantsService();
export type { CompanyProductVariant, CreateCompanyProductVariantData, UpdateCompanyProductVariantData };

