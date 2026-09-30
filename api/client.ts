/**
 * Nova CRM - Backend-Agnostic API Client
 * Provides structured request/response boundary and mock adapter runtime.
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Non-JSON response from ${endpoint}`);
      }
      const json = await res.json();
      const val = json.data !== undefined ? json.data : json;
      return (val !== undefined ? val : fallbackData) as T;
    } catch {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`Failed to GET ${endpoint}`);
    }
  }

  async post<T, B = any>(endpoint: string, body: B, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    } catch {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`Failed to POST ${endpoint}`);
    }
  }

  async put<T, B = any>(endpoint: string, body: B, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    } catch {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`Failed to PUT ${endpoint}`);
    }
  }

  async delete<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    } catch {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(`Failed to DELETE ${endpoint}`);
    }
  }
}

export const apiClient = new ApiClient();
