import { apiEndpoints } from '../config/environment';

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  rounding: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCurrencyData {
  name: string;
  symbol: string;
  decimals?: number;
  rounding?: number;
}

class CurrenciesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getCurrencies(isActive?: boolean): Promise<Currency[]> {
    try {
      const url = isActive !== undefined 
        ? `${apiEndpoints.currencies.list}?isActive=${isActive}`
        : apiEndpoints.currencies.list;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch currencies: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  async getCurrency(id: string): Promise<Currency> {
    try {
      const response = await fetch(`${apiEndpoints.currencies.list}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch currency: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching currency:', error);
      throw error;
    }
  }

  async createCurrency(data: CreateCurrencyData): Promise<Currency> {
    try {
      const response = await fetch(apiEndpoints.currencies.create, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create currency: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating currency:', error);
      throw error;
    }
  }
}

export const currenciesService = new CurrenciesService();
