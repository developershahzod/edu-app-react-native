import { BaseAPI, Configuration } from '../runtime';
import { 
  LoginRequest, 
  Token, 
  AccessTokenResponse, 
  RefreshTokenRequest,
  User
} from '../models';

export class AuthApi extends BaseAPI {
  constructor(configuration: Configuration = {}) {
    super(configuration);
  }

  /**
   * Login for access token (edu-api.qalb.uz)
   */
  async login(loginRequest: LoginRequest): Promise<Token> {
      const formData = new URLSearchParams();
      formData.append('username', loginRequest.username);
      formData.append('password', loginRequest.password);
      formData.append('client_id', 'string'); // Or use a real client ID
      formData.append('client_secret', loginRequest.password); // Matching your curl

      const response = await fetch('https://edu-api.qalb.uz/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data: Token = await response.json();
      return data;
    }

  /**
   * Refresh access token
   */
  async refreshToken(refreshRequest: RefreshTokenRequest): Promise<AccessTokenResponse> {
    return this.request<AccessTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshRequest),
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    return this.request<void>('/auth/logout-all', {
      method: 'POST',
    });
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }
}
