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
    if (loginRequest.client_id) formData.append('client_id', loginRequest.client_id);
    if (loginRequest.client_secret) formData.append('client_secret', loginRequest.client_secret);
    if (loginRequest.scope) formData.append('scope', loginRequest.scope);
    if (loginRequest.grant_type) formData.append('grant_type', loginRequest.grant_type);

    return this.request<Token>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });
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
