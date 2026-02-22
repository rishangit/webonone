import { PaginationMeta } from './products';
import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  type: 'Issue' | 'Feature';
  status: 'New' | 'Active' | 'Done';
  screenshotPath?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    name: string;
  } | null;
}

export interface CreateBacklogItemData {
  title: string;
  description: string;
  type: 'Issue' | 'Feature';
  screenshotPath?: string | null;
}

export interface UpdateBacklogItemData extends Partial<CreateBacklogItemData> {
  status?: 'New' | 'Active' | 'Done';
}

class BacklogService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get all backlog items with pagination and filters
  async getBacklogItems(filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    type?: 'Issue' | 'Feature';
    status?: 'New' | 'Active' | 'Done';
    createdBy?: string;
  }): Promise<{ items: BacklogItem[]; pagination: PaginationMeta }> {
    const url = new URL(`${API_BASE_URL}/backlog`);
    
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
      if (filters.type) {
        url.searchParams.append('type', filters.type);
      }
      if (filters.status) {
        url.searchParams.append('status', filters.status);
      }
      if (filters.createdBy) {
        url.searchParams.append('createdBy', filters.createdBy);
      }
    }

    const headers = this.getAuthHeaders();
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        items: data.data || [],
        pagination: data.pagination || null,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get backlog item by ID
  async getBacklogItem(id: string): Promise<BacklogItem> {
    const response = await fetch(`${API_BASE_URL}/backlog/${id}`, {
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

  // Create backlog item
  async createBacklogItem(itemData: CreateBacklogItemData): Promise<BacklogItem> {
    const response = await fetch(`${API_BASE_URL}/backlog`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Update backlog item
  async updateBacklogItem(id: string, itemData: UpdateBacklogItemData): Promise<BacklogItem> {
    const response = await fetch(`${API_BASE_URL}/backlog/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Delete backlog item
  async deleteBacklogItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/backlog/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const backlogService = new BacklogService();
