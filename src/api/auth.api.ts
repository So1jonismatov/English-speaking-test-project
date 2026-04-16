import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  LogoutResponse,
  UserResponse,
} from './api.types';

export const authApi = {
  /**
   * Login user
   * POST /login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', data);
    return response.data;
  },

  /**
   * Signup user
   * POST /signup
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await apiClient.post<SignupResponse>('/signup', data);
    return response.data;
  },

  /**
   * Logout user
   * GET /logout
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.get<LogoutResponse>('/logout');
    return response.data;
  },

  /**
   * Get current user info
   * GET /me
   */
  async getUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/me');
    return response.data;
  },
};
