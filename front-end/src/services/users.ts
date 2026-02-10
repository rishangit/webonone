import { User } from '../types/user';
import { PaginationMeta } from './products';
import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

class UsersService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all users (with pagination, search, filters)
   */
  async getAllUsers(filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    role?: string | number;
    companyId?: number;
    isActive?: boolean;
  }): Promise<{ users: User[]; pagination: PaginationMeta; stats?: { usersByRole?: Record<string, number> } }> {
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
    if (filters?.role !== undefined) {
      queryParams.append('role', String(filters.role));
    }
    if (filters?.companyId !== undefined) {
      queryParams.append('companyId', String(filters.companyId));
    }
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', String(filters.isActive));
    }

    const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        users: data.data,
        pagination: data.pagination,
        stats: data.stats || undefined
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Get users by company (with pagination, search, filters)
   */
  async getUsersByCompany(companyId: string, filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    role?: string | number;
    isActive?: boolean;
  }): Promise<{ users: User[]; pagination: PaginationMeta }> {
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
    if (filters?.role !== undefined) {
      queryParams.append('role', String(filters.role));
    }
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', String(filters.isActive));
    }

    const url = `${API_BASE_URL}/users/company/${companyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
      users: data.data,
      pagination: data.pagination
    };
  }

  /**
   * Get users by role statistics from users_role table
   */
  async getUsersByRole(): Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE_URL}/users/stats/by-role`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || {};
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string | number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
   * Create a new user (standard method, requires all fields).
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    name: string;
    role: string;
    roleLevel: number;
    companyId?: string | number;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Pre-create a user without a password (for manual company owner adds).
   */
  async preCreateUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    companyId?: string | number;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/pre-create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Add an existing user as a client of the given company.
   * This updates the company_users tracking table on the backend.
   */
  async addUserToCompany(companyId: string, userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/company/${companyId}/add-user`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data as User;
  }
}

export const usersService = new UsersService();

