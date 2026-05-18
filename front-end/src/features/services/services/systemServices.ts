import { config } from "@/config/environment";
import type { PaginationMeta } from "@/features/services/services";

const API_BASE_URL = config.apiBaseUrl;

export interface SystemServiceTag {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}

export interface SystemService {
  id: string;
  name: string;
  description?: string;
  images: string[];
  image?: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number;
  defaultDuration?: number | null;
  defaultPrice?: number | null;
  tags?: SystemServiceTag[];
  createdDate?: string;
  lastModified?: string;
}

export interface FetchSystemServicesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateSystemServiceData {
  name: string;
  description?: string;
  images?: string[];
  defaultDuration?: number | null;
  defaultPrice?: number | null;
  isActive?: boolean;
  isVerified?: boolean;
  tagIds?: string[];
}

export interface UpdateSystemServiceData extends Partial<CreateSystemServiceData> {}

class SystemServicesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getSystemServices(filters?: FetchSystemServicesFilters): Promise<{ services: SystemService[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.append("page", String(filters.page));
    if (filters?.limit !== undefined) params.append("limit", String(filters.limit));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));

    const url = `${API_BASE_URL}/system-services${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    const services: SystemService[] = payload.data || [];
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const total = Number(payload.count || services.length || 0);

    return {
      services,
      pagination: {
        total,
        limit,
        offset: (page - 1) * limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        currentPage: page,
      },
    };
  }

  async getSystemServiceById(id: string): Promise<SystemService> {
    const response = await fetch(`${API_BASE_URL}/system-services/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    return payload.data;
  }

  async createSystemService(data: CreateSystemServiceData): Promise<SystemService> {
    const response = await fetch(`${API_BASE_URL}/system-services`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    return payload.data;
  }

  async updateSystemService(id: string, data: UpdateSystemServiceData): Promise<SystemService> {
    const response = await fetch(`${API_BASE_URL}/system-services/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    return payload.data;
  }

  async deleteSystemService(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/system-services/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const systemServicesService = new SystemServicesService();
