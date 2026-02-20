import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type { MenuResponse, MenuRequest } from '@/types/menu.types';

export const menuApi = {
  getTree: () =>
    client.get<ApiResponse<MenuResponse[]>>('/menus').then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<MenuResponse>>(`/menus/${id}`).then((r) => r.data.data),

  create: (data: MenuRequest) =>
    client.post<ApiResponse<MenuResponse>>('/menus', data).then((r) => r.data.data),

  update: (id: number, data: MenuRequest) =>
    client.put<ApiResponse<MenuResponse>>(`/menus/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/menus/${id}`).then((r) => r.data),
};
