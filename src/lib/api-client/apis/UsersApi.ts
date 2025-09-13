import { BaseAPI } from '../runtime';
import {
  User,
  ApiResponse,
} from '../models';

export class UsersApi extends BaseAPI {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>('/users/');
  }

  async getUsersByRole(params: { role: string }): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>(`/users/by-role/${params.role}`);
  }

  async getUser(params: { userId: string }): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${params.userId}`);
  }
}