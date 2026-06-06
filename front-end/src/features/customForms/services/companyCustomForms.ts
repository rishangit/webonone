import { config } from '@/config/environment';
import type { FormDefinition } from '../types/formDefinition';

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyCustomForm {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  definition: FormDefinition;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomFormData {
  companyId: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  definition?: FormDefinition;
}

export interface UpdateCustomFormData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  definition?: FormDefinition;
}

class CompanyCustomFormsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getForms(companyId: string, activeOnly = false): Promise<CompanyCustomForm[]> {
    const params = new URLSearchParams({ companyId });
    if (activeOnly) params.set('activeOnly', 'true');
    const response = await fetch(`${API_BASE_URL}/company-custom-forms?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getFormById(formId: string): Promise<CompanyCustomForm> {
    const response = await fetch(`${API_BASE_URL}/company-custom-forms/${formId}`, {
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

  async createForm(payload: CreateCustomFormData): Promise<CompanyCustomForm> {
    const response = await fetch(`${API_BASE_URL}/company-custom-forms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async updateForm(formId: string, payload: UpdateCustomFormData): Promise<CompanyCustomForm> {
    const response = await fetch(`${API_BASE_URL}/company-custom-forms/${formId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async duplicateForm(formId: string): Promise<CompanyCustomForm> {
    const response = await fetch(`${API_BASE_URL}/company-custom-forms/${formId}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async deleteForm(formId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-custom-forms/${formId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyCustomFormsService = new CompanyCustomFormsService();
