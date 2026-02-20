import client from './client';
import type { ApiResponse, PageResponse, PageRequest } from '@/types/api.types';
import type {
  MemberResponse,
  MemberRequest,
  MemberSearchCondition,
  MemberAssignmentDetail,
} from '@/types/member.types';

export const memberApi = {
  search: (params: MemberSearchCondition & PageRequest) =>
    client
      .get<ApiResponse<PageResponse<MemberResponse>>>('/members', { params })
      .then((r) => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<MemberResponse>>(`/members/${id}`).then((r) => r.data.data),

  create: (data: MemberRequest) =>
    client.post<ApiResponse<MemberResponse>>('/members', data).then((r) => r.data.data),

  update: (id: number, data: MemberRequest) =>
    client.put<ApiResponse<MemberResponse>>(`/members/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    client.delete<ApiResponse<null>>(`/members/${id}`).then((r) => r.data),

  resign: (id: number, resignDate: string) =>
    client.put<ApiResponse<null>>(`/members/${id}/resign`, { resignDate }).then((r) => r.data),

  getAssignmentDetail: (memberId: number) =>
    client
      .get<ApiResponse<MemberAssignmentDetail>>(`/asset-assignments/members/${memberId}`)
      .then((r) => r.data.data),
};
