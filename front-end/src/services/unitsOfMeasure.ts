import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface UnitsOfMeasure {
  id: string;
  unitName: string;
  symbol: string;
  baseUnit?: string | null;
  multiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitsOfMeasureData {
  unitName: string;
  symbol: string;
  baseUnit?: string | null;
  multiplier?: number;
  isActive?: boolean;
}

export interface UpdateUnitsOfMeasureData extends Partial<CreateUnitsOfMeasureData> {}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

class UnitsOfMeasureService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all units of measure (with pagination, search, filters)
  async getUnits(filters?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
  }): Promise<{ units: UnitsOfMeasure[]; pagination: PaginationMeta }> {
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

    const url = `${API_BASE_URL}/units-of-measure${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
      units: data.data,
      pagination: data.pagination,
    };
  }

  // Get all active units (for dropdowns)
  async getActiveUnits(): Promise<UnitsOfMeasure[]> {
    const response = await fetch(`${API_BASE_URL}/units-of-measure/active`, {
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

  // Get unit by ID
  async getUnit(id: string): Promise<UnitsOfMeasure> {
    const response = await fetch(`${API_BASE_URL}/units-of-measure/${id}`, {
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

  // Create unit of measure
  async createUnit(unitData: CreateUnitsOfMeasureData): Promise<UnitsOfMeasure> {
    const response = await fetch(`${API_BASE_URL}/units-of-measure`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(unitData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update unit of measure
  async updateUnit(id: string, unitData: UpdateUnitsOfMeasureData): Promise<UnitsOfMeasure> {
    const response = await fetch(`${API_BASE_URL}/units-of-measure/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(unitData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete unit of measure
  async deleteUnit(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/units-of-measure/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const unitsOfMeasureService = new UnitsOfMeasureService();
