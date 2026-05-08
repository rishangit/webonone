import { PaginationMeta } from '@/shared/types/pagination';
import { config } from '@/config/environment';

const API_BASE_URL = config.apiBaseUrl;

export type CompanySize = '1-5' | '6-10' | '11-20' | '21-50' | '51-200' | '201-500' | '500+';

interface Company {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  categoryId?: number;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  website?: string;
  companySize?: CompanySize;
  logo?: string;
  currencyId?: string;
  selectedEntities?: string[] | null;
  isActive: boolean;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
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
}

interface CreateCompanyData {
  companyName: string;
  description?: string;
  category?: string;
  subCategory?: string;
  categoryId?: number;
  tagIds?: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  contactPerson?: string;
  employees?: string;
  companySize?: CompanySize;
  selectedEntities?: string[] | null;
}

class CompaniesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAllCompanies(filters?: {
    limit?: number;
    offset?: number;
    page?: number;
    search?: string;
    isActive?: boolean;
    ownerId?: string | number;
  }): Promise<{ companies: Company[]; pagination: PaginationMeta }> {
    const url = new URL(`${API_BASE_URL}/companies`);

    if (filters) {
      if (filters.limit !== undefined) url.searchParams.append('limit', String(filters.limit));
      if (filters.offset !== undefined) url.searchParams.append('offset', String(filters.offset));
      if (filters.page !== undefined) url.searchParams.append('page', String(filters.page));
      if (filters.search) url.searchParams.append('search', filters.search);
      if (filters.isActive !== undefined) url.searchParams.append('isActive', String(filters.isActive));
      if (filters.ownerId) url.searchParams.append('ownerId', String(filters.ownerId));
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
    return { companies: data.data, pagination: data.pagination };
  }

  async getCompanyById(companyId: string): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
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

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async updateCompany(companyId: string, companyData: Partial<CreateCompanyData>): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async deleteCompany(companyId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }

  async approveCompany(companyId: string): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async rejectCompany(companyId: string, rejectionReason?: string): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason: rejectionReason || null }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }
}

export const companiesService = new CompaniesService();
export type { Company, CreateCompanyData };
