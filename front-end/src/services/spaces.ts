import { PaginationMeta } from './products';
import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface Space {
  id: string;
  companyId: string;
  name: string;
  capacity: number;
  status: "Active" | "Inactive" | "Maintenance";
  description?: string;
  imageUrl?: string;
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
  appointments?: {
    today: number;
    thisWeek: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpaceData {
  name: string;
  capacity: number;
  status?: "Active" | "Inactive" | "Maintenance";
  description?: string;
  imageUrl?: string;
  tagIds?: string[];
}

export interface UpdateSpaceData extends Partial<CreateSpaceData> {}

class SpacesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all spaces for a company (with pagination, search, filters)
   */
  async getSpaces(filters?: {
    companyId?: string;
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    status?: string;
  }): Promise<{ spaces: Space[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    
    if (filters?.companyId) {
      params.append('companyId', filters.companyId);
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }
    if (filters?.offset !== undefined) {
      params.append('offset', String(filters.offset));
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const response = await fetch(`${API_BASE_URL}/spaces?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      spaces: data.data || [],
      pagination: data.pagination || {
        total: 0,
        limit: filters?.limit || 12,
        offset: filters?.offset || 0,
        totalPages: 0,
        currentPage: filters?.page || 1,
      },
    };
  }

  /**
   * Get space by ID
   */
  async getSpaceById(spaceId: string): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
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
   * Create new space
   */
  async createSpace(companyId: string, spaceData: CreateSpaceData): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...spaceData,
        companyId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update space
   */
  async updateSpace(spaceId: string, spaceData: UpdateSpaceData): Promise<Space> {
    const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(spaceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete space
   */
  async deleteSpace(spaceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const spacesService = new SpacesService();
export type { CreateSpaceData, UpdateSpaceData };

