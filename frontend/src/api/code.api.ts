import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  CodeGroupResponse,
  CommonCodeResponse,
  CommonCodeRequest,
} from '@/types/commoncode.types';

export const codeApi = {
  getGroups: () =>
    client.get<ApiResponse<CodeGroupResponse[]>>('/codes').then((r) => r.data.data),

  getByGroup: (groupCode: string) =>
    client
      .get<ApiResponse<CommonCodeResponse[]>>(`/codes/${groupCode}`)
      .then((r) => r.data.data),

  create: (data: CommonCodeRequest) =>
    client.post<ApiResponse<CommonCodeResponse>>('/codes', data).then((r) => r.data.data),

  update: (id: number, data: CommonCodeRequest) =>
    client.put<ApiResponse<CommonCodeResponse>>(`/codes/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/codes/${id}`).then((r) => r.data),
};
