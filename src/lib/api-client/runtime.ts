import { BASE_API_URL } from './models';

export interface Configuration {
  basePath?: string;
  accessToken?: string | (() => string);
  apiKey?: string | (() => string);
  username?: string;
  password?: string;
  headers?: Record<string, string>;
}

export class ResponseError extends Error {
  public response: Response;
  public body?: any;

  constructor(response: Response, body?: any, message?: string) {
    super(message || `HTTP ${response.status}: ${response.statusText}`);
    this.name = 'ResponseError';
    this.response = response;
    this.body = body;
  }
}

export class BaseAPI {
  protected configuration: Configuration;

  constructor(configuration: Configuration = {}) {
    this.configuration = {
      basePath: BASE_API_URL,
      ...configuration,
    };
  }

  protected async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const url = `${this.configuration.basePath}${path}`;

    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTc2NzM2MzAsInN1YiI6Ijc3ODVlOTZlLTM4ZDEtNGM5Mi1iMTJhLTc3MDE0Y2FlNjUwNyIsInR5cGUiOiJhY2Nlc3MifQ.b47Y9ZBmvpY-NN9LBFJSIPHJ6VEsfpqfHZzhmNTChNA',
      ...(this.configuration.headers || {}),
      ...(init.headers as Record<string, string> || {}),
    };

    // Add authorization header if access token is available

    if (this.configuration.accessToken) {
      const token = typeof this.configuration.accessToken === 'function' 
        ? this.configuration.accessToken() 
        : this.configuration.accessToken;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      ...init,
      headers,
    };

    try {
      const response = await fetch(url, requestInit);
      
      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          // If response body is not JSON, ignore
        }
        throw new ResponseError(response, errorBody);
      }

      // Handle empty responses (204 No Content, etc.)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses, return the response object itself
      return response as unknown as T;
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected async requestFormData<T>(
    path: string,
    formData: FormData,
    init: RequestInit = {}
  ): Promise<T> {
    const url = `${this.configuration.basePath}${path}`;
    
    const headers: Record<string, string> = {
      ...this.configuration.headers,
      ...init.headers,
    };

    // Don't set Content-Type for FormData, let the browser set it with boundary
    delete headers['Content-Type'];

    // Add authorization header if access token is available
    if (this.configuration.accessToken) {
      const token = typeof this.configuration.accessToken === 'function' 
        ? this.configuration.accessToken() 
        : this.configuration.accessToken;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      ...init,
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await fetch(url, requestInit);
      
      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          // If response body is not JSON, ignore
        }
        throw new ResponseError(response, errorBody);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response as unknown as T;
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = options.headers || {};
    if (this.configuration.accessToken) {
      headers['Authorization'] = `Bearer ${this.configuration.accessToken}`;
    }
    options.headers = headers;
    return this.request<T>(url, options);
  }
}

// Global configuration instance
let globalConfiguration: Configuration = {};

export function setGlobalConfiguration(config: Configuration) {
  globalConfiguration = { ...globalConfiguration, ...config };
}

export function getGlobalConfiguration(): Configuration {
  return globalConfiguration;
}

// Helper function to create API instances with global configuration
export function createApiInstance<T extends BaseAPI>(
  ApiClass: new (config: Configuration) => T
): T {
  return new ApiClass(globalConfiguration);
}
