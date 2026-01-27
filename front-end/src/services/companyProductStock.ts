import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyProductStock {
  id: string;
  variantId: string;
  quantity: number;
  costPrice: number;
  sellPrice?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  supplierId?: string | null;
  supplier?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  batchNumber?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyProductStockData {
  variantId: string;
  quantity: number;
  costPrice: number;
  sellPrice?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  supplierId?: string | null;
  batchNumber?: string | null;
}

export interface UpdateCompanyProductStockData {
  quantity?: number;
  costPrice?: number;
  sellPrice?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  supplierId?: string | null;
  batchNumber?: string | null;
  isActive?: boolean;
}

class CompanyProductStockService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getStockByVariantId(variantId: string, activeOnly: boolean = false): Promise<CompanyProductStock[]> {
    const response = await fetch(
      `${API_BASE_URL}/company-product-stock/variant/${variantId}?activeOnly=${activeOnly}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stock entries');
    }

    const result = await response.json();
    return result.data || [];
  }

  async getTotalStock(variantId: string): Promise<number> {
    const response = await fetch(
      `${API_BASE_URL}/company-product-stock/variant/${variantId}/total`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch total stock');
    }

    const result = await response.json();
    return result.data?.totalStock || 0;
  }

  async getStockById(id: string): Promise<CompanyProductStock> {
    const response = await fetch(`${API_BASE_URL}/company-product-stock/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stock entry');
    }

    const result = await response.json();
    return result.data;
  }

  async createStock(data: CreateCompanyProductStockData): Promise<CompanyProductStock> {
    const response = await fetch(`${API_BASE_URL}/company-product-stock`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to create stock entry');
    }

    const result = await response.json();
    return result.data;
  }

  async updateStock(id: string, data: UpdateCompanyProductStockData): Promise<CompanyProductStock> {
    const response = await fetch(`${API_BASE_URL}/company-product-stock/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to update stock entry');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteStock(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-product-stock/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete stock entry');
    }
  }

  async deactivateStock(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-product-stock/${id}/deactivate`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to deactivate stock entry');
    }
  }
}

export const companyProductStockService = new CompanyProductStockService();

