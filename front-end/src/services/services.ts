const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007/api';

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  subcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
  status: "Active" | "Inactive" | "Draft";
  provider: {
    name: string;
    avatar: string;
    staffId?: string;
  };
  bookings: {
    thisMonth: number;
    revenue: number;
  };
  tags: (string | Tag)[];
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  subcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
  status?: "Active" | "Inactive" | "Draft";
  providerName?: string;
  providerAvatar?: string;
  staffId?: string;
  imageUrl?: string;
  tagIds?: string[];
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

class ServicesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all services for a company
   */
  async getServices(companyId: string, filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    status?: string;
    categoryId?: string;
  }): Promise<Service[] | { services: Service[]; pagination: PaginationMeta }> {
    console.log('[ServicesService] Fetching services for companyId:', companyId, 'filters:', filters);
    
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    
    if (filters) {
      if (filters.limit !== undefined) params.append('limit', String(filters.limit));
      if (filters.offset !== undefined) params.append('offset', String(filters.offset));
      if (filters.page !== undefined) params.append('page', String(filters.page));
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
    }
    
    const url = `${API_BASE_URL}/services?${params.toString()}`;
    console.log('[ServicesService] API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    console.log('[ServicesService] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ServicesService] Error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[ServicesService] Services data received:', data);
    
    // If pagination metadata exists, return both services and pagination
    if (data.pagination) {
      return {
        services: data.data || [],
        pagination: data.pagination
      };
    }
    
    // Otherwise, return just the services array for backward compatibility
    return data.data || [];
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
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
   * Create new service
   */
  async createService(companyId: string, serviceData: CreateServiceData): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...serviceData,
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
   * Update service
   */
  async updateService(serviceId: string, serviceData: UpdateServiceData): Promise<Service> {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const servicesService = new ServicesService();
export type { CreateServiceData, UpdateServiceData };



