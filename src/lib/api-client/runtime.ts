import { BASE_API_URL } from './models';
export const BASE_PATH = BASE_API_URL;

export interface Configuration {
  basePath?: string;
  accessToken?: string | (() => string);
  apiKey?: string | (() => string);
  username?: string;
  password?: string;
  headers?: Record<string, string>;
}

/**
 * Extended Request options supported by our BaseAPI
 * - query: will be appended as query string
 * - body: accept any object; it will be passed through as-is. Upstream code decides if JSON.stringify is needed.
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Record<string, any>;
  body?: any;
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
    // Merge provided configuration with global configuration and sensible defaults
    const global = getGlobalConfiguration();
    this.configuration = {
      basePath: configuration.basePath ?? global.basePath ?? BASE_API_URL,
      accessToken: configuration.accessToken ?? global.accessToken,
      apiKey: configuration.apiKey ?? global.apiKey,
      username: configuration.username ?? global.username,
      password: configuration.password ?? global.password,
      headers: {
        ...(global.headers || {}),
        ...(configuration.headers || {}),
      },
    };
  }

  protected async request<T>(
    path: string,
    init: RequestOptions = {}
  ): Promise<T> {
    // Support query params passed via init.query
    const { query, ...restInit } = init || {};
    const queryString =
      query && Object.keys(query).length ? this.buildQueryString(query) : '';

    const effectiveBasePath =
      this.configuration.basePath ?? getGlobalConfiguration().basePath ?? BASE_API_URL;

    const url = `${effectiveBasePath}${path}${queryString}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(getGlobalConfiguration().headers || {}),
      ...(this.configuration.headers || {}),
      ...(((restInit?.headers as Record<string, string>) || {}) as Record<string, string>),
    };

    // Add authorization header if access token is available (global or instance)
    const configuredToken =
      this.configuration.accessToken ?? getGlobalConfiguration().accessToken;
    if (configuredToken) {
      const token =
        typeof configuredToken === 'function' ? configuredToken() : configuredToken;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      ...(restInit as RequestInit),
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
    init: RequestOptions = {}
  ): Promise<T> {
    const effectiveBasePath =
      this.configuration.basePath ?? getGlobalConfiguration().basePath ?? BASE_API_URL;
    const url = `${effectiveBasePath}${path}`;

    const headers: Record<string, string> = {
      ...(getGlobalConfiguration().headers || {}),
      ...(this.configuration.headers || {}),
      ...((init.headers as Record<string, string>) || {}),
    };

    // Don't set Content-Type for FormData, let the browser set it with boundary
    delete headers['Content-Type'];

    // Add authorization header if access token is available (global or instance)
    const configuredToken =
      this.configuration.accessToken ?? getGlobalConfiguration().accessToken;
    if (configuredToken) {
      const token =
        typeof configuredToken === 'function' ? configuredToken() : configuredToken;
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

}

// Global configuration instance
let globalConfiguration: Configuration = {};

export function setGlobalConfiguration(config: Configuration) {
  globalConfiguration = { ...globalConfiguration, ...config };
}

export function getGlobalConfiguration(): Configuration {
  return globalConfiguration;
}

// Augment RequestInit so API classes can pass query/body without TS errors
declare global {
  interface RequestInit {
    // appended as query string by BaseAPI
    query?: Record<string, any>;
    // allow plain objects; BaseAPI forwards as-is
    body?: any;
  }
}

// Helper function to create API instances with global configuration
export function createApiInstance<T extends BaseAPI>(
  ApiClass: new (config: Configuration) => T
): T {
  return new ApiClass(globalConfiguration);
}
