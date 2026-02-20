import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type { LoginRequest, LoginResponse, UserInfo, ChangePasswordRequest } from '@/types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<ApiResponse<LoginResponse>>('/auth/login', data).then((r) => r.data.data),

  logout: () =>
    client.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken }).then((r) => r.data.data),

  getMe: () =>
    client.get<ApiResponse<UserInfo>>('/auth/me').then((r) => r.data.data),

  changePassword: (data: ChangePasswordRequest) =>
    client.put<ApiResponse<null>>('/auth/password', data).then((r) => r.data),
};
