import { config } from '@/config/environment';

const API_BASE_URL = config.apiBaseUrl;
const API_URL = config.apiUrl;

export interface MediaFolder {
  name: string;
  path: string;
}

export interface MediaFile {
  name: string;
  path: string;
  size: number;
  isImage: boolean;
  modifiedAt: string;
}

export interface MediaListResponse {
  folders: MediaFolder[];
  files: MediaFile[];
  path: string;
}

export function getMediaFileUrl(companyId: string, filePath: string): string {
  const base = `${API_URL}/uploads/companies/${companyId}/web/media`;
  const path = filePath ? `/${filePath}` : '';
  return `${base}${path}`;
}

class CompanyWebMediaService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async list(companyId: string, path: string = ''): Promise<MediaListResponse> {
    const params = new URLSearchParams({ companyId });
    if (path) params.set('path', path);
    const response = await fetch(
      `${API_BASE_URL}/company-web-media?${params.toString()}`,
      { method: 'GET', headers: this.getAuthHeaders() }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async createFolder(
    companyId: string,
    folderPath: string,
    name: string
  ): Promise<{ name: string; path: string }> {
    const response = await fetch(`${API_BASE_URL}/company-web-media/folders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ companyId, path: folderPath || undefined, name }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async upload(
    companyId: string,
    folderPath: string,
    files: File[]
  ): Promise<{ name: string; originalName: string; path: string; size: number; mimeType: string }[]> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const token = localStorage.getItem('authToken');
    const url = new URL(`${API_BASE_URL}/company-web-media/upload`);
    url.searchParams.set('companyId', companyId);
    if (folderPath) url.searchParams.set('path', folderPath);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  }

  async delete(
    companyId: string,
    itemPath: string,
    type: 'file' | 'folder'
  ): Promise<void> {
    const params = new URLSearchParams({
      companyId,
      path: itemPath,
      type,
    });
    const response = await fetch(
      `${API_BASE_URL}/company-web-media?${params.toString()}`,
      { method: 'DELETE', headers: this.getAuthHeaders() }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
  }
}

export const companyWebMediaService = new CompanyWebMediaService();
