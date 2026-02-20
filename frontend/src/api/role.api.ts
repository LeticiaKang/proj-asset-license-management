import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  RoleResponse,
  RoleRequest,
  RoleMenuPermission,
  RoleMenuUpdateRequest,
} from '@/types/role.types';

export const roleApi = {
  getAll: () =>
    client.get<ApiResponse<RoleResponse[]>>('/roles').then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<RoleResponse>>(`/roles/${id}`).then((r) => r.data.data),

  create: (data: RoleRequest) =>
    client.post<ApiResponse<RoleResponse>>('/roles', data).then((r) => r.data.data),

  update: (id: number, data: RoleRequest) =>
    client.put<ApiResponse<RoleResponse>>(`/roles/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/roles/${id}`).then((r) => r.data),

  getMenuPermissions: (roleId: number) =>
    client
      .get<ApiResponse<RoleMenuPermission[]>>(`/roles/${roleId}/menus`)
      .then((r) => r.data.data),

  updateMenuPermissions: (roleId: number, data: RoleMenuUpdateRequest) =>
    client.put<ApiResponse<null>>(`/roles/${roleId}/menus`, data).then((r) => r.data),
};
