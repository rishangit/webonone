import { config } from '@/config/environment';

const API_BASE_URL = config.apiBaseUrl;

export interface ThemeBasicSetting {
  backgroundColor: string;
  fontColor: string;
}

export interface ThemeTextSetting {
  styleName: string;
  googleFontUrl: string;
  fontFamily: string;
  fontSize: string;
  fontColor?: string;
}

export interface ThemeColorSetting {
  name: string;
  color: string;
}

export interface ThemeFontSetting {
  styleName: string;
  googleFontUrl: string;
  fontFamily: string;
  fontSize: string;
}

export interface ThemeButtonSetting {
  buttonName: string;
  backgroundColor: string;
  fontColor: string;
  textStyleName: string;
  borderColor: string;
  borderRadius: string;
}

export interface ThemeData {
  themeName: string;
  basicSetting: ThemeBasicSetting;
  fontSettings?: ThemeFontSetting[];
  textSettings: ThemeTextSetting[];
  colors?: ThemeColorSetting[];
  buttons?: ThemeButtonSetting[];
}

export interface CompanyWebTheme {
  id: string;
  companyId: string;
  name: string;
  themeData: ThemeData;
  // Convenience fields derived from themeData for previews
  backgroundColor?: string;
  bodyTextColor?: string;
  headingColor?: string;
  googleFontUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateThemeData {
  companyId: string;
  name: string;
  themeData: ThemeData;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateThemeData extends Partial<CreateThemeData> {
  companyId?: string;
}

class CompanyWebThemesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all themes for a company
   */
  async getThemes(companyId: string): Promise<CompanyWebTheme[]> {
    const response = await fetch(`${API_BASE_URL}/company-web-themes?companyId=${companyId}`, {
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
   * Get theme by ID
   */
  async getThemeById(themeId: string): Promise<CompanyWebTheme> {
    const response = await fetch(`${API_BASE_URL}/company-web-themes/${themeId}`, {
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
   * Create new theme
   */
  async createTheme(themeData: CreateThemeData): Promise<CompanyWebTheme> {
    const response = await fetch(`${API_BASE_URL}/company-web-themes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(themeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update theme
   */
  async updateTheme(themeId: string, themeData: UpdateThemeData): Promise<CompanyWebTheme> {
    const response = await fetch(`${API_BASE_URL}/company-web-themes/${themeId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(themeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete theme
   */
  async deleteTheme(themeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/company-web-themes/${themeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const companyWebThemesService = new CompanyWebThemesService();
export type { CreateThemeData, UpdateThemeData };
