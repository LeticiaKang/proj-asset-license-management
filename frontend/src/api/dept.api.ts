import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type { DeptResponse, DeptRequest, DeptMoveRequest } from '@/types/dept.types';

export const deptApi = {
  getTree: () =>
    client.get<ApiResponse<DeptResponse[]>>('/depts').then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<DeptResponse>>(`/depts/${id}`).then((r) => r.data.data),

  create: (data: DeptRequest) =>
    client.post<ApiResponse<DeptResponse>>('/depts', data).then((r) => r.data.data),

  update: (id: number, data: DeptRequest) =>
    client.put<ApiResponse<DeptResponse>>(`/depts/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/depts/${id}`).then((r) => r.data),

  move: (id: number, data: DeptMoveRequest) =>
    client.put<ApiResponse<DeptResponse>>(`/depts/${id}/move`, data).then((r) => r.data.data),
};
