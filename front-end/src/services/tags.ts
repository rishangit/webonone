import { PaginationMeta } from './products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
}

export interface CreateTagData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

class TagsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all tags with pagination and filters
  async getTags(filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ tags: Tag[]; pagination: PaginationMeta }> {
    const url = new URL(`${API_BASE_URL}/tags`);
    
    if (filters) {
      if (filters.limit !== undefined) {
        url.searchParams.append('limit', String(filters.limit));
      }
      if (filters.offset !== undefined) {
        url.searchParams.append('offset', String(filters.offset));
      }
      if (filters.page !== undefined) {
        url.searchParams.append('page', String(filters.page));
      }
      if (filters.search) {
        url.searchParams.append('search', filters.search);
      }
      if (filters.isActive !== undefined) {
        url.searchParams.append('isActive', String(filters.isActive));
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      tags: data.data,
      pagination: data.pagination,
    };
  }

  // Get tag by ID
  async getTag(id: string): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
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

  // Create tag
  async createTag(tagData: CreateTagData): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tagData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update tag
  async updateTag(id: string, tagData: UpdateTagData): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tagData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete tag
  async deleteTag(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const tagsService = new TagsService();

