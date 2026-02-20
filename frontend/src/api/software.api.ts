import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type { SoftwareResponse, SoftwareRequest } from '@/types/software.types';

export const softwareApi = {
  getAll: () =>
    client.get<ApiResponse<SoftwareResponse[]>>('/softwares').then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<SoftwareResponse>>(`/softwares/${id}`).then((r) => r.data.data),

  create: (data: SoftwareRequest) =>
    client.post<ApiResponse<SoftwareResponse>>('/softwares', data).then((r) => r.data.data),

  update: (id: number, data: SoftwareRequest) =>
    client.put<ApiResponse<SoftwareResponse>>(`/softwares/${id}`, data).then((r) => r.data.data),
};
