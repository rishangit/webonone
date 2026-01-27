import type { Theme, AccentColor } from '../types';

// Export data seeder
export { seedDatabase } from './seedData';

// Theme management utilities
export const applyTheme = (theme: Theme, accentColor: AccentColor) => {
  const root = document.documentElement;
  
  // Apply theme class
  root.classList.remove('light', 'dark');
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
  
  // Apply accent color by setting a data attribute (CSS handles the rest)
  root.setAttribute('data-accent-color', accentColor);
  
  // For immediate feedback, also set CSS variables directly with predefined values
  const colorMap: Record<AccentColor, Record<string, string>> = {
    orange: {
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      secondary: '#f97316',
      bg: 'rgba(234, 88, 12, 0.1)',
      border: 'rgba(234, 88, 12, 0.3)',
      text: '#ea580c',
      buttonText: '#000000',
    },
    red: {
      primary: '#db2777',
      primaryHover: '#be185d',
      secondary: '#ef4444',
      bg: 'rgba(219, 39, 119, 0.1)',
      border: 'rgba(219, 39, 119, 0.3)',
      text: '#db2777',
      buttonText: '#000000',
    },
    green: {
      primary: '#65a30d',
      primaryHover: '#4d7c0f',
      secondary: '#22c55e',
      bg: 'rgba(101, 163, 13, 0.1)',
      border: 'rgba(101, 163, 13, 0.3)',
      text: '#65a30d',
      buttonText: '#000000',
    },
    blue: {
      primary: '#9333ea',
      primaryHover: '#7c3aed',
      secondary: '#3b82f6',
      bg: 'rgba(147, 51, 234, 0.1)',
      border: 'rgba(147, 51, 234, 0.3)',
      text: '#9333ea',
      buttonText: '#ffffff',
    },
    yellow: {
      primary: '#d97706',
      primaryHover: '#b45309',
      secondary: '#eab308',
      bg: 'rgba(217, 119, 6, 0.1)',
      border: 'rgba(217, 119, 6, 0.3)',
      text: '#d97706',
      buttonText: '#000000',
    }
  };
  
  const colors = colorMap[accentColor];
  if (colors) {
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-primary-hover', colors.primaryHover);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--accent-bg', colors.bg);
    root.style.setProperty('--accent-border', colors.border);
    root.style.setProperty('--accent-text', colors.text);
    root.style.setProperty('--accent-button-text', colors.buttonText);
  }
};

// Storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
};

// Performance utilities
export const performance = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  },
  
  now: () => {
    if (typeof window !== 'undefined' && window.performance && window.performance.now) {
      return window.performance.now();
    }
    return Date.now();
  }
};

// String utilities
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  return dateObj.toLocaleTimeString('en-US', { ...defaultOptions, ...options });
};

export const truncateString = (str: string, maxLength: number, suffix = '...') => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

export const capitalizeString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array utilities
export const chunk = <T extends any>(array: T[], size: number): T[][] => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

export const unique = <T extends any>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const groupBy = <T extends any>(array: T[], key: keyof T) => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format avatar URL to ensure it's a full URL
 * @param avatarUrl - The avatar URL (can be full URL or relative path)
 * @param firstName - User's first name for fallback
 * @param lastName - User's last name for fallback
 * @returns Formatted avatar URL or fallback URL
 */
export const formatAvatarUrl = (avatarUrl?: string | null, _firstName?: string, _lastName?: string): string => {
  // If no avatar URL is provided, return empty string
  // The Avatar component's AvatarFallback will handle displaying initials
  if (!avatarUrl) {
    return '';
  }
  
  // If avatar is already a full URL, extract the relative path if it's from our server
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    const baseUrl = typeof window !== 'undefined' && (window as any).__API_URL__ 
      ? (window as any).__API_URL__.replace('/api', '')
      : 'http://localhost:5007';
    
    // If it's from our server, extract the relative path and reconstruct
    if (avatarUrl.startsWith(baseUrl)) {
      const relativePath = avatarUrl.replace(baseUrl, '').replace(/^\/+/, '');
      // Remove 'uploads/' prefix if present (we'll add it back)
      const cleanPath = relativePath.startsWith('uploads/') ? relativePath.slice(8) : relativePath;
      return `${baseUrl}/uploads/${cleanPath}`;
    }
    // If it's an external URL, use it as is
    return avatarUrl;
  }
  
  // If avatar is a relative path, construct the full URL
  // Use config if available, otherwise default to localhost:5007
  const baseUrl = typeof window !== 'undefined' && (window as any).__API_URL__ 
    ? (window as any).__API_URL__.replace('/api', '')
    : 'http://localhost:5007';
  
  // Normalize the path - remove leading slash if present
  let normalizedPath = avatarUrl.startsWith('/') ? avatarUrl.slice(1) : avatarUrl;
  
  // If path doesn't start with 'uploads/', prepend it (for company logos, user avatars, etc.)
  if (!normalizedPath.startsWith('uploads/')) {
    normalizedPath = `uploads/${normalizedPath}`;
  }
  
  return `${baseUrl}/${normalizedPath}`;
};

// Async utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T extends any>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt);
      }
    }
  }
  
  throw lastError;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Deep clone utility
export const deepClone = <T extends any>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any };
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
};