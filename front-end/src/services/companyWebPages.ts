import { config } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface CompanyWebPage {
  id: string;
  companyId: string;
  name: string;
  url: string;
  isActive?: boolean;
  content?: {
    blocks?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      content: string;
      type?: string;
    }>;
    html?: string;
    css?: string;
    js?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWebPageData {
  companyId: string;
  name: string;
  url: string;
  isActive?: boolean;
}

export interface UpdateWebPageData extends Partial<CreateWebPageData> {
  companyId?: string;
  content?: {
    blocks?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      content: string;
      type?: string;
    }>;
    html?: string;
    css?: string;
    js?: string;
  };
}

class CompanyWebPagesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all webpages for a company
   */
  async getWebPages(companyId: string): Promise<CompanyWebPage[]> {
    const response = await fetch(`${API_BASE_URL}/company-web-pages?companyId=${companyId}`, {
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

  /**
   * Get webpage by ID
   */
  async getWebPageById(pageId: string): Promise<CompanyWebPage> {
    const response = await fetch(`${API_BASE_URL}/company-web-pages/${pageId}`, {
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
   * Get webpage by companyId and URL (public endpoint)
   */
  async getWebPageByCompanyAndUrl(companyId: string, url: string): Promise<CompanyWebPage> {
    // Ensure URL starts with / and encode it
    const normalizedUrl = url.startsWith('/') ? url : '/' + url;
    // Remove leading slash for the API call since it will be in the path
    const urlPath = normalizedUrl.substring(1);
    const encodedUrl = encodeURIComponent(urlPath);
    
    const response = await fetch(`${API_BASE_URL}/company-web-pages/public/${companyId}/${encodedUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Create new webpage
   */
  async createWebPage(pageData: CreateWebPageData): Promise<CompanyWebPage> {
    const response = await fetch(`${API_BASE_URL}/company-web-pages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pageData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update webpage
   */
  async updateWebPage(pageId: string, pageData: UpdateWebPageData): Promise<CompanyWebPage> {
    const response = await fetch(`${API_BASE_URL}/company-web-pages/${pageId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pageData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete webpage
   */
  async deleteWebPage(pageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-web-pages/${pageId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyWebPagesService = new CompanyWebPagesService();
export type { CreateWebPageData, UpdateWebPageData };
