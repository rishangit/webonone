import { config } from '@/config/environment';
import type { FormFieldValues } from '../types/formDefinition';

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyCustomFormSubmission {
  id: string;
  companyId: string;
  formId: string;
  appointmentId?: string | null;
  clientId?: string | null;
  submittedByUserId?: string | null;
  values: FormFieldValues;
  createdAt?: string;
  formName?: string | null;
  submittedByName?: string | null;
}

export interface CreateFormSubmissionData {
  companyId: string;
  formId: string;
  appointmentId: string;
  clientId?: string | null;
  values: FormFieldValues;
}

class CompanyCustomFormSubmissionsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getByAppointment(appointmentId: string): Promise<CompanyCustomFormSubmission[]> {
    const params = new URLSearchParams({ appointmentId });
    const response = await fetch(
      `${API_BASE_URL}/company-custom-form-submissions?${params}`,
      { method: 'GET', headers: this.getAuthHeaders() }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getById(id: string): Promise<CompanyCustomFormSubmission> {
    const response = await fetch(`${API_BASE_URL}/company-custom-form-submissions/${id}`, {
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

  async createSubmission(payload: CreateFormSubmissionData): Promise<CompanyCustomFormSubmission> {
    const response = await fetch(`${API_BASE_URL}/company-custom-form-submissions`, {
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

  async deleteSubmission(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-custom-form-submissions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyCustomFormSubmissionsService = new CompanyCustomFormSubmissionsService();
